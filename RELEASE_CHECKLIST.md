# Checklist "Pret open-source"

- [x] Licence definie (`Apache-2.0`)
- [x] README d'installation et usage
- [x] CONTRIBUTING + SECURITY + CHANGELOG
- [x] Tests unitaires de base
- [x] Build TypeScript sans erreur
- [x] KDF Argon2id + rotation de mot de passe
- [x] Bootstrap Tauri (structure `src-tauri` + scripts desktop)
- [x] Build desktop valide (MSI + NSIS)
---

## Definition of Done 1.0.0 (proposee)

### Qualite technique

- [ ] `npm run build`, `npm run lint`, `npm test`, `npm run tauri:build` verts sur la branche cible
- [ ] Couverture de tests jugée suffisante sur:
  - [ ] operations coeur (`init/import/list/search/version/delete/restore/purge/export`)
  - [ ] backup/restore
  - [ ] rotation de mot de passe
  - [ ] cas de corruption manifeste/blobs
- [ ] CI `ci.yml` + `release.yml` passants

### UX desktop

- [ ] Parcours utilisateur "standard" valide:
  - [ ] creation d'un coffre via UI
  - [ ] import de documents via dialogue natif
  - [ ] recherche (nom / tags / contenu) lisible
  - [ ] versioning + suppression/restauration
  - [ ] backup / restore depuis la UI
- [ ] Messages d'erreur comprehensibles (pas de stacktrace brute)

### Securite

- [ ] Parametres Argon2id figes et documentes dans `crypto.ts` + `THREAT_MODEL.md`
- [ ] AES-256-GCM utilise partout pour blobs + manifeste
- [ ] Modele de menaces (`THREAT_MODEL.md`) et politique (`SECURITY.md`) a jour
- [ ] Checklist d'audit (`AUDIT_READY.md`) completee
- [ ] Processus de signature documente (`SIGNING.md`) et teste au moins une fois

### Conditions pour tagger 1.0.0

- Tous les points ci-dessus coches (ou justifies explicitement dans le changelog)
- Pas de bug critique connu sur:
  - la perte de donnees
  - la corruption silencieuse
  - la fuite de contenu en clair hors du coffre


La publication est possible pour un prototype (`v0.x`), mais pas encore en "stable 1.0.0".
