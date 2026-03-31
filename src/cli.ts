import { Command } from 'commander';
import { resolve } from 'node:path';
import { VaultStore } from './store.js';

function isJsonMode(): boolean {
  return process.argv.includes('--json');
}

function errorToPayload(error: unknown): { ok: false; error: string } {
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: String(error) };
}

async function openVault(path: string, password: string): Promise<VaultStore> {
  return VaultStore.open(resolve(path), password);
}

const program = new Command();
program.name('arcive').description('Coffre documentaire chiffré local-first').version('0.1.0');

program
  .command('init')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    await VaultStore.create(opts.vault, opts.password);
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, vault: resolve(opts.vault) }));
      return;
    }
    console.log(`Coffre créé: ${resolve(opts.vault)}`);
  });

program
  .command('rotate-password')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe actuel')
  .requiredOption('--new-password <value>', 'Nouveau mot de passe')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    await store.rotatePassword(opts.password, opts.newPassword);
    if (opts.json) {
      console.log(JSON.stringify({ ok: true }));
      return;
    }
    console.log('Mot de passe du coffre mis a jour');
  });

program
  .command('import')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .requiredOption('--file <path>', 'Fichier source')
  .option('--tags <csv>', 'Etiquettes séparées par des virgules')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    const tags = opts.tags ? String(opts.tags).split(',').map((t) => t.trim()) : [];
    const doc = await store.importFile(opts.file, tags.filter(Boolean));
    if (opts.json) {
      console.log(JSON.stringify(doc));
      return;
    }
    console.log(`Importé ${doc.name} (${doc.id})`);
  });

program
  .command('list')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .option('--deleted', 'Inclure les éléments supprimés')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    const docs = store.list(Boolean(opts.deleted));
    if (opts.json) {
      console.log(JSON.stringify(docs));
      return;
    }
    for (const doc of docs) {
      const flag = doc.deletedAt ? '[deleted]' : '[active]';
      console.log(`${flag} ${doc.id} :: ${doc.name} :: ${doc.tags.join(', ')}`);
    }
  });

program
  .command('search')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .requiredOption('--query <text>', 'Texte de recherche')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    const results = store.search(opts.query);
    if (opts.json) {
      console.log(JSON.stringify(results));
      return;
    }
    for (const item of results) {
      console.log(`${item.id} :: ${item.name} :: ${item.tags.join(', ')}`);
    }
  });

program
  .command('version')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .requiredOption('--id <documentId>', 'ID du document')
  .requiredOption('--file <path>', 'Nouveau fichier de version')
  .option('--note <text>', 'Note de version')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    await store.addVersion(opts.id, opts.file, opts.note);
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, id: opts.id }));
      return;
    }
    console.log(`Version ajoutée au document ${opts.id}`);
  });

program
  .command('delete')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .requiredOption('--id <documentId>', 'ID du document')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    await store.softDelete(opts.id);
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, id: opts.id }));
      return;
    }
    console.log(`Document ${opts.id} envoyé en corbeille`);
  });

program
  .command('restore')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .requiredOption('--id <documentId>', 'ID du document')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    await store.restore(opts.id);
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, id: opts.id }));
      return;
    }
    console.log(`Document ${opts.id} restauré`);
  });

program
  .command('purge')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    const count = await store.purgeDeleted();
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, purged: count }));
      return;
    }
    console.log(`${count} document(s) supprimé(s) définitivement`);
  });

program
  .command('export')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .requiredOption('--id <documentId>', 'ID du document')
  .requiredOption('--out <path>', 'Chemin du fichier exporté')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    await store.exportDocument(opts.id, opts.out);
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, out: resolve(opts.out) }));
      return;
    }
    console.log(`Document exporté vers ${resolve(opts.out)}`);
  });

program
  .command('check')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    const report = await store.healthCheck();
    if (opts.json) {
      console.log(JSON.stringify(report));
      return;
    }
    console.log(JSON.stringify(report, null, 2));
  });

program
  .command('backup')
  .requiredOption('--vault <path>', 'Chemin du coffre')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .requiredOption('--out <path>', 'Chemin de l archive de sauvegarde')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const store = await openVault(opts.vault, opts.password);
    const backup = await store.createBackup(opts.out);
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, ...backup }));
      return;
    }
    console.log(`Sauvegarde créée: ${backup.outPath}`);
  });

program
  .command('restore-vault')
  .requiredOption('--from <path>', 'Archive de sauvegarde')
  .requiredOption('--vault <path>', 'Chemin du coffre restauré')
  .requiredOption('--password <value>', 'Mot de passe du coffre')
  .option('--json', 'Sortie JSON')
  .action(async (opts) => {
    const restored = await VaultStore.restoreFromBackup(opts.from, opts.vault, opts.password);
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, ...restored }));
      return;
    }
    console.log(`Coffre restauré: ${restored.vaultPath}`);
  });

program.parseAsync().catch((error: unknown) => {
  if (isJsonMode()) {
    console.log(JSON.stringify(errorToPayload(error)));
    process.exitCode = 1;
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
