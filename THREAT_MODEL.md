# Threat Model

## 1. Actifs proteges

- contenu des documents importes
- metadonnees du coffre (noms, tags, historique, texte indexe)
- secret utilisateur (mot de passe)
- artefacts exportes et backups (`*.zip`)

## 2. Surfaces d'attaque

- dossier du coffre (`manifest.enc.json`, `blobs/`)
- fichiers temporaires d'export / edition
- artefacts de backup
- binaire desktop (MSI / EXE)
- logs et messages d'erreur

## 3. Menaces principales

- vol du disque ou copie brute du dossier coffre
- brute force offline du mot de passe
- corruption volontaire des blobs/manifeste
- fuite d'information via:
  - fichiers temporaires non nettoyes
  - messages d'erreur trop verbeux
- exécution de binaire modifie / non signe

## 4. Hypotheses

- pas de keylogger / malware deja installe sur le poste
- mot de passe choisi robuste par l'utilisateur
- l'attaquant peut copier les fichiers du coffre mais pas executer du code en continu avec les memes droits que l'utilisateur pendant la session

## 5. Mitigations actuelles

- chiffrement AES-256-GCM des blobs + manifeste
- derivee de cle Argon2id pour les nouveaux coffres:
  - memoryCost: 2^16 (64 MiB)
  - timeCost: 3
  - parallelism: 1
- compatibilite lecture legacy PBKDF2 (210k iterations)
- rotation du mot de passe
- comparaison timing-safe en rotation
- effacement cible de certains buffers sensibles (manifeste en clair, cles temporaires en rotation)
- validation de base des blobs via `healthCheck` (orphelins)
- verrouillage auto de session UI par inactivite
- canal d'erreur structure entre CLI/Tauri/UI

## 6. Lacunes restantes

- pas de zeroization exhaustive de tous buffers sensibles (limite Node/JS)
- pas d'audit externe independant de la conception crypto et des parametres Argon2id
- pas de protection contre un OS compromise (keylogger, hooks systeme)
- indexation plein texte = texte derive (bien que stocke chiffre)
- signatures de release dependantes de la bonne gestion des certificats

## 7. Priorites audit

1. revue crypto (KDF, gestion sel/nonce, hygiene memoire)
2. revue flux export/import, backups et traces temporaires
3. revue hardening packaging desktop et process de signature
