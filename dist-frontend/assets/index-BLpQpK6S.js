import{invoke as e}from"@tauri-apps/api/core";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();async function t(t={}){return typeof t==`object`&&Object.freeze(t),await e(`plugin:dialog|open`,{options:t})}async function n(t={}){return typeof t==`object`&&Object.freeze(t),await e(`plugin:dialog|save`,{options:t})}var r=document.getElementById(`app`);r.innerHTML=`
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
`;var i=d(`status`),a=d(`results`),o=d(`recentVaults`),s=d(`healthSummary`),c=!1,l=null,u=5;function d(e){let t=document.getElementById(e);if(!t)throw Error(`Element introuvable: ${e}`);return t}function f(e){return d(e)}function p(e){return f(e).value}function m(e,t=!1){i.textContent=e,i.style.color=t?`#fca5a5`:`#93c5fd`}function h(e){for(let t of e)if(!p(t)?.trim())throw Error(`Champ requis manquant: ${t}`)}function g(e){c=e,document.querySelectorAll(`button`).forEach(t=>{t.disabled=e,t.style.opacity=e?`0.7`:`1`})}function _(){f(`password`).value=``,m(`Session verrouillée (inactivité). Saisis de nouveau le mot de passe.`,!0)}function v(){l!==null&&window.clearTimeout(l);let e=Math.max(1,Number(u))*60*1e3;l=window.setTimeout(_,e)}function y(){v()}async function b(e,t){if(!c)try{g(!0),y();let n=await e();t&&await t(n)}catch(e){m(x(e),!0)}finally{g(!1)}}function x(e){let t=String(e);return t.includes(`Mot de passe actuel invalide`)?`Mot de passe invalide.`:t.includes(`Document introuvable`)?`Document introuvable.`:t.includes(`Version courante introuvable`)?`Version introuvable.`:t.includes(`Champ requis manquant`)?t:t.includes(`API Tauri indisponible`)?`Interface Tauri indisponible.`:`Erreur: ${t}`}async function S(t,n){return await e(t,n)}async function C(){let e=await S(`vault_list`,{vault:p(`vault`),password:p(`password`)});w(e),m(`${e.length} document(s).`)}function w(e){if(a.innerHTML=``,!e.length){a.innerHTML=`<p class="muted">Aucun resultat.</p>`;return}for(let t of e){let e=document.createElement(`div`);e.className=`item`;let n=Array.isArray(t.tags)?t.tags.join(`, `):``;e.innerHTML=`<strong>${t.name}</strong><div class="muted">${t.id}</div><div class="muted">${n}</div>`,e.style.cursor=`pointer`,e.addEventListener(`click`,()=>{f(`docId`).value=t.id,m(`Document sélectionné: ${t.name}`)}),a.appendChild(e)}}function T(){let e=window.localStorage.getItem(`arciveRecentVaults`),t=[];if(e)try{t=JSON.parse(e)}catch{t=[]}if(o.innerHTML=``,!t.length){o.innerHTML=`<p class="muted">Aucun coffre récent.</p>`;return}for(let e of t){let t=document.createElement(`div`);t.className=`item`,t.textContent=e,t.style.cursor=`pointer`,t.addEventListener(`click`,()=>{f(`vault`).value=e,m(`Coffre sélectionné: ${e}`)}),o.appendChild(t)}}function E(e){if(!e)return;let t=window.localStorage.getItem(`arciveRecentVaults`),n=[];if(t)try{n=JSON.parse(t)}catch{n=[]}n=[e,...n.filter(t=>t!==e)].slice(0,5),window.localStorage.setItem(`arciveRecentVaults`,JSON.stringify(n)),T()}document.getElementById(`btnApplySession`)?.addEventListener(`click`,()=>{try{let e=Number(p(`lockMinutes`));if(!Number.isFinite(e)||e<1||e>180)throw Error(`lockMinutes doit être entre 1 et 180`);u=e,v(),m(`Politique session appliquée (${u} min).`)}catch(e){m(String(e),!0)}}),document.getElementById(`btnInit`)?.addEventListener(`click`,async()=>{await b(async()=>(h([`vault`,`password`]),m(`Initialisation du coffre...`),S(`vault_init`,{vault:p(`vault`),password:p(`password`)})),async()=>{m(`Coffre initialise.`),E(p(`vault`)),await C()})}),document.getElementById(`btnImport`)?.addEventListener(`click`,async()=>{await b(async()=>(h([`vault`,`password`,`file`]),m(`Import en cours...`),S(`vault_import`,{vault:p(`vault`),password:p(`password`),file:p(`file`),tagsCsv:p(`tags`)})),async e=>{m(`Document importe: ${e.name}`),await C()})}),document.getElementById(`btnList`)?.addEventListener(`click`,async()=>{await b(async()=>{h([`vault`,`password`]),m(`Chargement des documents...`),await C()})}),document.getElementById(`btnHealthCheck`)?.addEventListener(`click`,async()=>{await b(async()=>{h([`vault`,`password`]),m(`Analyse du coffre...`);let e=await S(`vault_check`,{vault:p(`vault`),password:p(`password`)}),t=e.orphanBlobs.length;s.textContent=`Blobs: ${e.blobFiles}, versions suivies: ${e.trackedVersions}, orphelins: ${t}`,t>0?m(`Diagnostic terminé: ${t} blob(s) orphelin(s) détecté(s).`,!0):m(`Diagnostic terminé: coffre cohérent.`)})}),document.getElementById(`btnBackup`)?.addEventListener(`click`,async()=>{await b(async()=>{h([`vault`,`password`]);let e=await n({defaultPath:`arcive-backup.zip`});if(!e){m(`Sauvegarde annulée.`);return}m(`Création de la sauvegarde...`);let t=await S(`vault_backup`,{vault:p(`vault`),password:p(`password`),out:e});m(`Sauvegarde créée (${t.documents} docs, ${t.versions} versions) vers ${t.outPath}`)})}),document.getElementById(`btnRestoreBackup`)?.addEventListener(`click`,async()=>{await b(async()=>{h([`password`]);let e=await t({multiple:!1,filters:[{name:`Arcive backup`,extensions:[`zip`]}]});if(typeof e!=`string`){m(`Restauration annulée.`);return}let n=await t({directory:!0,multiple:!1});if(typeof n!=`string`){m(`Restauration annulée.`);return}m(`Restauration en cours...`);let r=await S(`vault_restore_backup`,{from:e,vault:n,password:p(`password`)});f(`vault`).value=r.vaultPath,E(r.vaultPath),m(`Coffre restauré (${r.documents} documents) dans ${r.vaultPath}`),await C()})}),document.getElementById(`btnSearch`)?.addEventListener(`click`,async()=>{await b(async()=>{h([`vault`,`password`,`query`]),m(`Recherche...`);let e=await S(`vault_search`,{vault:p(`vault`),password:p(`password`),query:p(`query`)});w(e),m(`${e.length} resultat(s).`)})}),document.getElementById(`btnVersion`)?.addEventListener(`click`,async()=>{await b(async()=>(h([`vault`,`password`,`docId`,`versionFile`]),m(`Ajout de version...`),S(`vault_add_version`,{vault:p(`vault`),password:p(`password`),id:p(`docId`),file:p(`versionFile`),note:p(`versionNote`)||null})),async()=>{m(`Version ajoutée.`),await C()})}),document.getElementById(`btnDelete`)?.addEventListener(`click`,async()=>{await b(async()=>(h([`vault`,`password`,`docId`]),m(`Suppression logique...`),S(`vault_delete`,{vault:p(`vault`),password:p(`password`),id:p(`docId`)})),async()=>{m(`Document envoyé en corbeille.`),await C()})}),document.getElementById(`btnRestore`)?.addEventListener(`click`,async()=>{await b(async()=>(h([`vault`,`password`,`docId`]),m(`Restauration...`),S(`vault_restore`,{vault:p(`vault`),password:p(`password`),id:p(`docId`)})),async()=>{m(`Document restauré.`),await C()})}),document.getElementById(`btnExport`)?.addEventListener(`click`,async()=>{await b(async()=>{h([`vault`,`password`,`docId`,`exportOut`]),m(`Export...`);let e=p(`exportOut`);await S(`vault_export`,{vault:p(`vault`),password:p(`password`),id:p(`docId`),out:e}),m(`Export terminé: ${e}`)})}),document.getElementById(`btnPurge`)?.addEventListener(`click`,async()=>{await b(async()=>(h([`vault`,`password`]),m(`Purge de la corbeille...`),S(`vault_purge`,{vault:p(`vault`),password:p(`password`)})),async e=>{m(`Purge terminée (${e.purged} document(s)).`),await C()})}),document.getElementById(`btnRotatePassword`)?.addEventListener(`click`,async()=>{await b(async()=>{h([`vault`,`password`,`newPassword`]),m(`Rotation du mot de passe...`),await S(`vault_rotate_password`,{vault:p(`vault`),password:p(`password`),newPassword:p(`newPassword`)}),f(`password`).value=p(`newPassword`),f(`newPassword`).value=``,m(`Mot de passe mis à jour.`)})}),document.getElementById(`btnPickVault`)?.addEventListener(`click`,async()=>{await b(async()=>{let e=await t({directory:!0,multiple:!1});typeof e==`string`&&(f(`vault`).value=e,E(e),m(`Coffre sélectionné: ${e}`))})}),document.getElementById(`btnPickImport`)?.addEventListener(`click`,async()=>{await b(async()=>{let e=await t({multiple:!1,filters:[{name:`Documents`,extensions:[`pdf`,`txt`,`md`,`docx`,`odt`]}]});typeof e==`string`&&(f(`file`).value=e,m(`Fichier sélectionné: ${e}`))})}),document.getElementById(`btnPickExport`)?.addEventListener(`click`,async()=>{await b(async()=>{let e=await n({defaultPath:p(`docId`)?`export-${p(`docId`)}.bin`:`export.bin`});e&&(f(`exportOut`).value=e,m(`Fichier d'export choisi: ${e}`))})}),[`click`,`keydown`,`mousemove`].forEach(e=>{window.addEventListener(e,y,{passive:!0})}),v(),T();