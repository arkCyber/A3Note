// Vector Index - Aerospace Grade
// Efficient storage and retrieval of document embeddings

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};

use super::error::{AIError, AIResult};
use super::embedding::EmbeddingService;

/// Document metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub path: PathBuf,
    pub title: String,
    pub tags: Vec<String>,
    pub links: Vec<String>,
    pub modified: u64,
    pub content_hash: String,
}

/// Vector index entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorEntry {
    pub metadata: DocumentMetadata,
    pub embedding: Vec<f32>,
}

/// Search result with similarity score
#[derive(Debug, Clone)]
pub struct SearchResult {
    pub metadata: DocumentMetadata,
    pub similarity: f32,
}

/// Vector index for semantic search
pub struct VectorIndex {
    entries: Arc<Mutex<HashMap<PathBuf, VectorEntry>>>,
    embedding_service: Arc<Mutex<EmbeddingService>>,
}

impl VectorIndex {
    /// Create new vector index
    pub fn new(embedding_service: EmbeddingService) -> Self {
        Self {
            entries: Arc::new(Mutex::new(HashMap::new())),
            embedding_service: Arc::new(Mutex::new(embedding_service)),
        }
    }

    /// Add or update document in index
    /// 
    /// # Arguments
    /// * `metadata` - Document metadata
    /// * `content` - Document content to embed
    pub fn index_document(&self, metadata: DocumentMetadata, content: &str) -> AIResult<()> {
        log::info!("Indexing document: {:?}", metadata.path);

        // Generate embedding
        let mut embedding_service = self.embedding_service.lock()
            .map_err(|e| AIError::InternalError(format!("Lock error: {}", e)))?;
        
        let embedding = embedding_service.embed(content)?;

        // Store in index
        let entry = VectorEntry {
            metadata: metadata.clone(),
            embedding,
        };

        let mut entries = self.entries.lock()
            .map_err(|e| AIError::InternalError(format!("Lock error: {}", e)))?;
        
        entries.insert(metadata.path.clone(), entry);

        log::info!("Document indexed successfully: {:?}", metadata.path);
        Ok(())
    }

    /// Remove document from index
    pub fn remove_document(&self, path: &PathBuf) -> AIResult<()> {
        let mut entries = self.entries.lock()
            .map_err(|e| AIError::InternalError(format!("Lock error: {}", e)))?;
        
        if entries.remove(path).is_some() {
            log::info!("Document removed from index: {:?}", path);
            Ok(())
        } else {
            Err(AIError::InvalidRequest(format!("Document not found: {:?}", path)))
        }
    }

    /// Search for similar documents
    /// 
    /// # Arguments
    /// * `query` - Query text
    /// * `top_k` - Number of results to return
    /// * `min_similarity` - Minimum similarity threshold (0.0 to 1.0)
    /// 
    /// # Returns
    /// * Vector of search results sorted by similarity (descending)
    pub fn search(&self, query: &str, top_k: usize, min_similarity: f32) -> AIResult<Vec<SearchResult>> {
        log::info!("Searching for: '{}' (top_k={}, min_sim={})", query, top_k, min_similarity);

        // Generate query embedding
        let mut embedding_service = self.embedding_service.lock()
            .map_err(|e| AIError::InternalError(format!("Lock error: {}", e)))?;
        
        let query_embedding = embedding_service.embed(query)?;

        // Search all documents
        let entries = self.entries.lock()
            .map_err(|e| AIError::InternalError(format!("Lock error: {}", e)))?;

        let mut results: Vec<SearchResult> = Vec::new();

        for entry in entries.values() {
            let similarity = EmbeddingService::cosine_similarity(&query_embedding, &entry.embedding)?;
            
            if similarity >= min_similarity {
                results.push(SearchResult {
                    metadata: entry.metadata.clone(),
                    similarity,
                });
            }
        }

        // Sort by similarity (descending)
        results.sort_by(|a, b| b.similarity.partial_cmp(&a.similarity).unwrap());

        // Take top k
        results.truncate(top_k);

        log::info!("Found {} results", results.len());
        Ok(results)
    }

    /// Get document by path
    pub fn get_document(&self, path: &PathBuf) -> AIResult<VectorEntry> {
        let entries = self.entries.lock()
            .map_err(|e| AIError::InternalError(format!("Lock error: {}", e)))?;
        
        entries.get(path)
            .cloned()
            .ok_or_else(|| AIError::InvalidRequest(format!("Document not found: {:?}", path)))
    }

    /// Check if document exists in index
    pub fn contains(&self, path: &PathBuf) -> bool {
        let entries = self.entries.lock().unwrap();
        entries.contains_key(path)
    }

    /// Get total number of indexed documents
    pub fn size(&self) -> usize {
        let entries = self.entries.lock().unwrap();
        entries.len()
    }

    /// Clear all entries
    pub fn clear(&self) -> AIResult<()> {
        let mut entries = self.entries.lock()
            .map_err(|e| AIError::InternalError(format!("Lock error: {}", e)))?;
        
        entries.clear();
        log::info!("Vector index cleared");
        Ok(())
    }

    /// Get all document paths
    pub fn get_all_paths(&self) -> Vec<PathBuf> {
        let entries = self.entries.lock().unwrap();
        entries.keys().cloned().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_metadata(path: &str, title: &str) -> DocumentMetadata {
        DocumentMetadata {
            path: PathBuf::from(path),
            title: title.to_string(),
            tags: vec![],
            links: vec![],
            modified: 0,
            content_hash: String::new(),
        }
    }

    #[test]
    fn test_vector_index_creation() {
        let embedding_service = EmbeddingService::new();
        let index = VectorIndex::new(embedding_service);
        assert_eq!(index.size(), 0);
    }

    #[test]
    fn test_contains() {
        let embedding_service = EmbeddingService::new();
        let index = VectorIndex::new(embedding_service);
        let path = PathBuf::from("/test.md");
        assert!(!index.contains(&path));
    }

    #[test]
    fn test_size() {
        let embedding_service = EmbeddingService::new();
        let index = VectorIndex::new(embedding_service);
        assert_eq!(index.size(), 0);
    }
}
