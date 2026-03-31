import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';

const appRoot = document.getElementById('app') as HTMLDivElement;
appRoot.innerHTML = `
  <h1>Arcive Desktop</h1>
  <p class="muted">Coffre local chiffré, recherche enrichie et diagnostic.</p>
  <div id="status">Prêt.</div>
  <section class="card" style="margin-bottom: 1rem">
    <h3>Session</h3>
    <div class="grid">
      <div class="row">
        <label for="lockMinutes">Verrouillage auto (minutes)</label>
        <input id="lockMinutes" type="number" min="1" max="180" value="5" />
      </div>
      <div class="row">
        <label>&nbsp;</label>
        <button id="btnApplySession">Appliquer la politique session</button>
      </div>
    </div>
  </section>
  <div class="grid">
    <section class="card">
      <h3>Coffre</h3>
      <div class="row">
        <label for="vault">Chemin coffre</label>
        <div style="display:grid;grid-template-columns:1fr auto;gap:.5rem;">
          <input id="vault" placeholder="Choisis un dossier de coffre" />
          <button id="btnPickVault">Parcourir...</button>
        </div>
      </div>
      <div class="row">
        <label for="password">Mot de passe</label>
        <input id="password" type="password" value="demo-pass" />
      </div>
      <button id="btnInit">Initialiser le coffre</button>
    </section>
    <section class="card">
      <h3>Importer</h3>
      <div class="row">
        <label for="file">Fichier</label>
        <div style="display:grid;grid-template-columns:1fr auto;gap:.5rem;">
          <input id="file" placeholder="Choisis un fichier" />
          <button id="btnPickImport">Parcourir...</button>
        </div>
      </div>
      <div class="row">
        <label for="tags">Tags (csv)</label>
        <input id="tags" placeholder="impots,2026" />
      </div>
      <button id="btnImport">Importer le document</button>
    </section>
  </div>
  <section class="card" style="margin-top:1rem">
    <h3>Recherche</h3>
    <div class="row">
      <label for="query">Texte de recherche</label>
      <input id="query" placeholder="facture" />
    </div>
    <div class="grid">
      <button id="btnList">Lister les documents</button>
      <button id="btnSearch">Rechercher</button>
    </div>
    <div class="list" id="results"></div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3>Coffres récents</h3>
    <div id="recentVaults" class="list"></div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3>Diagnostic coffre</h3>
    <div class="grid">
      <button id="btnHealthCheck">Analyser la santé du coffre</button>
      <div id="healthSummary" class="muted">Aucun diagnostic exécuté.</div>
    </div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3>Sauvegarde / transfert</h3>
    <div class="grid">
      <button id="btnBackup">Créer une sauvegarde ZIP</button>
      <button id="btnRestoreBackup">Restaurer depuis un ZIP</button>
    </div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3>Actions document</h3>
    <div class="grid">
      <div>
        <div class="row">
          <label for="docId">ID document</label>
          <input id="docId" placeholder="UUID document" />
        </div>
        <div class="row">
          <label for="versionFile">Fichier nouvelle version</label>
          <input id="versionFile" placeholder="Chemin du fichier version" />
        </div>
        <div class="row">
          <label for="versionNote">Note version</label>
          <input id="versionNote" placeholder="correction" />
        </div>
        <button id="btnVersion">Ajouter une version</button>
      </div>
      <div>
        <div class="row">
          <label for="exportOut">Chemin export</label>
          <div style="display:grid;grid-template-columns:1fr auto;gap:.5rem;">
            <input id="exportOut" placeholder="Choisis un chemin d'export" />
            <button id="btnPickExport">Parcourir...</button>
          </div>
        </div>
        <div class="grid">
          <button id="btnDelete">Supprimer (corbeille)</button>
          <button id="btnRestore">Restaurer</button>
        </div>
        <div class="grid" style="margin-top:.7rem">
          <button id="btnExport">Exporter</button>
          <button id="btnPurge" class="danger">Purger la corbeille</button>
        </div>
      </div>
    </div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3>Sécurité coffre</h3>
    <div class="row">
      <label for="newPassword">Nouveau mot de passe</label>
      <input id="newPassword" type="password" placeholder="nouveau mot de passe" />
    </div>
    <button id="btnRotatePassword">Rotation mot de passe</button>
  </section>
`;

