# Arcive (dépôt open source — prototype)

> **Important — produit commercial distinct**  
> Ce dépôt contient l’**ancienne version prototype** (CLI TypeScript + MVP Tauri expérimental).  
> Ce n’est **pas** le produit fini vendu aujourd’hui.
>
> **Arcive Desktop V1.2 (produit fini Windows)** est distribué exclusivement sur Gumroad :  
> https://claincy.gumroad.com/l/qqpvn  
>
> Merci de ne pas confondre les deux : le dépôt GitHub reste libre pour apprendre / expérimenter.  
> La version boutique (installateur, UI guidée, notice, mode d’emploi) est sur Gumroad.

---

Arcive est un coffre documentaire local-first avec chiffrement au repos.

## État de ce dépôt

Prototype open source (CLI TypeScript) :

- création / ouverture d’un coffre chiffré
- import, versioning, corbeille, recherche
- export déchiffré
- MVP desktop Tauri expérimental

## Installation (prototype)

```bash
npm install
```

## Commandes (extrait)

```bash
npm run dev -- init --vault ./vault --password "motdepasse"
npm run dev -- import --vault ./vault --password "motdepasse" --file ./facture.pdf --tags impots,2026
npm run dev -- list --vault ./vault --password "motdepasse"
```

Voir le reste des commandes dans l’historique du dépôt / scripts npm.

## Sécurité (prototype)

- KDF : Argon2id (legacy PBKDF2 en lecture)
- Chiffrement : AES-256-GCM
- Documents : `SECURITY.md`, `THREAT_MODEL.md`

Ce socle est **éducatif / expérimental**. Pour un usage grand public clé en main, utilisez le produit Gumroad V1.2.

## Licence

Apache-2.0 (ce dépôt prototype uniquement).

## Produit fini (Gumroad)

**Arcive Desktop V1.2** — installateur Windows, interface française guidée, mode d’emploi :  
https://claincy.gumroad.com/l/qqpvn

Marque : ÎM CORE · Auteur : Cyril Clain
