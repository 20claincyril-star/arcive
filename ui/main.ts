import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { initI18n, applyI18n, t } from './i18n.js';

const appRoot = document.getElementById('app') as HTMLDivElement;
appRoot.innerHTML = `
  <header class="app-header">
    <div>
      <h1 data-i18n="app.title">Arcive Desktop</h1>
      <p class="muted" data-i18n="app.subtitle">Coffre local chiffré, recherche enrichie et diagnostic.</p>
    </div>
    <div class="app-header-actions">
      <label for="langSelect" data-i18n="header.langLabel">Langue</label>
      <select id="langSelect" aria-label="Language">
        <option value="fr">FR</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
      <button id="btnHelp" type="button" data-i18n-title="header.helpBtn" title="Aide">?</button>
    </div>
  </header>
  <div id="main-ui">
  <div id="status" data-i18n="status.ready">Prêt.</div>
  <section class="card" style="margin-bottom: 1rem">
    <h3 data-i18n="session.title">Session</h3>
    <div class="grid">
      <div class="row">
        <label for="lockMinutes" data-i18n="session.lockMinutes">Verrouillage auto (minutes)</label>
        <input id="lockMinutes" type="number" min="1" max="180" value="5" />
      </div>
      <div class="row">
        <label>&nbsp;</label>
        <button id="btnApplySession" data-i18n="session.applyBtn">Appliquer la politique session</button>
      </div>
    </div>
  </section>
  <div class="grid">
    <section class="card">
      <h3 data-i18n="vault.title">Coffre</h3>
      <div class="row">
        <label for="vault" data-i18n="vault.pathLabel">Chemin coffre</label>
        <div style="display:grid;grid-template-columns:1fr auto;gap:.5rem;">
          <input id="vault" data-i18n-placeholder="vault.pathPlaceholder" placeholder="Choisis un dossier de coffre" />
          <button id="btnPickVault" data-i18n="vault.browseBtn">Parcourir...</button>
        </div>
      </div>
      <div class="row">
        <label for="password" data-i18n="vault.passwordLabel">Mot de passe</label>
        <input id="password" type="password" value="demo-pass" />
      </div>
      <button id="btnInit" data-i18n="vault.initBtn">Initialiser le coffre</button>
    </section>
    <section class="card">
      <h3 data-i18n="import.title">Importer</h3>
      <div class="row">
        <label for="file" data-i18n="import.fileLabel">Fichier</label>
        <div style="display:grid;grid-template-columns:1fr auto;gap:.5rem;">
          <input id="file" data-i18n-placeholder="import.filePlaceholder" placeholder="Choisis un fichier" />
          <button id="btnPickImport" data-i18n="import.browseBtn">Parcourir...</button>
        </div>
      </div>
      <div class="row">
        <label for="tags" data-i18n="import.tagsLabel">Tags (csv)</label>
        <input id="tags" data-i18n-placeholder="import.tagsPlaceholder" placeholder="impots,2026" />
      </div>
      <button id="btnImport" data-i18n="import.importBtn">Importer le document</button>
    </section>
  </div>
  <section class="card" style="margin-top:1rem">
    <h3 data-i18n="search.title">Recherche</h3>
    <div class="row">
      <label for="query" data-i18n="search.queryLabel">Texte de recherche</label>
      <input id="query" data-i18n-placeholder="search.queryPlaceholder" placeholder="facture" />
    </div>
    <div class="grid">
      <button id="btnList" data-i18n="search.listBtn">Lister les documents</button>
      <button id="btnSearch" data-i18n="search.searchBtn">Rechercher</button>
    </div>
    <div class="list" id="results"></div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3 data-i18n="recent.title">Coffres récents</h3>
    <div id="recentVaults" class="list"></div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3 data-i18n="diagnostic.title">Diagnostic coffre</h3>
    <div class="grid">
      <button id="btnHealthCheck" data-i18n="diagnostic.analyzeBtn">Analyser la santé du coffre</button>
      <div id="healthSummary" class="muted" data-i18n="diagnostic.none">Aucun diagnostic exécuté.</div>
    </div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3 data-i18n="backup.title">Sauvegarde / transfert</h3>
    <div class="grid">
      <button id="btnBackup" data-i18n="backup.createBtn">Créer une sauvegarde ZIP</button>
      <button id="btnRestoreBackup" data-i18n="backup.restoreBtn">Restaurer depuis un ZIP</button>
    </div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3 data-i18n="doc.title">Actions document</h3>
    <div class="grid">
      <div>
        <div class="row">
          <label for="docId" data-i18n="doc.idLabel">ID document</label>
          <input id="docId" data-i18n-placeholder="doc.idPlaceholder" placeholder="UUID document" />
        </div>
        <div class="row">
          <label for="versionFile" data-i18n="doc.versionFileLabel">Fichier nouvelle version</label>
          <input id="versionFile" data-i18n-placeholder="doc.versionFilePlaceholder" placeholder="Chemin du fichier version" />
        </div>
        <div class="row">
          <label for="versionNote" data-i18n="doc.versionNoteLabel">Note version</label>
          <input id="versionNote" data-i18n-placeholder="doc.versionNotePlaceholder" placeholder="correction" />
        </div>
        <button id="btnVersion" data-i18n="doc.addVersionBtn">Ajouter une version</button>
      </div>
      <div>
        <div class="row">
          <label for="exportOut" data-i18n="doc.exportPathLabel">Chemin export</label>
          <div style="display:grid;grid-template-columns:1fr auto;gap:.5rem;">
            <input id="exportOut" data-i18n-placeholder="doc.exportPathPlaceholder" placeholder="Choisis un chemin d'export" />
            <button id="btnPickExport" data-i18n="doc.browseExportBtn">Parcourir...</button>
          </div>
        </div>
        <div class="grid">
          <button id="btnDelete" data-i18n="doc.deleteBtn">Supprimer (corbeille)</button>
          <button id="btnRestore" data-i18n="doc.restoreBtn">Restaurer</button>
        </div>
        <div class="grid" style="margin-top:.7rem">
          <button id="btnExport" data-i18n="doc.exportBtn">Exporter</button>
          <button id="btnPurge" class="danger" data-i18n="doc.purgeBtn">Purger la corbeille</button>
        </div>
      </div>
    </div>
  </section>
  <section class="card" style="margin-top:1rem">
    <h3 data-i18n="security.title">Sécurité coffre</h3>
    <div class="row">
      <label for="newPassword" data-i18n="security.newPasswordLabel">Nouveau mot de passe</label>
      <input id="newPassword" type="password" data-i18n-placeholder="security.newPasswordPlaceholder" placeholder="nouveau mot de passe" />
    </div>
    <button id="btnRotatePassword" data-i18n="security.rotateBtn">Rotation mot de passe</button>
  </section>
  </div>
  <section id="help-panel" class="help-panel hidden">
    <h2 data-i18n="help.title">Aide Arcive</h2>
    <p data-i18n="help.intro">Arcive est un coffre documentaire local chiffré.</p>
    <h3 data-i18n="help.vaultTitle">Coffre</h3>
    <p data-i18n="help.vaultBody">Choisis un dossier, saisis le mot de passe et initialise le coffre.</p>
    <h3 data-i18n="help.importTitle">Import</h3>
    <p data-i18n="help.importBody">Sélectionne un fichier, ajoute des tags CSV optionnels, puis importe.</p>
    <h3 data-i18n="help.searchTitle">Recherche</h3>
    <p data-i18n="help.searchBody">Liste tous les documents ou recherche par texte.</p>
    <h3 data-i18n="help.docTitle">Documents</h3>
    <p data-i18n="help.docBody">Clique un résultat pour remplir l'ID.</p>
    <h3 data-i18n="help.backupTitle">Sauvegarde</h3>
    <p data-i18n="help.backupBody">Crée un ZIP chiffré du coffre ou restaure depuis une sauvegarde.</p>
    <h3 data-i18n="help.securityTitle">Sécurité</h3>
    <p data-i18n="help.securityBody">La session se verrouille après inactivité.</p>
    <button id="btnBackFromHelp" type="button" data-i18n="help.backBtn">Retour à l'application</button>
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
    throw new Error(t('error.elementNotFound', { id }));
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

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function requireFields(fields: string[]): void {
  for (const id of fields) {
    const value = getValue(id)?.trim();
    if (!value) {
      throw new Error(t('error.requiredField', { field: id }));
    }
  }
}

function setBusy(value: boolean): void {
  busy = value;
  const buttons = document.querySelectorAll('button');
  buttons.forEach((btn) => {
    (btn as HTMLButtonElement).disabled = value;
  });
  document.body.classList.toggle('arcive-busy', value);
}

function clearPasswordByLock(): void {
  getInput('password').value = '';
  setStatus(
    t('status.sessionLocked'),
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
  const raw = normalizeErrorMessage(error);
  const message = raw.split('\n')[0] ?? raw;
  if (message.includes('Mot de passe actuel invalide')) return t('error.invalidPassword');
  if (message.includes('Document introuvable')) return t('error.documentNotFound');
  if (message.includes('Version courante introuvable')) return t('error.versionNotFound');
  if (message.includes('Champ requis manquant')) return message;
  if (message.includes('API Tauri indisponible')) return t('error.tauriUnavailable');
  if (message.toLowerCase().includes('enoent')) {
    return t('error.pathNotFound');
  }
  if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('access')) {
    return t('error.accessDenied');
  }
  return t('error.generic', { message });
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
  setStatus(t('status.documentsCount', { count: docs.length }));
}

function render(items: any[]): void {
  results.innerHTML = '';
  if (!items.length) {
    results.innerHTML = `<p class="muted">${t('search.noResults')}</p>`;
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
      setStatus(t('status.documentSelected', { name: item.name }));
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
    recentVaults.innerHTML = `<p class="muted">${t('recent.none')}</p>`;
    return;
  }
  for (const path of items) {
    const el = document.createElement('div');
    el.className = 'item';
    el.textContent = path;
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      getInput('vault').value = path;
      setStatus(t('status.vaultSelected', { path }));
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
      throw new Error(t('error.lockMinutesRange'));
    }
    lockMinutes = value;
    restartLockTimer();
    setStatus(t('status.sessionPolicyApplied', { minutes: lockMinutes }));
  } catch (error) {
    setStatus(formatUiError(error), true);
  }
});

document.getElementById('btnInit')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password']);
      setStatus(t('status.vaultInitInProgress'));
      return call('vault_init', {
        vault: getValue('vault'),
        password: getValue('password')
      });
    },
    async () => {
      setStatus(t('status.vaultInitialized'));
      rememberVault(getValue('vault'));
      await refreshList();
    }
  );
});

document.getElementById('btnImport')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password', 'file']);
      setStatus(t('status.importInProgress'));
      return call('vault_import', {
        vault: getValue('vault'),
        password: getValue('password'),
        file: getValue('file'),
        tagsCsv: getValue('tags')
      });
    },
    async (doc: any) => {
      setStatus(t('status.documentImported', { name: doc.name }));
      await refreshList();
    }
  );
});

document.getElementById('btnList')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password']);
    setStatus(t('status.loadingDocuments'));
    await refreshList();
  });
});

document.getElementById('btnHealthCheck')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password']);
    setStatus(t('status.healthCheckInProgress'));
    const report = await call<{ blobFiles: number; trackedVersions: number; orphanBlobs: string[] }>(
      'vault_check',
      {
        vault: getValue('vault'),
        password: getValue('password')
      }
    );
    const orphan = report.orphanBlobs.length;
    healthSummary.textContent = t('diagnostic.summary', { blobs: report.blobFiles, versions: report.trackedVersions, orphans: orphan });
    if (orphan > 0) {
      setStatus(t('status.healthOrphans', { count: orphan }), true);
    } else {
      setStatus(t('status.healthOk'));
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
      setStatus(t('status.backupCancelled'));
      return;
    }
    setStatus(t('status.backupInProgress'));
    const result = await call<{ outPath: string; documents: number; versions: number }>('vault_backup', {
      vault: getValue('vault'),
      password: getValue('password'),
      out: outPath
    });
    setStatus(
      t('status.backupCreated', { docs: result.documents, versions: result.versions, path: result.outPath })
    );
  });
});

document.getElementById('btnRestoreBackup')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['password']);
    const backupPath = await open({
      multiple: false,
      filters: [{ name: t('dialog.backupFilter'), extensions: ['zip'] }]
    });
    if (typeof backupPath !== 'string') {
      setStatus(t('status.restoreCancelledNoFile'));
      return;
    }
    const vaultDir = await open({ directory: true, multiple: false });
    if (typeof vaultDir !== 'string') {
      setStatus(t('status.restoreCancelledNoVault'));
      return;
    }
    setStatus(t('status.restoreInProgress'));
    const restored = await call<{ vaultPath: string; documents: number }>('vault_restore_backup', {
      from: backupPath,
      vault: vaultDir,
      password: getValue('password')
    });
    getInput('vault').value = restored.vaultPath;
    rememberVault(restored.vaultPath);
    setStatus(t('status.vaultRestored', { count: restored.documents, path: restored.vaultPath }));
    await refreshList();
  });
});

document.getElementById('btnSearch')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password', 'query']);
    setStatus(t('status.searchInProgress'));
    const docs = await call<any[]>('vault_search', {
      vault: getValue('vault'),
      password: getValue('password'),
      query: getValue('query')
    });
    render(docs);
    setStatus(t('status.searchResults', { count: docs.length }));
  });
});

document.getElementById('btnVersion')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password', 'docId', 'versionFile']);
      setStatus(t('status.versionAdding'));
      return call('vault_add_version', {
        vault: getValue('vault'),
        password: getValue('password'),
        id: getValue('docId'),
        file: getValue('versionFile'),
        note: getValue('versionNote') || null
      });
    },
    async () => {
      setStatus(t('status.versionAdded'));
      await refreshList();
    }
  );
});

document.getElementById('btnDelete')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password', 'docId']);
      setStatus(t('status.deleteInProgress'));
      return call('vault_delete', {
        vault: getValue('vault'),
        password: getValue('password'),
        id: getValue('docId')
      });
    },
    async () => {
      setStatus(t('status.documentTrashed'));
      await refreshList();
    }
  );
});

document.getElementById('btnRestore')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password', 'docId']);
      setStatus(t('status.documentRestoring'));
      return call('vault_restore', {
        vault: getValue('vault'),
        password: getValue('password'),
        id: getValue('docId')
      });
    },
    async () => {
      setStatus(t('status.documentRestored'));
      await refreshList();
    }
  );
});

document.getElementById('btnExport')?.addEventListener('click', async () => {
  await runAction(async () => {
    requireFields(['vault', 'password', 'docId', 'exportOut']);
    setStatus(t('status.exportInProgress'));
    const out = getValue('exportOut');
    await call('vault_export', {
      vault: getValue('vault'),
      password: getValue('password'),
      id: getValue('docId'),
      out
    });
    setStatus(t('status.exportDone', { path: out }));
  });
});

document.getElementById('btnPurge')?.addEventListener('click', async () => {
  await runAction(
    async () => {
      requireFields(['vault', 'password']);
      setStatus(t('status.purgeInProgress'));
      return call<{ purged: number }>('vault_purge', {
        vault: getValue('vault'),
        password: getValue('password')
      });
    },
    async (response) => {
      setStatus(t('status.purgeDone', { count: response.purged }));
      await refreshList();
    }
  );
});

document
  .getElementById('btnRotatePassword')
  ?.addEventListener('click', async () => {
    await runAction(async () => {
      requireFields(['vault', 'password', 'newPassword']);
      setStatus(t('status.passwordRotating'));
      await call('vault_rotate_password', {
        vault: getValue('vault'),
        password: getValue('password'),
        newPassword: getValue('newPassword')
      });
      getInput('password').value = getValue('newPassword');
      getInput('newPassword').value = '';
      setStatus(t('status.passwordUpdated'));
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
        setStatus(t('status.vaultSelected', { path: selected }));
      } else {
        setStatus(t('status.vaultPickCancelled'));
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
            name: t('dialog.documentsFilter'),
            extensions: ['pdf', 'txt', 'md', 'docx', 'odt']
          }
        ]
      });
      if (typeof selected === 'string') {
        getInput('file').value = selected;
        setStatus(t('status.fileSelected', { path: selected }));
      } else {
        setStatus(t('status.filePickCancelled'));
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
        setStatus(t('status.exportPathSelected', { path: selected }));
      } else {
        setStatus(t('status.exportPathCancelled'));
      }
    });
  });

['click', 'keydown', 'mousemove'].forEach((evt) => {
  window.addEventListener(evt, touchActivity, { passive: true });
});
restartLockTimer();
loadRecentVaults();
const mainUi = getElement<HTMLDivElement>('main-ui');
const helpPanel = getElement<HTMLElement>('help-panel');

function showHelp(): void {
  mainUi.style.display = 'none';
  helpPanel.classList.remove('hidden');
  helpPanel.style.display = 'block';
  applyI18n(helpPanel);
}

function hideHelp(): void {
  helpPanel.classList.add('hidden');
  helpPanel.style.display = 'none';
  mainUi.style.display = 'block';
  applyI18n(mainUi);
}

document.getElementById('btnHelp')?.addEventListener('click', showHelp);
document.getElementById('btnBackFromHelp')?.addEventListener('click', hideHelp);

initI18n(() => {
  applyI18n();
  loadRecentVaults();
  if (!healthSummary.hasAttribute('data-health')) {
    healthSummary.textContent = t('diagnostic.none');
  }
});
applyI18n();
setStatus(t('status.ready'));
