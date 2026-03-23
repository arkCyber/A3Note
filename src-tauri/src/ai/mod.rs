// AI Module - Aerospace Grade
// Local inference with comprehensive error handling and logging

pub mod types;
pub mod error;
pub mod llama;
pub mod service;
pub mod streaming;
pub mod embedding;
pub mod vector_index;
pub mod rag;

// Re-export commonly used types
pub use types::*;
pub use error::AIError;
pub use service::AIService;
pub use streaming::{StreamChunk, StreamCallback};
pub use embedding::EmbeddingService;
pub use vector_index::{VectorIndex, DocumentMetadata, SearchResult};
pub use rag::{RAGService, RAGResponse};
