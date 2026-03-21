// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod error;
mod export;
mod models;
mod search;
mod watcher;

use commands::*;
use error::*;

fn main() {
    // Initialize logging with environment variable support
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();
    
    log::info!("Starting A3Note application");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_file_content,
            commands::write_file_content,
            commands::list_directory,
            commands::create_file,
            commands::delete_file,
            commands::search_files,
            export::export_file_to_html,
            export::export_file_to_text,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
