import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import AdmZip from 'adm-zip';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { decryptBuffer, deriveKey, deriveKeyArgon2id, deriveKeyFromConfig, encryptBuffer } from './crypto.js';
import type { DocumentRecord, SearchResult, VaultManifest } from './types.js';

const MANIFEST = 'manifest.enc.json';

function hashBuffer(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function nowIso(): string {
  return new Date().toISOString();
}

export class VaultStore {
  private constructor(
    public readonly root: string,
    private key: Buffer,
    public readonly manifest: VaultManifest
  ) {}

  static async create(root: string, password: string): Promise<VaultStore> {
    const resolvedRoot = resolve(root);
    const keyMaterial = await deriveKeyArgon2id(password);
    await mkdir(join(resolvedRoot, 'blobs'), { recursive: true });
    const manifest: VaultManifest = {
      version: 1,
      salt: keyMaterial.salt.toString('base64'),
      kdf: keyMaterial.kdf,
      algorithm: 'aes-256-gcm',
      docs: {}
    };
    const store = new VaultStore(resolvedRoot, keyMaterial.key, manifest);
    await store.saveManifest();
    return store;
  }

  static async open(root: string, password: string): Promise<VaultStore> {
    const resolvedRoot = resolve(root);
    const manifestPath = join(resolvedRoot, MANIFEST);
    const enc = await readFile(manifestPath);
    const raw = JSON.parse(enc.toString('utf8')) as {
      salt: string;
      payload: string;
      kdf?: VaultManifest['kdf'];
    };
    const keyMaterial = await deriveKeyFromConfig(
      password,
      Buffer.from(raw.salt, 'base64'),
      raw.kdf ?? { algorithm: 'pbkdf2-sha256', iterations: 210_000, keyLength: 32 }
    );
    const cipher = Buffer.from(raw.payload, 'base64');
    const plain = decryptBuffer(cipher, keyMaterial.key);
    const manifest = JSON.parse(plain.toString('utf8')) as VaultManifest;
    plain.fill(0);
    if (!manifest.kdf) {
      const legacy = await deriveKey(password, Buffer.from(manifest.salt, 'base64'));
      manifest.kdf = legacy.kdf;
    }
    return new VaultStore(resolvedRoot, keyMaterial.key, manifest);
  }

  async rotatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const current = await deriveKeyFromConfig(
      currentPassword,
      Buffer.from(this.manifest.salt, 'base64'),
      this.manifest.kdf
    );
    if (!timingSafeEqual(current.key, this.key)) {
      current.key.fill(0);
      throw new Error('Mot de passe actuel invalide');
    }
    const next = await deriveKeyArgon2id(newPassword);
    this.key.fill(0);
    current.key.fill(0);
    this.manifest.salt = next.salt.toString('base64');
    this.manifest.kdf = next.kdf;
    this.key = next.key;
    await this.saveManifest();
  }

  async importFile(filePath: string, tags: string[] = []): Promise<DocumentRecord> {
    const buffer = await readFile(filePath);
    const id = randomUUID();
    const versionId = randomUUID();
    const encrypted = encryptBuffer(buffer, this.key);
    const blobPath = join('blobs', `${versionId}.bin`);
    await writeFile(join(this.root, blobPath), encrypted);
    const timestamp = nowIso();
    const searchableText = await extractSearchableText(filePath, buffer);
    const record: DocumentRecord = {
      id,
      name: basename(filePath),
      searchableText,
      currentVersionId: versionId,
      tags,
      createdAt: timestamp,
      updatedAt: timestamp,
      versions: [
        {
          versionId,
          blobPath,
          size: buffer.byteLength,
          sha256: hashBuffer(buffer),
          createdAt: timestamp,
          source: 'import'
        }
      ]
    };
    this.manifest.docs[id] = record;
    await this.saveManifest();
    return record;
  }

  list(includeDeleted = false): DocumentRecord[] {
    const docs = Object.values(this.manifest.docs);
    return includeDeleted ? docs : docs.filter((doc) => !doc.deletedAt);
  }

  search(query: string): SearchResult[] {
    const normalized = query.trim().toLowerCase();
    return this.list(false)
      .filter((doc) => {
        if (doc.name.toLowerCase().includes(normalized)) {
          return true;
        }
        if (doc.searchableText.toLowerCase().includes(normalized)) {
          return true;
        }
        return doc.tags.some((tag) => tag.toLowerCase().includes(normalized));
      })
      .map((doc) => ({
        id: doc.id,
        name: doc.name,
        tags: doc.tags,
        updatedAt: doc.updatedAt
      }));
  }

  async addVersion(documentId: string, filePath: string, note?: string): Promise<void> {
    const doc = this.manifest.docs[documentId];
    if (!doc || doc.deletedAt) {
      throw new Error('Document introuvable');
    }
    const buffer = await readFile(filePath);
    const versionId = randomUUID();
    const encrypted = encryptBuffer(buffer, this.key);
    const blobPath = join('blobs', `${versionId}.bin`);
    await writeFile(join(this.root, blobPath), encrypted);
    doc.versions.push({
      versionId,
      blobPath,
      size: buffer.byteLength,
      sha256: hashBuffer(buffer),
      createdAt: nowIso(),
      source: 'edit',
      note
    });
    doc.currentVersionId = versionId;
    doc.searchableText = await extractSearchableText(filePath, buffer);
    doc.updatedAt = nowIso();
    await this.saveManifest();
  }

  async softDelete(documentId: string): Promise<void> {
    const doc = this.manifest.docs[documentId];
    if (!doc || doc.deletedAt) {
      throw new Error('Document introuvable');
    }
    doc.deletedAt = nowIso();
    doc.updatedAt = nowIso();
    await this.saveManifest();
  }

  async restore(documentId: string): Promise<void> {
    const doc = this.manifest.docs[documentId];
    if (!doc || !doc.deletedAt) {
      throw new Error('Document non supprimé');
    }
    delete doc.deletedAt;
    doc.updatedAt = nowIso();
    await this.saveManifest();
  }

  async exportDocument(documentId: string, targetPath: string): Promise<void> {
    const doc = this.manifest.docs[documentId];
    if (!doc || doc.deletedAt) {
      throw new Error('Document introuvable');
    }
    const current = doc.versions.find((v) => v.versionId === doc.currentVersionId);
    if (!current) {
      throw new Error('Version courante introuvable');
    }
    const encrypted = await readFile(join(this.root, current.blobPath));
    const plain = decryptBuffer(encrypted, this.key);
    await writeFile(targetPath, plain);
  }

  async createBackup(outPath: string): Promise<{ outPath: string; documents: number; versions: number }> {
    const resolvedOut = resolve(outPath);
    const zip = new AdmZip();
    const manifestPath = join(this.root, MANIFEST);
    const manifest = await readFile(manifestPath);
    zip.addFile(MANIFEST, manifest);

    let versions = 0;
    for (const doc of this.list(true)) {
      for (const version of doc.versions) {
        const blobAbs = join(this.root, version.blobPath);
        const blobData = await readFile(blobAbs);
        zip.addFile(version.blobPath.replaceAll('\\', '/'), blobData);
        versions += 1;
      }
    }
    const meta = {
      format: 'arcive-backup-v1',
      createdAt: nowIso(),
      documents: this.list(true).length,
      versions
    };
    zip.addFile('METADATA.json', Buffer.from(JSON.stringify(meta, null, 2), 'utf8'));
    zip.writeZip(resolvedOut);
    return { outPath: resolvedOut, documents: meta.documents, versions };
  }

  static async restoreFromBackup(
    backupPath: string,
    vaultPath: string,
    password: string
  ): Promise<{ vaultPath: string; documents: number }> {
    const resolvedBackup = resolve(backupPath);
    const resolvedVault = resolve(vaultPath);
    await rm(resolvedVault, { recursive: true, force: true });
    await mkdir(resolvedVault, { recursive: true });
    const zip = new AdmZip(resolvedBackup);
    zip.extractAllTo(resolvedVault, true);

    const store = await VaultStore.open(resolvedVault, password);
    const docs = store.list(true).length;
    const check = await store.healthCheck();
    if (check.orphanBlobs.length > 0) {
      throw new Error(`Restauration incomplète: ${check.orphanBlobs.length} blob(s) orphelin(s).`);
    }
    return { vaultPath: resolvedVault, documents: docs };
  }

  async purgeDeleted(): Promise<number> {
    let purged = 0;
    for (const doc of this.list(true)) {
      if (!doc.deletedAt) {
        continue;
      }
      for (const version of doc.versions) {
        await rm(join(this.root, version.blobPath), { force: true });
      }
      delete this.manifest.docs[doc.id];
      purged += 1;
    }
    if (purged > 0) {
      await this.saveManifest();
    }
    return purged;
  }

  async healthCheck(): Promise<{ blobFiles: number; trackedVersions: number; orphanBlobs: string[] }> {
    const blobsDir = join(this.root, 'blobs');
    await mkdir(blobsDir, { recursive: true });
    const files = await readdir(blobsDir);
    const tracked = new Set<string>();
    let trackedVersions = 0;
    for (const doc of this.list(true)) {
      for (const version of doc.versions) {
        tracked.add(basename(version.blobPath));
        trackedVersions += 1;
      }
    }
    const orphanBlobs = files.filter((file) => !tracked.has(file));
    return { blobFiles: files.length, trackedVersions, orphanBlobs };
  }

  private async saveManifest(): Promise<void> {
    const manifestPath = join(this.root, MANIFEST);
    const plain = Buffer.from(JSON.stringify(this.manifest, null, 2), 'utf8');
    const payload = encryptBuffer(plain, this.key).toString('base64');
    plain.fill(0);
    const content = JSON.stringify(
      { salt: this.manifest.salt, kdf: this.manifest.kdf, payload },
      null,
      2
    );
    await writeFile(manifestPath, content, 'utf8');
  }
}

async function extractSearchableText(filePath: string, buffer: Buffer): Promise<string> {
  const lower = filePath.toLowerCase();
  const textExtensions = ['.txt', '.md', '.json', '.csv', '.xml', '.html', '.log'];
  if (textExtensions.some((ext) => lower.endsWith(ext))) {
    return sanitizeText(buffer.toString('utf8'));
  }
  if (lower.endsWith('.pdf')) {
    return sanitizeText(await extractPdfText(buffer));
  }
  if (lower.endsWith('.docx')) {
    return sanitizeText(await extractDocxText(buffer));
  }
  return '';
}

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 20_000);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const parsed = await parser.getText();
    return parsed.text ?? '';
  } catch {
    return '';
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value ?? '';
  } catch {
    return '';
  }
}
