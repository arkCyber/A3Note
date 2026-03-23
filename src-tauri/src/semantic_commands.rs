// Semantic AI Commands - Aerospace Grade
// Tauri commands for semantic search and RAG features

use tauri::State;
use std::sync::Arc;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

use crate::ai::{VectorIndex, DocumentMetadata, SearchResult, RAGService, RAGResponse};

/// Search result for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResultDTO {
    pub path: String,
    pub title: String,
    pub tags: Vec<String>,
    pub similarity: f32,
}

impl From<SearchResult> for SearchResultDTO {
    fn from(result: SearchResult) -> Self {
        Self {
            path: result.metadata.path.to_string_lossy().to_string(),
            title: result.metadata.title,
            tags: result.metadata.tags,
            similarity: result.similarity,
        }
    }
}

/// RAG response for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RAGResponseDTO {
    pub answer: String,
    pub sources: Vec<SearchResultDTO>,
    pub tokens_generated: usize,
    pub time_ms: u64,
}

impl From<RAGResponse> for RAGResponseDTO {
    fn from(response: RAGResponse) -> Self {
        Self {
            answer: response.answer,
            sources: response.sources.into_iter().map(Into::into).collect(),
            tokens_generated: response.tokens_generated,
            time_ms: response.time_ms,
        }
    }
}

/// Index a document in the vector index
#[tauri::command]
pub async fn index_document(
    vector_index: State<'_, Arc<VectorIndex>>,
    path: String,
    title: String,
    content: String,
    tags: Vec<String>,
) -> Result<(), String> {
    log::info!("Indexing document: {}", path);

    let metadata = DocumentMetadata {
        path: PathBuf::from(&path),
        title,
        tags,
        links: vec![],
        modified: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        content_hash: format!("{:x}", md5::compute(&content)),
    };

    vector_index
        .index_document(metadata, &content)
        .map_err(|e| {
            log::error!("Failed to index document: {:?}", e);
            e.user_message()
        })
}

/// Remove a document from the vector index
#[tauri::command]
pub async fn remove_from_index(
    vector_index: State<'_, Arc<VectorIndex>>,
    path: String,
) -> Result<(), String> {
    log::info!("Removing document from index: {}", path);

    let path_buf = PathBuf::from(path);
    vector_index
        .remove_document(&path_buf)
        .map_err(|e| {
            log::error!("Failed to remove document: {:?}", e);
            e.user_message()
        })
}

/// Perform semantic search
#[tauri::command]
pub async fn semantic_search(
    vector_index: State<'_, Arc<VectorIndex>>,
    query: String,
    top_k: usize,
    min_similarity: f32,
) -> Result<Vec<SearchResultDTO>, String> {
    log::info!("Semantic search: '{}' (top_k={}, min_sim={})", query, top_k, min_similarity);

    let results = vector_index
        .search(&query, top_k, min_similarity)
        .map_err(|e| {
            log::error!("Semantic search failed: {:?}", e);
            e.user_message()
        })?;

    Ok(results.into_iter().map(Into::into).collect())
}

/// Get semantic link suggestions for current text
#[tauri::command]
pub async fn suggest_links(
    vector_index: State<'_, Arc<VectorIndex>>,
    current_text: String,
    top_k: usize,
) -> Result<Vec<SearchResultDTO>, String> {
    log::info!("Suggesting links for text: {} chars", current_text.len());

    // Extract last paragraph or sentence for context
    let context = current_text
        .lines()
        .rev()
        .take(3)
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
        .collect::<Vec<_>>()
        .join("\n");

    if context.trim().is_empty() {
        return Ok(vec![]);
    }

    let results = vector_index
        .search(&context, top_k, 0.6) // Lower threshold for suggestions
        .map_err(|e| {
            log::error!("Link suggestion failed: {:?}", e);
            e.user_message()
        })?;

    Ok(results.into_iter().map(Into::into).collect())
}

/// Query the knowledge base using RAG
#[tauri::command]
pub async fn rag_query(
    rag_service: State<'_, Arc<RAGService>>,
    question: String,
    top_k: usize,
    min_similarity: f32,
) -> Result<RAGResponseDTO, String> {
    log::info!("RAG query: '{}'", question);

    let response = rag_service
        .query(&question, top_k, min_similarity)
        .map_err(|e| {
            log::error!("RAG query failed: {:?}", e);
            e.user_message()
        })?;

    Ok(response.into())
}

/// Get vector index statistics
#[tauri::command]
pub fn get_index_stats(
    vector_index: State<'_, Arc<VectorIndex>>,
) -> Result<IndexStats, String> {
    let size = vector_index.size();
    let paths = vector_index.get_all_paths();

    Ok(IndexStats {
        total_documents: size,
        indexed_paths: paths.into_iter()
            .map(|p| p.to_string_lossy().to_string())
            .collect(),
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IndexStats {
    pub total_documents: usize,
    pub indexed_paths: Vec<String>,
}

/// Clear the vector index
#[tauri::command]
pub async fn clear_index(
    vector_index: State<'_, Arc<VectorIndex>>,
) -> Result<(), String> {
    log::info!("Clearing vector index");

    vector_index
        .clear()
        .map_err(|e| {
            log::error!("Failed to clear index: {:?}", e);
            e.user_message()
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_result_dto_conversion() {
        let metadata = DocumentMetadata {
            path: PathBuf::from("/test.md"),
            title: "Test".to_string(),
            tags: vec!["tag1".to_string()],
            links: vec![],
            modified: 0,
            content_hash: "abc".to_string(),
        };

        let result = SearchResult {
            metadata,
            similarity: 0.95,
        };

        let dto: SearchResultDTO = result.into();
        assert_eq!(dto.title, "Test");
        assert_eq!(dto.similarity, 0.95);
    }
}
