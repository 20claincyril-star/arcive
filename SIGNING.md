# Signature Windows

## Objectif

Signer les installateurs (`.msi`, `-setup.exe`) avant publication.

## Variables attendues

- `ARCIVE_CERT_PFX_BASE64` : certificat PFX encodé en base64
- `ARCIVE_CERT_PASSWORD` : mot de passe du PFX

## Signature locale

```powershell
powershell -ExecutionPolicy Bypass -File ".\\scripts\\sign-windows.ps1" -TargetPath ".\\src-tauri\\target\\release\\bundle\\msi\\Arcive_0.1.0_x64_en-US.msi"
powershell -ExecutionPolicy Bypass -File ".\\scripts\\sign-windows.ps1" -TargetPath ".\\src-tauri\\target\\release\\bundle\\nsis\\Arcive_0.1.0_x64-setup.exe"
```

## Vérification

```powershell
Get-AuthenticodeSignature ".\\src-tauri\\target\\release\\bundle\\msi\\Arcive_0.1.0_x64_en-US.msi"
Get-AuthenticodeSignature ".\\src-tauri\\target\\release\\bundle\\nsis\\Arcive_0.1.0_x64-setup.exe"
```

## CI / release

Le workflow `release.yml` publie automatiquement les artefacts sur un tag `v*`.
La signature peut être ajoutée à ce workflow en injectant les secrets ci-dessus.
