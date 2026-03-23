// AI Service - Aerospace Grade
// Main service for managing AI model and operations

use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::Instant;

use super::error::{AIError, AIResult};
use super::llama::LlamaModel;
use super::types::*;

/// AI service with thread-safe model management
pub struct AIService {
    model: Arc<Mutex<Option<LlamaModel>>>,
    config: Arc<Mutex<AIConfig>>,
}

impl AIService {
    /// Create new AI service
    pub fn new(config: AIConfig) -> Self {
        log::info!("Initializing AI service");
        Self {
            model: Arc::new(Mutex::new(None)),
            config: Arc::new(Mutex::new(config)),
        }
    }

    /// Load AI model with comprehensive validation
    pub fn load_model(&self, config: AIConfig) -> AIResult<()> {
        log::info!("Loading AI model with config: {:?}", config);
        
        // Validate model path
        let model_path = config.model_path.clone()
            .ok_or_else(|| AIError::InvalidConfig("Model path is required".to_string()))?;
        
        if model_path.as_os_str().is_empty() {
            return Err(AIError::InvalidConfig("Model path cannot be empty".to_string()));
        }
        
        // Check if Ollama is accessible
        log::info!("Checking Ollama connectivity...");
        let client = reqwest::blocking::Client::builder()
            .timeout(std::time::Duration::from_secs(5))
            .build()
            .map_err(|e| AIError::InternalError(format!("HTTP client error: {}", e)))?;
        
        match client.get("http://localhost:11434/api/tags").send() {
            Ok(response) if response.status().is_success() => {
                log::info!("Ollama is running and accessible");
            }
            Ok(response) => {
                log::warn!("Ollama returned unexpected status: {}", response.status());
                return Err(AIError::ModelLoadError(
                    format!("Ollama is not responding correctly (status: {}). Please check Ollama service.", response.status())
                ));
            }
            Err(e) => {
                log::error!("Cannot connect to Ollama: {}", e);
                return Err(AIError::ModelLoadError(
                    "Cannot connect to Ollama. Please ensure:\n\
                    1. Ollama is installed (brew install ollama)\n\
                    2. Ollama service is running (ollama serve)\n\
                    3. Ollama is accessible at http://localhost:11434".to_string()
                ));
            }
        }
        
        let model = LlamaModel::load(model_path.into(), &config)?;
        
        let mut model_guard = self.model.lock()
            .map_err(|e| AIError::InternalError(format!("Lock error: {}", e)))?;
        
        *model_guard = Some(model);
        
        log::info!("AI model loaded successfully");
        Ok(())
    }

    /// Check if model is loaded
    pub fn is_loaded(&self) -> bool {
        let model_lock = self.model.lock().unwrap();
        model_lock.is_some()
    }

    /// Unload model to free memory
    pub fn unload_model(&self) {
        log::info!("Unloading AI model");
        let mut model_lock = self.model.lock().unwrap();
        *model_lock = None;
        log::info!("Model unloaded");
    }

    /// Generate text
    pub fn generate(&self, request: GenerateRequest) -> AIResult<AIResponse> {
        let model_lock = self.model.lock().unwrap();
        let model = model_lock
            .as_ref()
            .ok_or(AIError::ModelNotLoaded)?;

        model.generate(&request)
    }

    /// Chat completion with message history
    pub fn chat(&self, messages: Vec<ChatMessage>) -> AIResult<AIResponse> {
        // Validate all messages
        for msg in &messages {
            msg.validate()
                .map_err(|e| AIError::InvalidRequest(e))?;
        }

        // Format chat prompt
        let prompt = self.format_chat_prompt(messages)?;

        // Generate response
        let request = GenerateRequest {
            prompt,
            ..Default::default()
        };

        self.generate(request)
    }

    /// Improve text quality
    pub fn improve_text(&self, text: &str) -> AIResult<AIResponse> {
        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: "你是一个专业的写作助手，帮助改进文本质量。请保持原文的核心意思，但使表达更清晰、更专业。".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: format!("请改进以下文本：\n\n{}", text),
            },
        ];

        self.chat(messages)
    }

    /// Summarize text
    pub fn summarize_text(&self, text: &str) -> AIResult<AIResponse> {
        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: "你是一个专业的摘要助手。请提取关键信息，生成简洁的摘要。".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: format!("请总结以下内容：\n\n{}", text),
            },
        ];

        self.chat(messages)
    }

    /// Translate text
    pub fn translate_text(&self, text: &str, target_lang: &str) -> AIResult<AIResponse> {
        let messages = vec![
            ChatMessage {
                role: "user".to_string(),
                content: format!("请将以下内容翻译为{}：\n\n{}", target_lang, text),
            },
        ];

        self.chat(messages)
    }

    /// Continue writing
    pub fn continue_writing(&self, text: &str) -> AIResult<AIResponse> {
        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: "你是一个专业的写作助手。请基于给定的文本，自然地续写内容。".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: format!("请续写以下内容：\n\n{}", text),
            },
        ];

        self.chat(messages)
    }

    /// Get model information
    pub fn model_info(&self) -> Option<ModelInfo> {
        let model_lock = self.model.lock().unwrap();
        model_lock.as_ref().map(|m| m.info())
    }

    /// Format chat messages into Qwen prompt format
    fn format_chat_prompt(&self, messages: Vec<ChatMessage>) -> AIResult<String> {
        let mut prompt = String::new();

        for msg in messages {
            match msg.role.as_str() {
                "system" => {
                    prompt.push_str(&format!(
                        "<|im_start|>system\n{}<|im_end|>\n",
                        msg.content
                    ));
                }
                "user" => {
                    prompt.push_str(&format!(
                        "<|im_start|>user\n{}<|im_end|>\n",
                        msg.content
                    ));
                }
                "assistant" => {
                    prompt.push_str(&format!(
                        "<|im_start|>assistant\n{}<|im_end|>\n",
                        msg.content
                    ));
                }
                _ => {
                    return Err(AIError::InvalidRequest(
                        format!("Invalid role: {}", msg.role)
                    ));
                }
            }
        }

        prompt.push_str("<|im_start|>assistant\n");
        Ok(prompt)
    }
}

impl Default for AIService {
    fn default() -> Self {
        Self::new(AIConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_service_creation() {
        let service = AIService::default();
        assert!(!service.is_loaded());
    }

    #[test]
    fn test_chat_prompt_formatting() {
        let service = AIService::default();
        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: "You are helpful".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: "Hello".to_string(),
            },
        ];

        let prompt = service.format_chat_prompt(messages).unwrap();
        assert!(prompt.contains("<|im_start|>system"));
        assert!(prompt.contains("<|im_start|>user"));
        assert!(prompt.contains("<|im_start|>assistant"));
    }

    #[test]
    fn test_invalid_role() {
        let service = AIService::default();
        let messages = vec![
            ChatMessage {
                role: "invalid".to_string(),
                content: "Test".to_string(),
            },
        ];

        assert!(service.format_chat_prompt(messages).is_err());
    }
}
