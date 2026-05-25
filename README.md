# Arcive

Arcive est un coffre documentaire local-first avec chiffrement au repos, versioning, recherche et corbeille.

## Pour les utilisateurs

| Langue | Guide |
|--------|-------|
| Francais | [DOCS/USER_GUIDE_FR.md](DOCS/USER_GUIDE_FR.md) |
| English | [DOCS/USER_GUIDE_EN.md](DOCS/USER_GUIDE_EN.md) |
| Espanol | [DOCS/USER_GUIDE_ES.md](DOCS/USER_GUIDE_ES.md) |

**Demarrage rapide (application desktop)** : installe les dependances (`npm install`), lance `npm run tauri:dev`, choisis un dossier de coffre, un mot de passe, puis initialise le coffre. L interface est disponible en **francais**, **anglais** et **espagnol** (selecteur en haut a droite).

---

## Developpeurs

## Etat actuel

Prototype V1 en CLI TypeScript (Windows/macOS/Linux) avec:

- creation et ouverture d'un coffre chiffré
- import de documents
- versioning des documents
- suppression logique / restauration / purge definitive
- recherche locale par nom et etiquettes
- recherche locale dans le contenu texte indexable (`.txt`, `.md`, `.json`, etc.)
- recherche enrichie sur contenu extrait depuis `PDF` texte et `.docx`
- export dechiffre du document courant
- rotation de mot de passe du coffre
- verifications de coherence (orphan blobs)

## Installation

```bash
npm install
```

## Commandes

```bash
npm run dev -- init --vault ./vault --password "motdepasse"
npm run dev -- rotate-password --vault ./vault --password "ancien" --new-password "nouveau"
npm run dev -- import --vault ./vault --password "motdepasse" --file ./facture.pdf --tags impots,2026
npm run dev -- list --vault ./vault --password "motdepasse"
npm run dev -- search --vault ./vault --password "motdepasse" --query facture
npm run dev -- version --vault ./vault --password "motdepasse" --id <DOC_ID> --file ./facture-v2.pdf --note "correction"
npm run dev -- export --vault ./vault --password "motdepasse" --id <DOC_ID> --out ./export.pdf
npm run dev -- delete --vault ./vault --password "motdepasse" --id <DOC_ID>
npm run dev -- restore --vault ./vault --password "motdepasse" --id <DOC_ID>
npm run dev -- purge --vault ./vault --password "motdepasse"
npm run dev -- check --vault ./vault --password "motdepasse"
```

## Qualite

```bash
npm test
npm run build
npm run lint
```

## Desktop (Tauri)

```bash
npm run tauri:dev
npm run tauri:build
```

L'UI desktop MVP couvre maintenant:

- initialisation coffre
- import document + tags
- listage et recherche
- ajout de version
- suppression/restauration/purge
- export document courant
- rotation de mot de passe
- verrouillage automatique de la session UI par inactivite (configurable)
- diagnostic coffre (blobs, versions suivies, orphelins)

## Securite (prototype)

- KDF principal: Argon2id (compat lecture legacy PBKDF2)
- Chiffrement blobs/manifest: AES-256-GCM
- Les noms de fichiers en clair ne sont pas exposes dans le chemin des blobs

Ce socle evoluera vers separation de cles stricte + zeroization + audit de securite avant release stable.

Documents securite:

- `SECURITY.md`
- `THREAT_MODEL.md`
- `AUDIT_READY.md`

## Roadmap vers release stable

1. Core Rust + UI desktop Tauri
2. Index plein texte local robuste multi-format (FTS5/Tantivy)
3. Journal d'audit signe
4. Packaging installeur Windows
5. Battery de tests hardening

## Licence

Apache-2.0

## Packaging et signature

- Build desktop: `npm run tauri:build`
- Publication tag: workflow `.github/workflows/release.yml`
- Signature Windows: voir `SIGNING.md`
