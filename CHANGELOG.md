# Changelog

## [1.0.1] - 2026-05-XX

### Fixed

- Corrections issues des tests manuels sur Arcive 1.0.0 (parcours creation/import/recherche/backup/restore)
- Amelioration de la robustesse des dialogues fichiers (annulation, chemins invalides, acces refuses)
- Suppression des derniers cas residuels de messages d'erreur avec stacktrace brute

### Changed

- Polish UI/UX (libelles, messages, etats de boutons, petits ajustements visuels)
- Harmonisation du ton et du format des messages d'erreur utilisateur

### Notes

- Pas de nouvelles fonctionnalites pour 1.0.1 : version uniquement focus sur la stabilite et le polish de la 1.0.0

## [1.0.0] - 2026-04-XX

### Added

- Sauvegarde / restauration officielle de coffres (`backup`, `restore-vault` en CLI, boutons dedies en UI)
- Indexation enrichie du contenu (`PDF` texte, `.docx`) en plus des formats texte bruts
- Diagnostic de sante du coffre (blobs, versions suivies, blobs orphelins) dans la UI
- Frontend desktop base sur Vite + TypeScript avec dialogues natifs Tauri
- Workflows GitHub Actions pour CI (`ci.yml`) et release (`release.yml`)
- Documentation securite/audit : `SECURITY.md`, `THREAT_MODEL.md`, `AUDIT_READY.md`, `SIGNING.md`, `DOD_1.0.0.md`

### Changed

- Parametres Argon2id centralises et documentes (KDF principal pour les nouveaux coffres)
- Gestion d'erreurs crypto plus explicites (echec de dechiffrement, manifeste corrompu)
- UI desktop durcie: validations de champs, verrouillage automatique par inactivite, messages d'erreur plus pedagogiques

### Fixed

- Detection explicite des cas de corruption manifeste/blobs (plus de succes silencieux)

## [0.1.0] - 2026-03-31

### Added

- Socle du projet sous licence Apache-2.0
- Moteur de coffre local chiffrement AES-256-GCM
- KDF PBKDF2-SHA256 pour derivee de cle
- Import, listing, recherche par nom/tags
- Versioning simple par document
- Corbeille logique + purge definitive
- Export dechiffre du document courant
- Commandes CLI `init/import/list/search/version/delete/restore/purge/export/check`
- Tests automatises Vitest sur les parcours critiques
- Documentation open-source de base (`README`, `CONTRIBUTING`, `SECURITY`)

## [0.2.0] - 2026-03-31

### Added

- KDF Argon2id pour les nouveaux coffres
- Compatibilite de lecture des coffres legacy PBKDF2
- Commande `rotate-password` pour rotation de secret maitre
- Indexation de contenu pour formats texte (`txt`, `md`, `json`, `csv`, `xml`, `html`, `log`)
- Tests complementaires sur indexation et rotation de mot de passe
- Pont Tauri invoke vers le moteur (`vault_init`, `vault_import`, `vault_list`, `vault_search`)
- UI desktop MVP fonctionnelle (`ui/index.html`)
- Build desktop valide (MSI + NSIS)
- Extension du pont Tauri (`vault_add_version`, `vault_delete`, `vault_restore`, `vault_export`, `vault_purge`, `vault_rotate_password`)
- Sortie JSON ajoutee aux commandes CLI de maintenance (`version`, `delete`, `restore`, `purge`, `export`, `check`, `rotate-password`)

### Changed

- Comparaison de cle en timing-safe lors de la rotation de mot de passe
- Effacement du manifeste en memoire apres chiffrement
- UI desktop: validations de champs, verrouillage auto par inactivite, rafraichissement automatique de la liste apres actions, verrou anti-double clic
- Canal d'erreur UI/Tauri/CLI renforce (JSON d'erreur structure + normalisation des messages Rust)
- Point 2: indexation enrichie (`PDF` texte, `.docx`) avec fallback sûr si extraction impossible
- Point 3: ajout d'un diagnostic utilisateur du coffre dans l'UI et messages d'erreur plus pédagogiques
- Point 4: sauvegarde/restauration officielle du coffre (`backup` / `restore-vault`) côté CLI + UI
- Point 5: outillage packaging/release (workflow `release.yml`) et processus de signature (`SIGNING.md`, `scripts/sign-windows.ps1`)

### Docs

- Ajout de `THREAT_MODEL.md`
- Ajout de `AUDIT_READY.md`
