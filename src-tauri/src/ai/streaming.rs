// Streaming Response Support - Aerospace Grade
// NOTE: Streaming support requires async runtime
// This is a placeholder for future implementation

use serde::{Deserialize, Serialize};

/// Streaming response chunk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChunk {
    pub token: String,
    pub done: bool,
    pub total_tokens: usize,
}

/// Streaming callback type
pub type StreamCallback = Box<dyn FnMut(StreamChunk) -> Result<(), String> + Send>;

// TODO: Implement streaming when async runtime is available
// For now, we use blocking requests in llama.rs

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_stream_chunk_serialization() {
        let chunk = StreamChunk {
            token: "test".to_string(),
            done: false,
            total_tokens: 1,
        };
        
        let json = serde_json::to_string(&chunk).unwrap();
        assert!(json.contains("test"));
        assert!(json.contains("false"));
    }
}
