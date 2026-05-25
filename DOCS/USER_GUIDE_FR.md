# Guide utilisateur Arcive (FR)

## Installation

1. Installe Node.js 20+ et les dependances : 
pm install
2. Lance l application desktop : 
pm run tauri:dev
3. Pour un installeur : 
pm run tauri:build

## Premiere ouverture

- Choisis la langue (FR / EN / ES) en haut a droite.
- Clique sur **?** pour l aide integree.
- Le bandeau de statut indique l action en cours.

## Creer un coffre

1. Section **Coffre** : parcourir un dossier vide ou nouveau.
2. Saisis un mot de passe fort.
3. Clique **Initialiser le coffre**.

## Mot de passe et session

- Le mot de passe deverrouille le coffre a chaque action.
- **Session** : regle le verrouillage auto (1-180 min). Apres inactivite, le mot de passe est efface.
- **Securite coffre** : rotation du mot de passe (ancien + nouveau requis).

## Importer un document

1. Ouvre un coffre (chemin + mot de passe).
2. Section **Importer** : fichier + tags CSV optionnels (ex. impots,2026).
3. Clique **Importer le document**.

## Rechercher et lister

- **Lister les documents** : affiche tout le coffre.
- **Rechercher** : texte dans noms, tags et contenu indexe.
- Clique un resultat pour remplir l ID document.

## Exporter et versions

- **Ajouter une version** : ID + fichier + note optionnelle.
- **Exporter** : ID + chemin de sortie (dechiffre le document courant).

## Corbeille

- **Supprimer** : envoi en corbeille logique.
- **Restaurer** : remet le document actif.
- **Purger la corbeille** : suppression definitive.

## Sauvegarde ZIP et restauration

- **Creer une sauvegarde ZIP** : archive chiffree du coffre ouvert.
- **Restaurer depuis un ZIP** : choisis l archive puis le dossier cible + mot de passe.

## Diagnostic

- **Analyser la sante du coffre** : blobs, versions suivies, fichiers orphelins.

## Depannage

| Probleme | Piste |
|----------|-------|
| Mot de passe invalide | Verifie le mot de passe actuel |
| Fichier introuvable | Re-selectionne le chemin |
| Acces refuse | Droits Windows sur le dossier |
| Interface Tauri indisponible | Lance via 
pm run tauri:dev |

Voir aussi SECURITY.md et THREAT_MODEL.md.
