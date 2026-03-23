// RAG Service - Aerospace Grade
// Retrieval Augmented Generation for knowledge base queries

use std::sync::Arc;

use super::error::{AIError, AIResult};
use super::service::AIService;
use super::vector_index::{VectorIndex, SearchResult};
use super::types::{GenerateRequest, AIResponse};

/// RAG query response
#[derive(Debug, Clone)]
pub struct RAGResponse {
    pub answer: String,
    pub sources: Vec<SearchResult>,
    pub tokens_generated: usize,
    pub time_ms: u64,
}

/// RAG service for knowledge base queries
pub struct RAGService {
    vector_index: Arc<VectorIndex>,
    ai_service: Arc<AIService>,
}

impl RAGService {
    /// Create new RAG service
    pub fn new(vector_index: Arc<VectorIndex>, ai_service: Arc<AIService>) -> Self {
        Self {
            vector_index,
            ai_service,
        }
    }

    /// Query the knowledge base
    /// 
    /// # Arguments
    /// * `question` - User's question
    /// * `top_k` - Number of relevant documents to retrieve
    /// * `min_similarity` - Minimum similarity threshold
    /// 
    /// # Returns
    /// * RAG response with answer and sources
    pub fn query(
        &self,
        question: &str,
        top_k: usize,
        min_similarity: f32,
    ) -> AIResult<RAGResponse> {
        log::info!("RAG query: '{}'", question);
        let start = std::time::Instant::now();

        // Step 1: Retrieve relevant documents
        log::debug!("Retrieving top {} relevant documents", top_k);
        let sources = self.vector_index.search(question, top_k, min_similarity)?;

        if sources.is_empty() {
            log::warn!("No relevant documents found");
            return Err(AIError::InvalidRequest(
                "No relevant documents found in your knowledge base. Try:\n\
                1. Lowering the similarity threshold\n\
                2. Rephrasing your question\n\
                3. Adding more notes to your vault".to_string()
            ));
        }

        log::info!("Found {} relevant documents", sources.len());

        // Step 2: Build context from sources
        let context = self.build_context(&sources)?;
        log::debug!("Context built: {} chars", context.len());

        // Step 3: Generate answer with context
        let prompt = self.build_prompt(question, &context);
        log::debug!("Prompt built: {} chars", prompt.len());

        let request = GenerateRequest {
            prompt,
            max_tokens: Some(512),
            temperature: Some(0.7),
            top_p: Some(0.9),
            stop_sequences: None,
        };

        let ai_response = self.ai_service.generate(request)?;

        let elapsed = start.elapsed();
        log::info!("RAG query complete in {:.2}s", elapsed.as_secs_f64());

        Ok(RAGResponse {
            answer: ai_response.text,
            sources,
            tokens_generated: ai_response.tokens_generated,
            time_ms: elapsed.as_millis() as u64,
        })
    }

    /// Build context from search results
    fn build_context(&self, sources: &[SearchResult]) -> AIResult<String> {
        let mut context = String::new();

        for (i, result) in sources.iter().enumerate() {
            context.push_str(&format!(
                "\n[文档 {}] {}\n相关度: {:.2}%\n",
                i + 1,
                result.metadata.title,
                result.similarity * 100.0
            ));

            // Read file content (simplified - in real implementation, read from file)
            // For now, just use metadata
            if !result.metadata.tags.is_empty() {
                context.push_str(&format!("标签: {}\n", result.metadata.tags.join(", ")));
            }

            context.push_str("\n---\n");
        }

        Ok(context)
    }

    /// Build prompt with question and context
    fn build_prompt(&self, question: &str, context: &str) -> String {
        format!(
            "你是一个智能笔记助手。请根据用户的笔记库回答问题。\n\n\
            用户的相关笔记：\n{}\n\n\
            用户的问题：{}\n\n\
            请基于上述笔记内容回答问题。如果笔记中没有相关信息，请明确说明。\n\n\
            回答：",
            context,
            question
        )
    }

    /// Query with custom prompt template
    pub fn query_with_template(
        &self,
        question: &str,
        template: &str,
        top_k: usize,
        min_similarity: f32,
    ) -> AIResult<RAGResponse> {
        log::info!("RAG query with custom template: '{}'", question);
        let start = std::time::Instant::now();

        // Retrieve relevant documents
        let sources = self.vector_index.search(question, top_k, min_similarity)?;

        if sources.is_empty() {
            return Err(AIError::InvalidRequest("No relevant documents found".to_string()));
        }

        // Build context
        let context = self.build_context(&sources)?;

        // Use custom template
        let prompt = template
            .replace("{context}", &context)
            .replace("{question}", question);

        let request = GenerateRequest {
            prompt,
            max_tokens: Some(512),
            temperature: Some(0.7),
            top_p: Some(0.9),
            stop_sequences: None,
        };

        let ai_response = self.ai_service.generate(request)?;

        let elapsed = start.elapsed();

        Ok(RAGResponse {
            answer: ai_response.text,
            sources,
            tokens_generated: ai_response.tokens_generated,
            time_ms: elapsed.as_millis() as u64,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_prompt() {
        let embedding_service = super::super::embedding::EmbeddingService::new();
        let vector_index = Arc::new(VectorIndex::new(embedding_service));
        let ai_config = super::super::types::AIConfig::default();
        let ai_service = Arc::new(AIService::new(ai_config));
        
        let rag_service = RAGService::new(vector_index, ai_service);
        
        let prompt = rag_service.build_prompt("测试问题", "测试上下文");
        assert!(prompt.contains("测试问题"));
        assert!(prompt.contains("测试上下文"));
    }
}