const status = getElement<HTMLDivElement>('status');
const results = getElement<HTMLDivElement>('results');
const recentVaults = getElement<HTMLDivElement>('recentVaults');
const healthSummary = getElement<HTMLDivElement>('healthSummary');
let busy = false;
let lockTimer: number | null = null;
let lockMinutes = 5;

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) {
    throw new Error(`Element introuvable: ${id}`);
  }
  return el;
}

function getInput(id: string): HTMLInputElement {
  return getElement<HTMLInputElement>(id);
}

function getValue(id: string): string {
  return getInput(id).value;
}

function setStatus(message: string, isError = false): void {
  status.textContent = message;
  status.style.color = isError ? '#fca5a5' : '#93c5fd';
}

function requireFields(fields: string[]): void {
  for (const id of fields) {
    const value = getValue(id)?.trim();
    if (!value) {
      throw new Error(`Champ requis manquant: ${id}`);
    }
  }
}

function setBusy(value: boolean): void {
  busy = value;
  const buttons = document.querySelectorAll('button');
  buttons.forEach((btn) => {
    (btn as HTMLButtonElement).disabled = value;
    (btn as HTMLButtonElement).style.opacity = value ? '0.7' : '1';
  });
}

function clearPasswordByLock(): void {
  getInput('password').value = '';
  setStatus(
    'Session verrouillée (inactivité). Saisis de nouveau le mot de passe.',
    true
  );
}

function restartLockTimer(): void {
  if (lockTimer !== null) {
    window.clearTimeout(lockTimer);
  }
  const ms = Math.max(1, Number(lockMinutes)) * 60 * 1000;
  lockTimer = window.setTimeout(clearPasswordByLock, ms);
}

function touchActivity(): void {
  restartLockTimer();
}

async function runAction<T>(
  action: () => Promise<T>,
  onSuccess?: (data: T) => Promise<void> | void
): Promise<void> {
  if (busy) {
    return;
  }
  try {
    setBusy(true);
    touchActivity();
    const data = await action();
    if (onSuccess) {
      await onSuccess(data);
    }
  } catch (error) {
    setStatus(formatUiError(error), true);
  } finally {
    setBusy(false);
  }
}

function formatUiError(error: unknown): string {
  const message = String(error);
  if (message.includes('Mot de passe actuel invalide')) return 'Mot de passe invalide.';
  if (message.includes('Document introuvable')) return 'Document introuvable.';
  if (message.includes('Version courante introuvable')) return 'Version introuvable.';
  if (message.includes('Champ requis manquant')) return message;
  if (message.includes('API Tauri indisponible')) return 'Interface Tauri indisponible.';
  return `Erreur: ${message}`;
}

async function call<T = unknown>(
  cmd: string,
  payload: Record<string, unknown>
): Promise<T> {
  return (await invoke(cmd, payload)) as T;
}

async function refreshList(): Promise<void> {
  const docs = await call<any[]>('vault_list', {
    vault: getValue('vault'),
    password: getValue('password')
  });
  render(docs);
  setStatus(`${docs.length} document(s).`);
}

function render(items: any[]): void {
  results.innerHTML = '';
  if (!items.length) {
    results.innerHTML = '<p class="muted">Aucun resultat.</p>';
    return;
  }
  for (const item of items) {
    const el = document.createElement('div');
    el.className = 'item';
    const tags = Array.isArray(item.tags) ? item.tags.join(', ') : '';
    el.innerHTML = `<strong>${item.name}</strong><div class="muted">${item.id}</div><div class="muted">${tags}</div>`;
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      getInput('docId').value = item.id;
      setStatus(`Document sélectionné: ${item.name}`);
    });
    results.appendChild(el);
  }
}

