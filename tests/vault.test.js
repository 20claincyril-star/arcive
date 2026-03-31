import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VaultStore } from '../src/store.js';
async function fixture(content) {
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
});
