 # Definition of Done – Arcive 1.0.1 (hotfix)

Objectif: livrer une version 1.0.1 qui corrige les problemes identifies sur la 1.0.0, sans introduire de nouvelles fonctionnalites ni casser le format de coffre.

---

## 1. Qualite technique

- [ ] `npm run lint`, `npm test`, `npm run build`, `npm run tauri:build` verts sur la branche `release/1.0.1`
- [ ] Aucun test critique 1.0.0 casse (parcours coffre: init/import/list/search/version/delete/restore/purge/export/backup/restore-vault/rotate-password)
- [ ] Les nouvelles corrections ont des tests ou repros documentes (au minimum en manuel)

---

## 2. UX desktop (polish 1.0.1)

Polish cible sur les parcours deja existants:

- [ ] Creation de coffre: textes des labels et messages valides, aucun comportement “bizarre” sur champ vide / annulation
- [ ] Import de fichiers: comportement correct si l'utilisateur annule un dialogue ou selectionne un chemin invalide
- [ ] Recherche: messages clairs quand aucun resultat, aucune erreur technique en cas de contenu non indexable
- [ ] Backup / restore: messages explicites en cas d'echec (espace disque, droits, dossier non vide, etc.)
- [ ] Dialogues d'avertissement pour operations destructrices (corbeille, purge, restore par dessus un dossier) bien visibles et comprehensibles

---

## 3. Securite & erreurs

- [ ] Aucun message d'erreur affichant une stacktrace brute (Node/TS/Rust)
- [ ] Aucun message n'affiche de chemin interne ou info sensible inutile
- [ ] Les messages d'erreur utilisateur sont homogenes (ton, vocabulaire, format)
- [ ] Les corrections n'affaiblissent pas les garanties de la 1.0.0 (KDF, chiffrement, detection de corruption)

---

## 4. Packaging & release

- [ ] Build MSI + NSIS verifies manuellement (installation + lancement sur au moins une machine)
- [ ] Si la signature Windows est active: verification minimale des signatures sur les artefacts 1.0.1
- [ ] `CHANGELOG.md` mis a jour avec la section 1.0.1 (Fixed/Changed)
- [ ] `RELEASE_CHECKLIST_1.0.1.md` coche pour cette release

---

## 5. Non‑objectifs explicites pour 1.0.1

- [ ] Pas de nouvelle fonctionnalite visible (favoris, recherche avancee, sync, etc.)
- [ ] Pas de changement de format de coffre
- [ ] Pas de refonte d'architecture majeure

Ces points doivent etre traites dans 1.1.0 ou 2.x, pas dans 1.0.1.

