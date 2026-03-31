# Changelog

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

### Docs

- Ajout de `THREAT_MODEL.md`
- Ajout de `AUDIT_READY.md`
