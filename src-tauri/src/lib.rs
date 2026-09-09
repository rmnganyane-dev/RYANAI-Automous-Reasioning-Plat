#[tauri::command]
fn trigger_local_agent(prompt: String) -> String {
    format!("Tauri desktop bridge dispatched reasoning task: {}", prompt)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![trigger_local_agent])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}