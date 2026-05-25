# Definition of Done – Arcive 1.0.0

## 1. Qualite technique

- [x] `npm run build`, `npm run lint`, `npm test`, `npm run tauri:build` verts sur la branche cible
- [x] Couverture de tests jugée suffisante sur:
  - [x] operations coeur (`init/import/list/search/version/delete/restore/purge/export`)
  - [x] backup/restore
  - [x] rotation de mot de passe
  - [x] cas de corruption manifeste/blobs
- [ ] CI `ci.yml` + `release.yml` passants

## 2. UX desktop (Tauri)

Parcours utilisateur teste manuellement (Windows):

- [ ] creation d'un coffre via UI
- [ ] import de fichiers via dialogues natifs
- [ ] recherche (nom / tags / contenu) avec resultats lisibles
- [ ] ajout de version, suppression/restauration, purge corbeille
- [ ] backup ZIP et restore vers un nouveau dossier
- [ ] gestion des coffres recents

Messages:

- [ ] pas de champs "chemin" imposes sans bouton "Parcourir..."
- [ ] messages d'erreur comprehensibles (pas de stacktrace brute)
- [ ] avertissements clairs pour les operations destructrices (purge, restore par dessus un dossier existant)

## 3. Securite

- [x] Derivee de cle Argon2id (memoryCost = 2^16, timeCost = 3, parallelism = 1) documentee
- [x] AES-256-GCM pour blobs + manifeste
- [x] Compat lecture legacy PBKDF2 documentee comme telle
- [x] `THREAT_MODEL.md`, `SECURITY.md`, `AUDIT_READY.md` a jour
- [ ] `SIGNING.md` teste au moins une fois (signature locale reussie)
- [x] Aucun cas de corruption manifeste/blobs ne passe silencieusement
- [x] `healthCheck` coherent sur un coffre valide (0 blobs orphelins)
- [x] Pas de logs ou erreurs contenant du contenu de documents

## 4. Packaging & release

- [x] Build MSI + NSIS via `npm run tauri:build`
- [ ] Signatures Windows verifiables (si certificat disponible)
- [ ] Workflow `release.yml` cree une release GitHub avec artefacts MSI/EXE attaches
- [ ] Tag `v1.0.0` cree uniquement quand toutes les cases ci-dessus sont cochees (ou ecartees avec justification dans `CHANGELOG.md`)