function loadRecentVaults(): void {
  const raw = window.localStorage.getItem('arciveRecentVaults');
  let items: string[] = [];
  if (raw) {
    try {
      items = JSON.parse(raw) as string[];
    } catch {
      items = [];
    }
  }
  recentVaults.innerHTML = '';
  if (!items.length) {
    recentVaults.innerHTML = '<p class="muted">Aucun coffre récent.</p>';
    return;
  }
  for (const path of items) {
    const el = document.createElement('div');
    el.className = 'item';
    el.textContent = path;
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      getInput('vault').value = path;
      setStatus(`Coffre sélectionné: ${path}`);
    });
    recentVaults.appendChild(el);
  }
}

function rememberVault(path: string): void {
  if (!path) return;
  const raw = window.localStorage.getItem('arciveRecentVaults');
  let items: string[] = [];
  if (raw) {
    try {
      items = JSON.parse(raw) as string[];
    } catch {
      items = [];
    }
  }
  items = [path, ...items.filter((p) => p !== path)].slice(0, 5);
  window.localStorage.setItem('arciveRecentVaults', JSON.stringify(items));
  loadRecentVaults();
}

document.getElementById('btnApplySession')?.addEventListener('click', () => {
  try {
    const value = Number(getValue('lockMinutes'));
    if (!Number.isFinite(value) || value < 1 || value > 180) {
      throw new Error('lockMinutes doit être entre 1 et 180');
    }
    lockMinutes = value;
    restartLockTimer();
    setStatus(`Politique session appliquée (${lockMinutes} min).`);
  } catch (error) {
    setStatus(String(error), true);
  }
});

document.getElementById('btnInit')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password']);
      setStatus('Initialisation du coffre...');
      return call('vault_init', {
        vault: getValue('vault'),
        password: getValue('password')
      });
    },
    async () => {
      setStatus('Coffre initialise.');
      rememberVault(getValue('vault'));
      await refreshList();
    }
  );
});

document.getElementById('btnImport')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password', 'file']);
      setStatus('Import en cours...');
      return call('vault_import', {
        vault: getValue('vault'),
        password: getValue('password'),
        file: getValue('file'),
        tagsCsv: getValue('tags')
      });
    },
    async (doc: any) => {
      setStatus(`Document importe: ${doc.name}`);
      await refreshList();
    }
  );
});

document.getElementById('btnList')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password']);
    setStatus('Chargement des documents...');
    await refreshList();
  });
});

document.getElementById('btnHealthCheck')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password']);
    setStatus('Analyse du coffre...');
    const report = await call<{ blobFiles: number; trackedVersions: number; orphanBlobs: string[] }>(
      'vault_check',
      {
        vault: getValue('vault'),
        password: getValue('password')
      }
    );
    const orphan = report.orphanBlobs.length;
    healthSummary.textContent = `Blobs: ${report.blobFiles}, versions suivies: ${report.trackedVersions}, orphelins: ${orphan}`;
    if (orphan > 0) {
      setStatus(`Diagnostic terminé: ${orphan} blob(s) orphelin(s) détecté(s).`, true);
    } else {
      setStatus('Diagnostic terminé: coffre cohérent.');
    }
  });
});

document.getElementById('btnBackup')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password']);
    const outPath = await save({
      defaultPath: 'arcive-backup.zip'
    });
    if (!outPath) {
      setStatus('Sauvegarde annulée.');
      return;
    }
    setStatus('Création de la sauvegarde...');
    const result = await call<{ outPath: string; documents: number; versions: number }>('vault_backup', {
      vault: getValue('vault'),
      password: getValue('password'),
      out: outPath
    });
    setStatus(
      `Sauvegarde créée (${result.documents} docs, ${result.versions} versions) vers ${result.outPath}`
    );
  });
});

document.getElementById('btnRestoreBackup')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['password']);
    const backupPath = await open({
      multiple: false,
      filters: [{ name: 'Arcive backup', extensions: ['zip'] }]
    });
    if (typeof backupPath !== 'string') {
      setStatus('Restauration annulée.');
      return;
    }
    const vaultDir = await open({ directory: true, multiple: false });
    if (typeof vaultDir !== 'string') {
      setStatus('Restauration annulée.');
      return;
    }
    setStatus('Restauration en cours...');
    const restored = await call<{ vaultPath: string; documents: number }>('vault_restore_backup', {
      from: backupPath,
      vault: vaultDir,
      password: getValue('password')
    });
    getInput('vault').value = restored.vaultPath;
    rememberVault(restored.vaultPath);
    setStatus(`Coffre restauré (${restored.documents} documents) dans ${restored.vaultPath}`);
    await refreshList();
  });
});

