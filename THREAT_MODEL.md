# Threat Model (draft)

## Actifs proteges

- contenu des documents importes
- metadonnees du coffre (noms, tags, historique)
- secret utilisateur (mot de passe)
- artefacts exportes

## Menaces principales

- vol du disque ou copie brute du dossier coffre
- extraction de donnees via fichiers temporaires non nettoyes
- brute force offline du mot de passe
- corruption silencieuse de blobs/manifeste
- fuite d'information par messages d'erreur trop verbeux

## Mitigations actuelles

- chiffrement AES-256-GCM des blobs + manifeste
- derivee de cle Argon2id (compat lecture legacy PBKDF2)
- rotation du mot de passe
- comparaison timing-safe en rotation
- verrouillage auto de session UI par inactivite
- validation des champs UI et canal JSON controle

## Lacunes restantes

- pas de zeroization exhaustive de tous buffers sensibles
- pas d'audit externe de la conception crypto
- indexation plein texte limitee aux formats texte simples
- signatures de release non configurees

## Priorites audit

1. revue crypto (KDF, gestion sel/nonce, hygiene memoire)
2. revue flux export/import et traces temporaires
3. revue hardening packaging desktop
