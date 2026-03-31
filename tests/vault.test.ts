import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VaultStore } from '../src/store.js';

async function fixture(content: string): Promise<{ dir: string; sourceFile: string }> {
  const dir = await mkdtemp(join(tmpdir(), 'arcive-'));
  const sourceFile = join(dir, 'doc.txt');
  await writeFile(sourceFile, content, 'utf8');
  return { dir, sourceFile };
}

describe('VaultStore', () => {
  it('crée, ouvre et importe un document', async () => {
    const { dir, sourceFile } = await fixture('bonjour');
    const vaultPath = join(dir, 'vault');
    const created = await VaultStore.create(vaultPath, 'motdepasse-fort');
    const doc = await created.importFile(sourceFile, ['test']);
    expect(doc.name).toBe('doc.txt');

    const reopened = await VaultStore.open(vaultPath, 'motdepasse-fort');
    const listed = reopened.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(doc.id);
  });

  it('supporte export et versioning', async () => {
    const { dir, sourceFile } = await fixture('version1');
    const vaultPath = join(dir, 'vault');
    const store = await VaultStore.create(vaultPath, 'motdepasse-fort');
    const doc = await store.importFile(sourceFile, ['contrat']);
    await writeFile(sourceFile, 'version2', 'utf8');
    await store.addVersion(doc.id, sourceFile, 'mise à jour');

    const output = join(dir, 'output.txt');
    await store.exportDocument(doc.id, output);
    const content = await readFile(output, 'utf8');
    expect(content).toBe('version2');
  });

  it('refuse un manifeste corrompu au dechiffrement', async () => {
    const { dir, sourceFile } = await fixture('corrupted');
    const vaultPath = join(dir, 'vault');
    const store = await VaultStore.create(vaultPath, 'motdepasse-fort');
    await store.importFile(sourceFile);

    const manifestPath = join(vaultPath, 'manifest.enc.json');
    const original = await readFile(manifestPath, 'utf8');
    const corrupted = original.replace(/payload":\s*"/, 'payload": "AA'); // tronque le payload base64
    await writeFile(manifestPath, corrupted, 'utf8');

    await expect(
      VaultStore.open(vaultPath, 'motdepasse-fort')
    ).rejects.toThrow();
  });

  it('indexe le texte des formats textuels', async () => {
    const { dir, sourceFile } = await fixture('dossier mutuelle 2026');
    const vaultPath = join(dir, 'vault');
    const store = await VaultStore.create(vaultPath, 'motdepasse-fort');
    await store.importFile(sourceFile, ['sante']);

    const byContent = store.search('mutuelle');
    expect(byContent).toHaveLength(1);
  });

  it('tolère les fichiers pdf/docx non extractibles', async () => {
    const { dir } = await fixture('ignored');
    const vaultPath = join(dir, 'vault');
    const store = await VaultStore.create(vaultPath, 'motdepasse-fort');
    const fakePdf = join(dir, 'scan.pdf');
    const fakeDocx = join(dir, 'courrier.docx');
    await writeFile(fakePdf, Buffer.from('pas un vrai pdf'));
    await writeFile(fakeDocx, Buffer.from('pas un vrai docx'));

    const docPdf = await store.importFile(fakePdf, ['scan']);
    const docDocx = await store.importFile(fakeDocx, ['docx']);

    expect(docPdf.searchableText).toBe('');
    expect(docDocx.searchableText).toBe('');
  });

  it('permet la rotation de mot de passe', async () => {
    const { dir, sourceFile } = await fixture('rotation');
    const vaultPath = join(dir, 'vault');
    const store = await VaultStore.create(vaultPath, 'ancien-motdepasse');
    const doc = await store.importFile(sourceFile);
    await store.rotatePassword('ancien-motdepasse', 'nouveau-motdepasse');

    const reopened = await VaultStore.open(vaultPath, 'nouveau-motdepasse');
    expect(reopened.list()[0]?.id).toBe(doc.id);
  });

  it('gère suppression logique puis purge', async () => {
    const { dir, sourceFile } = await fixture('purge-me');
    const vaultPath = join(dir, 'vault');
    const store = await VaultStore.create(vaultPath, 'motdepasse-fort');
    const doc = await store.importFile(sourceFile);
    await store.softDelete(doc.id);
    expect(store.list()).toHaveLength(0);
    expect(store.list(true)).toHaveLength(1);

    const count = await store.purgeDeleted();
    expect(count).toBe(1);
    expect(store.list(true)).toHaveLength(0);
  });

  it('sauvegarde puis restaure un coffre', async () => {
    const { dir, sourceFile } = await fixture('backup-restore');
    const vaultPath = join(dir, 'vault');
    const backupPath = join(dir, 'backup.zip');
    const restoredPath = join(dir, 'restored-vault');
    const store = await VaultStore.create(vaultPath, 'motdepasse-fort');
    await store.importFile(sourceFile, ['archive']);

    const backup = await store.createBackup(backupPath);
    expect(backup.documents).toBe(1);

    const restored = await VaultStore.restoreFromBackup(backupPath, restoredPath, 'motdepasse-fort');
    expect(restored.documents).toBe(1);
    const reopened = await VaultStore.open(restoredPath, 'motdepasse-fort');
    expect(reopened.list()).toHaveLength(1);
  });
});