document.getElementById('btnSearch')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password', 'query']);
    setStatus('Recherche...');
    const docs = await call<any[]>('vault_search', {
      vault: getValue('vault'),
      password: getValue('password'),
      query: getValue('query')
    });
    render(docs);
    setStatus(`${docs.length} resultat(s).`);
  });
});

document.getElementById('btnVersion')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password', 'docId', 'versionFile']);
      setStatus('Ajout de version...');
      return call('vault_add_version', {
        vault: getValue('vault'),
        password: getValue('password'),
        id: getValue('docId'),
        file: getValue('versionFile'),
        note: getValue('versionNote') || null
      });
    },
    async () => {
      setStatus('Version ajoutée.');
      await refreshList();
    }
  );
});

document.getElementById('btnDelete')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password', 'docId']);
      setStatus('Suppression logique...');
      return call('vault_delete', {
        vault: getValue('vault'),
        password: getValue('password'),
        id: getValue('docId')
      });
    },
    async () => {
      setStatus('Document envoyé en corbeille.');
      await refreshList();
    }
  );
});

document.getElementById('btnRestore')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password', 'docId']);
      setStatus('Restauration...');
      return call('vault_restore', {
        vault: getValue('vault'),
        password: getValue('password'),
        id: getValue('docId')
      });
    },
    async () => {
      setStatus('Document restauré.');
      await refreshList();
    }
  );
});

document.getElementById('btnExport')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password', 'docId', 'exportOut']);
    setStatus('Export...');
    const out = getValue('exportOut');
    await call('vault_export', {
      vault: getValue('vault'),
      password: getValue('password'),
      id: getValue('docId'),
      out
    });
    setStatus(`Export terminé: ${out}`);
  });
});

document.getElementById('btnPurge')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password']);
      setStatus('Purge de la corbeille...');
      return call<{ purged: number }>('vault_purge', {
        vault: getValue('vault'),
        password: getValue('password')
      });
    },
    async (response) => {
      setStatus(`Purge terminée (${response.purged} document(s)).`);
      await refreshList();
    }
  );
});

document
  .getElementById('btnRotatePassword')
  ?.addEventListener('click', async () => {
    await runAction(async () => {
      requireFields(['vault', 'password', 'newPassword']);
      setStatus('Rotation du mot de passe...');
      await call('vault_rotate_password', {
        vault: getValue('vault'),
        password: getValue('password'),
        newPassword: getValue('newPassword')
      });
      getInput('password').value = getValue('newPassword');
      getInput('newPassword').value = '';
      setStatus('Mot de passe mis à jour.');
    });
  });

document
  .getElementById('btnPickVault')
  ?.addEventListener('click', async () => {
    await runAction(async () => {
      const selected = await open({
        directory: true,
        multiple: false
      });
      if (typeof selected === 'string') {
        getInput('vault').value = selected;
        rememberVault(selected);
        setStatus(`Coffre sélectionné: ${selected}`);
      }
    });
  });

document
  .getElementById('btnPickImport')
  ?.addEventListener('click', async () => {
    await runAction(async () => {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Documents',
            extensions: ['pdf', 'txt', 'md', 'docx', 'odt']
          }
        ]
      });
      if (typeof selected === 'string') {
        getInput('file').value = selected;
        setStatus(`Fichier sélectionné: ${selected}`);
      }
    });
  });

document
  .getElementById('btnPickExport')
  ?.addEventListener('click', async () => {
    await runAction(async () => {
      const defaultName = getValue('docId')
        ? `export-${getValue('docId')}.bin`
        : 'export.bin';
      const selected = await save({
        defaultPath: defaultName
      });
      if (selected) {
        getInput('exportOut').value = selected;
        setStatus(`Fichier d'export choisi: ${selected}`);
      }
    });
  });

['click', 'keydown', 'mousemove'].forEach((evt) => {
  window.addEventListener(evt, touchActivity, { passive: true });
});
restartLockTimer();
loadRecentVaults();

