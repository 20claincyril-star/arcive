# Arcive User Guide (EN)

## Installation

1. Install Node.js 20+ and dependencies: 
pm install
2. Run the desktop app: 
pm run tauri:dev
3. For an installer: 
pm run tauri:build

## First launch

- Pick language (FR / EN / ES) at the top right.
- Click **?** for in-app help.
- The status bar shows the current action.

## Create a vault

1. In **Vault**: browse to an empty or new folder.
2. Enter a strong password.
3. Click **Initialize vault**.

## Password and session

- The password unlocks the vault for each action.
- **Session**: set auto-lock (1-180 min). After inactivity the password field is cleared.
- **Vault security**: rotate password (current + new required).

## Import a document

1. Open a vault (path + password).
2. In **Import**: pick a file and optional CSV tags (e.g. 	axes,2026).
3. Click **Import document**.

## Search and list

- **List documents**: shows the full vault.
- **Search**: matches names, tags and indexed text content.
- Click a result to fill the document ID.

## Export and versions

- **Add version**: ID + file + optional note.
- **Export**: ID + output path (decrypts current document).

## Trash

- **Delete**: soft-delete to trash.
- **Restore**: brings the document back.
- **Purge trash**: permanent deletion.

## ZIP backup and restore

- **Create ZIP backup**: encrypted archive of the open vault.
- **Restore from ZIP**: pick archive, target folder and password.

## Diagnostics

- **Analyze vault health**: blobs, tracked versions, orphan files.

## Troubleshooting

| Issue | Hint |
|-------|------|
| Invalid password | Check current password |
| File not found | Re-select the path |
| Access denied | Check Windows folder permissions |
| Tauri unavailable | Run via 
pm run tauri:dev |

See also SECURITY.md and THREAT_MODEL.md.
