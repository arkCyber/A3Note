// AI Types - Aerospace Grade
// Type definitions for AI service with comprehensive validation

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// AI configuration with validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    /// Context window size (must be > 0)
    pub context_size: usize,
    /// Number of threads for inference
    pub num_threads: usize,
    /// GPU layers to offload (0 = CPU only)
    pub gpu_layers: i32,
    /// Path to the model file
    pub model_path: Option<PathBuf>,
}

impl Default for AIConfig {
    fn default() -> Self {
        Self {
            context_size: 4096,
            num_threads: num_cpus::get().max(1),
            gpu_layers: 0,
            model_path: None,
        }
    }
}

impl AIConfig {
    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        if self.context_size == 0 {
            return Err("Context size must be greater than 0".to_string());
        }
        if self.num_threads == 0 {
            return Err("Number of threads must be greater than 0".to_string());
        }
        if self.gpu_layers < 0 {
            return Err("GPU layers cannot be negative".to_string());
        }
        Ok(())
    }
}

/// Request for text generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateRequest {
    /// Input prompt
    pub prompt: String,
    /// Maximum tokens to generate
    pub max_tokens: Option<usize>,
    /// Temperature for sampling (0.0 - 2.0)
    pub temperature: Option<f32>,
    /// Top-p sampling parameter
    pub top_p: Option<f32>,
    /// Stop sequences
    pub stop_sequences: Option<Vec<String>>,
}

impl Default for GenerateRequest {
    fn default() -> Self {
        Self {
            prompt: String::new(),
            max_tokens: Some(512),
            temperature: Some(0.7),
            top_p: Some(0.9),
            stop_sequences: None,
        }
    }
}

impl GenerateRequest {
    /// Validate request
    pub fn validate(&self) -> Result<(), String> {
        if self.prompt.is_empty() {
            return Err("Prompt cannot be empty".to_string());
        }
        if let Some(temp) = self.temperature {
            if temp < 0.0 || temp > 2.0 {
                return Err("Temperature must be between 0.0 and 2.0".to_string());
            }
        }
        if let Some(top_p) = self.top_p {
            if top_p < 0.0 || top_p > 1.0 {
                return Err("Top-p must be between 0.0 and 1.0".to_string());
            }
        }
        if let Some(max_tokens) = self.max_tokens {
            if max_tokens == 0 {
                return Err("Max tokens must be greater than 0".to_string());
            }
        }
        Ok(())
    }
}

/// Chat message
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    /// Role: system, user, or assistant
    pub role: String,
    /// Message content
    pub content: String,
}

impl ChatMessage {
    /// Validate message
    pub fn validate(&self) -> Result<(), String> {
        if !["system", "user", "assistant"].contains(&self.role.as_str()) {
            return Err(format!("Invalid role: {}", self.role));
        }
        if self.content.is_empty() {
            return Err("Message content cannot be empty".to_string());
        }
        Ok(())
    }
}

/// AI generation response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    /// Generated text
    pub text: String,
    /// Number of tokens generated
    pub tokens_generated: usize,
    /// Time taken in milliseconds
    pub time_ms: u64,
}

/// Model information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    /// Model name
    pub name: String,
    /// Model path
    pub path: PathBuf,
    /// Model size in bytes
    pub size_bytes: u64,
    /// Is model loaded
    pub is_loaded: bool,
}
