// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod error;
mod models;
mod export;
mod search;
mod watcher;
mod ai;
mod ai_commands;
mod semantic_commands;
mod media_commands;

use std::sync::Arc;

fn main() {
    // Initialize logging with environment variable support
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();
    
    log::info!("Starting A3Note application");
    
    // Initialize AI service
    log::info!("Initializing AI service");
    let ai_config = ai::AIConfig::default();
    let ai_service = Arc::new(ai::AIService::new(ai_config));
    log::info!("AI service initialized");

    // Initialize Embedding service and Vector Index
    log::info!("Initializing semantic AI services");
    let embedding_service = ai::EmbeddingService::new();
    let vector_index = Arc::new(ai::VectorIndex::new(embedding_service));
    log::info!("Vector index initialized");

    // Initialize RAG service
    let rag_service = Arc::new(ai::RAGService::new(
        vector_index.clone(),
        ai_service.clone(),
    ));
    log::info!("RAG service initialized");
    
    tauri::Builder::default()
        .manage(ai_service)
        .manage(vector_index)
        .manage(rag_service)
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
            ai_commands::load_ai_model,
            ai_commands::is_ai_model_loaded,
            ai_commands::unload_ai_model,
            ai_commands::get_ai_model_info,
            ai_commands::ai_generate,
            ai_commands::ai_chat,
            ai_commands::ai_improve_text,
            ai_commands::ai_summarize_text,
            ai_commands::ai_translate_text,
            ai_commands::ai_continue_writing,
            // Semantic AI commands
            semantic_commands::index_document,
            semantic_commands::remove_from_index,
            semantic_commands::semantic_search,
            semantic_commands::suggest_links,
            semantic_commands::rag_query,
            semantic_commands::get_index_stats,
            semantic_commands::clear_index,
            // Media commands
            media_commands::save_media_file,
            media_commands::read_media_file,
            media_commands::delete_media_file,
            media_commands::list_media_files,
            media_commands::get_media_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
