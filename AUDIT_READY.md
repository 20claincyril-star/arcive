# Audit Readiness Checklist

## Etat actuel

- [x] Build reproductible local (`npm run build`, `npm run tauri:build`)
- [x] Lint et tests automatises (`npm run lint`, `npm test`)
- [x] Journal des changements (`CHANGELOG.md`)
- [x] Politique de securite (`SECURITY.md`)
- [x] Modele de menaces initial (`THREAT_MODEL.md`)

## A completer avant audit externe

- [ ] campagne de tests manuels UI desktop (cas limites + erreurs)
- [ ] tests d'integration dedies au pont Tauri/CLI
- [ ] revue de zeroization memoire des secrets
- [ ] verification des fichiers temporaires export/edition
- [ ] pipeline CI avec publication artefacts signee

## Pieces a fournir a l'auditeur

- code source + historique
- rapports `build/lint/test`
- architecture (`ARCHITECTURE.md`)
- politique securite (`SECURITY.md`)
- modele de menaces (`THREAT_MODEL.md`)
