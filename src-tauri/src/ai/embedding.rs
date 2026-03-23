// Embedding Service - Aerospace Grade
// Vector embeddings for semantic search and knowledge graph

use std::collections::HashMap;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

use super::error::{AIError, AIResult};

/// Ollama embedding request
#[derive(Debug, Serialize)]
struct OllamaEmbedRequest {
    model: String,
    prompt: String,
}

/// Ollama embedding response
#[derive(Debug, Deserialize)]
struct OllamaEmbedResponse {
    embedding: Vec<f32>,
}

/// Embedding service for semantic operations
pub struct EmbeddingService {
    ollama_url: String,
    model: String,
    cache: HashMap<String, Vec<f32>>,
}

impl EmbeddingService {
    /// Create new embedding service
    pub fn new() -> Self {
        Self {
            ollama_url: "http://localhost:11434".to_string(),
            model: "nomic-embed-text".to_string(),
            cache: HashMap::new(),
        }
    }

    /// Create with custom configuration
    pub fn with_config(ollama_url: String, model: String) -> Self {
        Self {
            ollama_url,
            model,
            cache: HashMap::new(),
        }
    }

    /// Generate embedding for text
    /// 
    /// # Arguments
    /// * `text` - Text to embed
    /// 
    /// # Returns
    /// * Vector of f32 values representing the embedding
    pub fn embed(&mut self, text: &str) -> AIResult<Vec<f32>> {
        log::debug!("Generating embedding for text: {} chars", text.len());
        
        // Check cache first
        if let Some(cached) = self.cache.get(text) {
            log::debug!("Cache hit for embedding");
            return Ok(cached.clone());
        }

        // Validate input
        if text.is_empty() {
            return Err(AIError::InvalidRequest("Text cannot be empty".to_string()));
        }

        if text.len() > 8192 {
            log::warn!("Text too long ({}), truncating to 8192 chars", text.len());
        }

        let text_truncated = if text.len() > 8192 {
            &text[..8192]
        } else {
            text
        };

        // Create request
        let request = OllamaEmbedRequest {
            model: self.model.clone(),
            prompt: text_truncated.to_string(),
        };

        // Make HTTP request
        let client = reqwest::blocking::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .map_err(|e| AIError::InternalError(format!("HTTP client error: {}", e)))?;

        let url = format!("{}/api/embeddings", self.ollama_url);
        
        log::debug!("Calling Ollama Embedding API: {}", url);
        
        let response = client
            .post(&url)
            .json(&request)
            .send()
            .map_err(|e| {
                log::error!("Embedding API request failed: {}", e);
                if e.is_connect() {
                    AIError::InferenceError(
                        "Cannot connect to Ollama. Please ensure:\n\
                        1. Ollama is running (ollama serve)\n\
                        2. Embedding model is installed (ollama pull nomic-embed-text)".to_string()
                    )
                } else {
                    AIError::InferenceError(format!("Embedding API error: {}", e))
                }
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().unwrap_or_default();
            log::error!("Ollama Embedding API error: {} - {}", status, error_text);
            return Err(AIError::InferenceError(format!(
                "Embedding API error {}: {}. Make sure the model is installed (ollama pull nomic-embed-text)",
                status, error_text
            )));
        }

        let embed_response: OllamaEmbedResponse = response
            .json()
            .map_err(|e| {
                log::error!("Failed to parse embedding response: {}", e);
                AIError::InferenceError(format!("Invalid embedding response: {}", e))
            })?;

        let embedding = embed_response.embedding;
        
        log::info!("Generated embedding: {} dimensions", embedding.len());

        // Cache the result
        if self.cache.len() < 1000 {
            self.cache.insert(text.to_string(), embedding.clone());
        }

        Ok(embedding)
    }

    /// Calculate cosine similarity between two embeddings
    /// 
    /// # Arguments
    /// * `a` - First embedding vector
    /// * `b` - Second embedding vector
    /// 
    /// # Returns
    /// * Similarity score between -1.0 and 1.0 (higher is more similar)
    pub fn cosine_similarity(a: &[f32], b: &[f32]) -> AIResult<f32> {
        if a.len() != b.len() {
            return Err(AIError::InternalError(
                format!("Embedding dimension mismatch: {} vs {}", a.len(), b.len())
            ));
        }

        if a.is_empty() {
            return Err(AIError::InternalError("Empty embeddings".to_string()));
        }

        let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

        if norm_a == 0.0 || norm_b == 0.0 {
            return Ok(0.0);
        }

        Ok(dot_product / (norm_a * norm_b))
    }

    /// Clear embedding cache
    pub fn clear_cache(&mut self) {
        self.cache.clear();
        log::info!("Embedding cache cleared");
    }

    /// Get cache size
    pub fn cache_size(&self) -> usize {
        self.cache.len()
    }
}

impl Default for EmbeddingService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cosine_similarity_identical() {
        let a = vec![1.0, 2.0, 3.0];
        let b = vec![1.0, 2.0, 3.0];
        let sim = EmbeddingService::cosine_similarity(&a, &b).unwrap();
        assert!((sim - 1.0).abs() < 0.0001);
    }

    #[test]
    fn test_cosine_similarity_orthogonal() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![0.0, 1.0, 0.0];
        let sim = EmbeddingService::cosine_similarity(&a, &b).unwrap();
        assert!((sim - 0.0).abs() < 0.0001);
    }

    #[test]
    fn test_cosine_similarity_opposite() {
        let a = vec![1.0, 2.0, 3.0];
        let b = vec![-1.0, -2.0, -3.0];
        let sim = EmbeddingService::cosine_similarity(&a, &b).unwrap();
        assert!((sim - (-1.0)).abs() < 0.0001);
    }

    #[test]
    fn test_cosine_similarity_dimension_mismatch() {
        let a = vec![1.0, 2.0];
        let b = vec![1.0, 2.0, 3.0];
        let result = EmbeddingService::cosine_similarity(&a, &b);
        assert!(result.is_err());
    }

    #[test]
    fn test_embedding_service_creation() {
        let service = EmbeddingService::new();
        assert_eq!(service.model, "nomic-embed-text");
        assert_eq!(service.cache_size(), 0);
    }
}
