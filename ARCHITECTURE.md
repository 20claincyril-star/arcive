# Architecture technique actuelle

## Vue systeme

- `src/crypto.ts` : derivee de cle et chiffrement/dechiffrement AEAD
- `src/store.ts` : logique du coffre (manifest, blobs, versioning, recherche nom/tags/contenu texte, corbeille)
- `src/cli.ts` : interface utilisateur CLI
- `tests/vault.test.ts` : scenarios critiques de non-regression

## Format de stockage

- `manifest.enc.json` : manifeste chiffre (JSON + payload base64)
- `blobs/<versionId>.bin` : versions de documents chiffrees

## Flux principal

1. `init` derive une cle via mot de passe et cree un coffre vide
2. `rotate-password` re-derive une cle maitre Argon2id et met a jour les parametres KDF
3. `import` chiffre le fichier et ajoute une premiere version
4. `version` ajoute une nouvelle version chiffree au meme document logique
5. `export` dechiffre uniquement la version courante ciblee
6. `delete/restore/purge` gerent la corbeille logique puis suppression physique

## Limites connues (v0.2.0)

- separation de cles derivees encore simplifiee
- indexation contenu limitee aux formats texte brut
- interface CLI uniquement (UI desktop prevue)
- pas de synchronisation multi-device
