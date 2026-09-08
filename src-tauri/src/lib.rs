use tauri_plugin_shell::ShellExt;

pub struct AppState {
    pub client: reqwest::Client,
    pub gateway_url: String,
}

#[tauri::command]
async fn dispatch_inference(prompt: String, state: tauri::State<'_, AppState>) -> Result<String, String> {
    state.client.post(&format!("{}/v1/chat", state.gateway_url))
        .json(&serde_json::json!({ "prompt": prompt }))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            client: reqwest::Client::new(),
            gateway_url: "http://localhost:3000".to_string(),
        })
        .setup(|app| {
            // Automatically spawn the Fastify gateway background process
            let sidecar_command = app.shell().sidecar("ryan-gateway")
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;
            
            let (_rx, _child) = sidecar_command.spawn()
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![dispatch_inference])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}