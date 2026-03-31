import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
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
    const plain = decryptBuffer(Buffer.from(raw.payload, 'base64'), keyMaterial.key);
    const manifest = JSON.parse(plain.toString('utf8')) as VaultManifest;
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
    const record: DocumentRecord = {
      id,
      name: basename(filePath),
      searchableText: extractSearchableText(filePath, buffer),
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
    doc.searchableText = extractSearchableText(filePath, buffer);
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

function extractSearchableText(filePath: string, buffer: Buffer): string {
  const lower = filePath.toLowerCase();
  const textExtensions = ['.txt', '.md', '.json', '.csv', '.xml', '.html', '.log'];
  if (textExtensions.some((ext) => lower.endsWith(ext))) {
    return sanitizeText(buffer.toString('utf8'));
  }
  return '';
}

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 20_000);
}
