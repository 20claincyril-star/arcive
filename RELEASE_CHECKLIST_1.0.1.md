 # Release checklist – Arcive 1.0.1 (hotfix)

Objectif: livrer une mise a jour de maintenance sur la base de 1.0.0, focalisee sur les corrections et le polish, sans ajout fonctionnel majeur.

---

## 1. Avant gel de la branche `release/1.0.1`

- [ ] Branche `release/1.0.1` creee depuis `main` (taggee 1.0.0)
- [ ] Liste des tickets 1.0.1 definie (UI/UX polish, corrections, erreurs, dialogues fichiers, logs)
- [ ] Aucun travail de nouvelle fonctionnalite demarre sur cette branche

---

## 2. Corrections & polish

- [ ] Tous les tickets “haute priorite” pour 1.0.1 sont resolus ou explicitement repousses a 1.1.0
- [ ] Les regressions possibles sont identifiees et teste es (parcours de base 1.0.0)
- [ ] Les messages d'erreur ont ete revus pour supprimer les stacktraces et details techniques inutiles
- [ ] Les dialogues fichiers gerent proprement les annulations / erreurs (aucun plantage, aucun etat incoherent)

---

## 3. Qualite technique (CI / tests)

- [ ] `npm install` OK sur une machine propre
- [ ] `npm run lint` OK
- [ ] `npm test` OK
- [ ] `npm run build` OK
- [ ] `npm run tauri:build` OK (MSI + NSIS generes pour 1.0.1)

---

## 4. Tests manuels minimaux pour 1.0.1

Sur au moins une machine Windows de test:

- [ ] Creation d'un nouveau coffre via UI
- [ ] Import PDF / DOCX / TXT (comportement correct si annulation du dialogue)
- [ ] Recherche simple (nom, tags, contenu) sur les documents de test
- [ ] Backup ZIP + restore vers un nouveau dossier (sans ecrasement silencieux)
- [ ] Diagnostic / healthCheck OK sur un coffre sain
- [ ] Rotation de mot de passe (ancien mot de passe refuse, nouveau accepte)
- [ ] Verification qu'aucun message d'erreur n'affiche de stacktrace brute
- [ ] Verification que les operations destructrices ont bien un avertissement clair

---

## 5. Packaging & signature

- [ ] Les artefacts generes correspondent bien a la version 1.0.1 (nom, numero de version)
- [ ] (Si actif) Workflow de signature CI passe sans erreur pour les artefacts Windows
- [ ] (Si actif) Verification ponctuelle des signatures avec `signtool verify /pa /v` sur MSI/NSIS 1.0.1

---

## 6. Documentation & communication

- [ ] `CHANGELOG.md` contient une section `## [1.0.1] - ...` decrivant clairement les corrections et changements
- [ ] `DOD_1.0.1.md` coche pour cette release
- [ ] Eventuel README / docs mises a jour pour mentionner la 1.0.1 si necessaire

---

## 7. Publication

- [ ] Tag `v1.0.1` cree sur `main` (ou branche cible) apres merge de `release/1.0.1`
- [ ] Release GitHub brouillon creee avec:
  - [ ] Titre `Arcive v1.0.1`
  - [ ] Tag `v1.0.1`
  - [ ] Notes de release basees sur `CHANGELOG.md` (section 1.0.1)
  - [ ] Artefacts MSI/NSIS 1.0.1 attaches
- [ ] Publication de la release uniquement lorsque tous les points ci‑dessus sont coches

