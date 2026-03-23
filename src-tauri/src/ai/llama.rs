// Ollama Integration - Aerospace Grade
// High-performance local inference via Ollama HTTP API
// Supports Qwen and other models through Ollama

use std::path::PathBuf;
use std::time::Instant;
use serde::{Deserialize, Serialize};

use super::error::{AIError, AIResult};
use super::types::*;

/// Ollama API request/response types
#[derive(Debug, Serialize)]
struct OllamaGenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: OllamaOptions,
}

#[derive(Debug, Serialize)]
struct OllamaOptions {
    temperature: f32,
    top_p: f32,
    num_predict: i32,
}

#[derive(Debug, Deserialize)]
struct OllamaGenerateResponse {
    response: String,
    done: bool,
}

/// Ollama model wrapper with safety guarantees
pub struct LlamaModel {
    model_path: PathBuf,
    model_name: String,
    config: AIConfig,
    ollama_url: String,
}

impl LlamaModel {
    /// Initialize Ollama model connection
    pub fn load(model_path: PathBuf, config: &AIConfig) -> AIResult<Self> {
        log::info!("Initializing Ollama model: {:?}", model_path);
        let start = Instant::now();

        // Validate configuration
        config.validate()
            .map_err(|e| AIError::InvalidConfig(e))?;

        // Extract model name from path (e.g., qwen2.5:14b)
        let model_name = model_path
            .file_stem()
            .and_then(|s| s.to_str())
            .map(|s| {
                // Convert file name to Ollama model name
                if s.contains("qwen") {
                    if s.contains("14b") || s.contains("coder") {
                        "qwen2.5:14b".to_string()
                    } else {
                        "qwen2.5:0.5b".to_string()
                    }
                } else {
                    "qwen2.5:14b".to_string() // default
                }
            })
            .unwrap_or_else(|| "qwen2.5:14b".to_string());

        let ollama_url = "http://localhost:11434".to_string();
        
        log::info!("Using Ollama model: {} at {}", model_name, ollama_url);
        
        let elapsed = start.elapsed();
        log::info!("Ollama model initialized in {:.2}s", elapsed.as_secs_f64());

        Ok(Self {
            model_path,
            model_name,
            config: config.clone(),
            ollama_url,
        })
    }

    /// Generate text using Ollama API
    pub fn generate(&self, request: &GenerateRequest) -> AIResult<AIResponse> {
        log::info!("Starting Ollama text generation");
        let start = Instant::now();

        // Validate request
        request.validate()
            .map_err(|e| AIError::InvalidRequest(e))?;

        // Create Ollama request
        let ollama_request = OllamaGenerateRequest {
            model: self.model_name.clone(),
            prompt: request.prompt.clone(),
            stream: false,
            options: OllamaOptions {
                temperature: request.temperature.unwrap_or(0.7),
                top_p: request.top_p.unwrap_or(0.9),
                num_predict: request.max_tokens.unwrap_or(512) as i32,
            },
        };

        // Make HTTP request to Ollama with timeout
        let client = reqwest::blocking::Client::builder()
            .timeout(std::time::Duration::from_secs(120)) // 2 minutes for generation
            .build()
            .map_err(|e| AIError::InferenceError(format!("HTTP client error: {}", e)))?;
        
        let url = format!("{}/api/generate", self.ollama_url);
        
        log::debug!("Calling Ollama API: {} with model: {}", url, self.model_name);
        log::debug!("Request params: temp={}, top_p={}, max_tokens={}", 
            ollama_request.options.temperature,
            ollama_request.options.top_p,
            ollama_request.options.num_predict
        );
        
        let response = client
            .post(&url)
            .json(&ollama_request)
            .send()
            .map_err(|e| {
                log::error!("Ollama API request failed: {}", e);
                if e.is_timeout() {
                    AIError::InferenceError(
                        "Request timeout. The model might be too slow or the prompt too complex. Try:\n\
                        1. Using a smaller model (qwen2.5:0.5b)\n\
                        2. Reducing max_tokens\n\
                        3. Simplifying the prompt".to_string()
                    )
                } else if e.is_connect() {
                    AIError::InferenceError(
                        "Cannot connect to Ollama. Please ensure:\n\
                        1. Ollama is running (ollama serve)\n\
                        2. Ollama is accessible at http://localhost:11434".to_string()
                    )
                } else {
                    AIError::InferenceError(format!("Ollama API error: {}", e))
                }
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().unwrap_or_default();
            log::error!("Ollama API returned error: {} - {}", status, error_text);
            return Err(AIError::InferenceError(format!(
                "Ollama API error {}: {}. Make sure Ollama is running and the model is pulled.",
                status, error_text
            )));
        }

        let ollama_response: OllamaGenerateResponse = response
            .json()
            .map_err(|e| {
                log::error!("Failed to parse Ollama response: {}", e);
                AIError::InferenceError(format!("Invalid Ollama response: {}", e))
            })?;

        let output = ollama_response.response;
        let tokens_generated = output.split_whitespace().count();
        let elapsed = start.elapsed();
        let time_ms = elapsed.as_millis() as u64;

        log::info!(
            "Generation complete: {} tokens in {:.2}s ({:.1} t/s)",
            tokens_generated,
            elapsed.as_secs_f64(),
            tokens_generated as f64 / elapsed.as_secs_f64()
        );

        Ok(AIResponse {
            text: output,
            tokens_generated,
            time_ms,
        })
    }

    /// Get model information
    pub fn info(&self) -> ModelInfo {
        ModelInfo {
            name: format!("Qwen 2.5 (Ollama: {})", self.model_name),
            path: self.model_path.clone(),
            size_bytes: 0, // Ollama manages the model
            is_loaded: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_request_validation() {
        let mut request = GenerateRequest::default();
        request.prompt = "Test".to_string();
        assert!(request.validate().is_ok());

        request.temperature = Some(3.0);
        assert!(request.validate().is_err());

        request.temperature = Some(0.7);
        request.top_p = Some(1.5);
        assert!(request.validate().is_err());
    }

    #[test]
    fn test_config_validation() {
        let mut config = AIConfig::default();
        assert!(config.validate().is_ok());

        config.context_size = 0;
        assert!(config.validate().is_err());

        config.context_size = 4096;
        config.num_threads = 0;
        assert!(config.validate().is_err());
    }
}
