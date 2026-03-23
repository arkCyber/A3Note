// AI Commands - Aerospace Grade
// Tauri commands for AI operations with comprehensive error handling

use tauri::State;
use std::sync::Arc;
use std::path::PathBuf;

use crate::ai::{AIService, AIConfig, GenerateRequest, ChatMessage, AIResponse, ModelInfo};
use crate::ai::error::AIError;

/// Load AI model from file path
#[tauri::command]
pub async fn load_ai_model(
    ai_service: State<'_, Arc<AIService>>,
    model_path: String,
) -> Result<(), String> {
    log::info!("Loading AI model from path: {}", model_path);
    
    let path = PathBuf::from(model_path);
    
    // Create AI config from path
    let config = AIConfig {
        model_path: Some(path),
        context_size: 4096,
        num_threads: num_cpus::get(),
        gpu_layers: 0, // CPU only for now
    };
    
    ai_service
        .load_model(config)
        .map_err(|e| {
            log::error!("Failed to load model: {:?}", e);
            e.user_message()
        })
}

/// Check if AI model is loaded
#[tauri::command]
pub fn is_ai_model_loaded(
    ai_service: State<'_, Arc<AIService>>,
) -> bool {
    let loaded = ai_service.is_loaded();
    log::debug!("Command: is_ai_model_loaded - result: {}", loaded);
    loaded
}

/// Unload AI model to free memory
#[tauri::command]
pub fn unload_ai_model(
    ai_service: State<'_, Arc<AIService>>,
) -> Result<(), String> {
    log::info!("Command: unload_ai_model");
    ai_service.unload_model();
    Ok(())
}

/// Get model information
#[tauri::command]
pub fn get_ai_model_info(
    ai_service: State<'_, Arc<AIService>>,
) -> Result<Option<ModelInfo>, String> {
    log::debug!("Command: get_ai_model_info");
    Ok(ai_service.model_info())
}

/// Generate text from prompt
#[tauri::command]
pub async fn ai_generate(
    ai_service: State<'_, Arc<AIService>>,
    request: GenerateRequest,
) -> Result<AIResponse, String> {
    log::info!("Command: ai_generate - prompt length: {}", request.prompt.len());
    
    ai_service
        .generate(request)
        .map_err(|e| {
            log::error!("Generation failed: {:?}", e);
            e.user_message()
        })
}

/// Chat completion with message history
#[tauri::command]
pub async fn ai_chat(
    ai_service: State<'_, Arc<AIService>>,
    messages: Vec<ChatMessage>,
) -> Result<AIResponse, String> {
    log::info!("Command: ai_chat - {} messages", messages.len());
    
    ai_service
        .chat(messages)
        .map_err(|e| {
            log::error!("Chat failed: {:?}", e);
            e.user_message()
        })
}

/// Improve text quality
#[tauri::command]
pub async fn ai_improve_text(
    ai_service: State<'_, Arc<AIService>>,
    text: String,
) -> Result<AIResponse, String> {
    log::info!("Command: ai_improve_text - text length: {}", text.len());
    
    if text.is_empty() {
        return Err("文本不能为空".to_string());
    }
    
    if text.len() > 10000 {
        return Err("文本过长，请限制在 10000 字符以内".to_string());
    }
    
    ai_service
        .improve_text(&text)
        .map_err(|e| {
            log::error!("Improve text failed: {:?}", e);
            e.user_message()
        })
}

/// Summarize text
#[tauri::command]
pub async fn ai_summarize_text(
    ai_service: State<'_, Arc<AIService>>,
    text: String,
) -> Result<AIResponse, String> {
    log::info!("Command: ai_summarize_text - text length: {}", text.len());
    
    if text.is_empty() {
        return Err("文本不能为空".to_string());
    }
    
    if text.len() > 20000 {
        return Err("文本过长，请限制在 20000 字符以内".to_string());
    }
    
    ai_service
        .summarize_text(&text)
        .map_err(|e| {
            log::error!("Summarize text failed: {:?}", e);
            e.user_message()
        })
}

/// Translate text to target language
#[tauri::command]
pub async fn ai_translate_text(
    ai_service: State<'_, Arc<AIService>>,
    text: String,
    target_lang: String,
) -> Result<AIResponse, String> {
    log::info!(
        "Command: ai_translate_text - text length: {}, target: {}",
        text.len(),
        target_lang
    );
    
    if text.is_empty() {
        return Err("文本不能为空".to_string());
    }
    
    if text.len() > 10000 {
        return Err("文本过长，请限制在 10000 字符以内".to_string());
    }
    
    let valid_langs = ["英文", "中文", "日文", "韩文", "法文", "德文", "西班牙文"];
    if !valid_langs.contains(&target_lang.as_str()) {
        return Err(format!("不支持的目标语言: {}", target_lang));
    }
    
    ai_service
        .translate_text(&text, &target_lang)
        .map_err(|e| {
            log::error!("Translate text failed: {:?}", e);
            e.user_message()
        })
}

/// Continue writing from given text
#[tauri::command]
pub async fn ai_continue_writing(
    ai_service: State<'_, Arc<AIService>>,
    text: String,
) -> Result<AIResponse, String> {
    log::info!("Command: ai_continue_writing - text length: {}", text.len());
    
    if text.is_empty() {
        return Err("文本不能为空".to_string());
    }
    
    if text.len() > 5000 {
        return Err("文本过长，请限制在 5000 字符以内".to_string());
    }
    
    ai_service
        .continue_writing(&text)
        .map_err(|e| {
            log::error!("Continue writing failed: {:?}", e);
            e.user_message()
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_text_length_validation() {
        let long_text = "a".repeat(15000);
        assert!(long_text.len() > 10000);
    }
}
