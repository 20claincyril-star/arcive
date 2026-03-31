use std::process::Command;

fn run_cli_json(args: &[&str]) -> Result<serde_json::Value, String> {
  let current_dir = std::env::current_dir()
    .map_err(|e| format!("Impossible de lire le répertoire courant: {e}"))?;
  let output = Command::new("node")
    .args(["dist/cli.js"])
    .args(args)
    .current_dir(&current_dir)
    .output()
    .map_err(|e| format!("Impossible de lancer le moteur CLI: {e}"))?;

  let stdout = String::from_utf8_lossy(&output.stdout);
  let stderr = String::from_utf8_lossy(&output.stderr);
  let parsed = serde_json::from_str::<serde_json::Value>(stdout.trim()).ok();

  if !output.status.success() {
    if let Some(value) = parsed {
      if let Some(message) = value.get("error").and_then(|v| v.as_str()) {
        return Err(format!("Commande CLI en erreur: {message}"));
      }
    }
    let code = output.status.code().unwrap_or(-1);
    return Err(format!(
      "Commande CLI en erreur (code {code}): {}",
      if stderr.trim().is_empty() {
        "erreur inconnue"
      } else {
        stderr.trim()
      }
    ));
  }

  if let Some(value) = parsed {
    if let Some(message) = value.get("error").and_then(|v| v.as_str()) {
      return Err(format!("Erreur logique du moteur: {message}"));
    }
    return Ok(value);
  }

  Err(format!(
    "Réponse JSON invalide: stdout='{}' stderr='{}'",
    stdout.trim(),
    stderr.trim()
  ))
}

#[tauri::command]
fn vault_init(vault: String, password: String) -> Result<serde_json::Value, String> {
  run_cli_json(&["init", "--vault", &vault, "--password", &password, "--json"])
}

#[tauri::command]
fn vault_import(
  vault: String,
  password: String,
  file: String,
  tags_csv: Option<String>,
) -> Result<serde_json::Value, String> {
  let mut args = vec![
    "import",
    "--vault",
    &vault,
    "--password",
    &password,
    "--file",
    &file,
    "--json",
  ];
  if let Some(tags) = tags_csv.as_deref() {
    args.push("--tags");
    args.push(tags);
  }
  run_cli_json(&args)
}

#[tauri::command]
fn vault_list(vault: String, password: String) -> Result<serde_json::Value, String> {
  run_cli_json(&["list", "--vault", &vault, "--password", &password, "--json"])
}

#[tauri::command]
fn vault_search(vault: String, password: String, query: String) -> Result<serde_json::Value, String> {
  run_cli_json(&[
    "search",
    "--vault",
    &vault,
    "--password",
    &password,
    "--query",
    &query,
    "--json",
  ])
}

#[tauri::command]
fn vault_add_version(
  vault: String,
  password: String,
  id: String,
  file: String,
  note: Option<String>,
) -> Result<serde_json::Value, String> {
  let mut args = vec![
    "version",
    "--vault",
    &vault,
    "--password",
    &password,
    "--id",
    &id,
    "--file",
    &file,
    "--json",
  ];
  if let Some(note_value) = note.as_deref() {
    args.push("--note");
    args.push(note_value);
  }
  run_cli_json(&args)
}

#[tauri::command]
fn vault_delete(vault: String, password: String, id: String) -> Result<serde_json::Value, String> {
  run_cli_json(&[
    "delete",
    "--vault",
    &vault,
    "--password",
    &password,
    "--id",
    &id,
    "--json",
  ])
}

#[tauri::command]
fn vault_restore(vault: String, password: String, id: String) -> Result<serde_json::Value, String> {
  run_cli_json(&[
    "restore",
    "--vault",
    &vault,
    "--password",
    &password,
    "--id",
    &id,
    "--json",
  ])
}

#[tauri::command]
fn vault_export(
  vault: String,
  password: String,
  id: String,
  out: String,
) -> Result<serde_json::Value, String> {
  run_cli_json(&[
    "export",
    "--vault",
    &vault,
    "--password",
    &password,
    "--id",
    &id,
    "--out",
    &out,
    "--json",
  ])
}

#[tauri::command]
fn vault_purge(vault: String, password: String) -> Result<serde_json::Value, String> {
  run_cli_json(&["purge", "--vault", &vault, "--password", &password, "--json"])
}

#[tauri::command]
fn vault_rotate_password(
  vault: String,
  password: String,
  new_password: String,
) -> Result<serde_json::Value, String> {
  run_cli_json(&[
    "rotate-password",
    "--vault",
    &vault,
    "--password",
    &password,
    "--new-password",
    &new_password,
    "--json",
  ])
}

#[tauri::command]
fn vault_check(vault: String, password: String) -> Result<serde_json::Value, String> {
  run_cli_json(&["check", "--vault", &vault, "--password", &password, "--json"])
}

#[tauri::command]
fn vault_backup(vault: String, password: String, out: String) -> Result<serde_json::Value, String> {
  run_cli_json(&[
    "backup",
    "--vault",
    &vault,
    "--password",
    &password,
    "--out",
    &out,
    "--json",
  ])
}

#[tauri::command]
fn vault_restore_backup(
  from: String,
  vault: String,
  password: String,
) -> Result<serde_json::Value, String> {
  run_cli_json(&[
    "restore-vault",
    "--from",
    &from,
    "--vault",
    &vault,
    "--password",
    &password,
    "--json",
  ])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      vault_init,
      vault_import,
      vault_list,
      vault_search,
      vault_add_version,
      vault_delete,
      vault_restore,
      vault_export,
      vault_purge,
      vault_rotate_password,
      vault_check,
      vault_backup,
      vault_restore_backup
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_dialog::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
