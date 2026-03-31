# Politique de securite

## Portee

Arcive manipule des documents sensibles. Toute faille de chiffrement, fuite de metadonnees ou corruption silencieuse est critique.

## Signaler une vulnerabilite

- Ne pas ouvrir d'issue publique pour une faille zero-day.
- Contacter le mainteneur avec:
  - contexte
  - impact
  - reproduction
  - proposition de mitigation

## SLA cible

- Accuse reception: 72h
- Qualification: 7 jours
- Correctif initial: 30 jours (selon severite)

## Hardening roadmap

- Parametrage clair d'Argon2id (memoryCost, timeCost, parallelism)
- Cloisonnement strict des cles derivees
- Gestion zero-copy / zeroization des buffers sensibles (dans la mesure du possible en Node/JS)
- Audit externe avant version 1.0.0 stable
