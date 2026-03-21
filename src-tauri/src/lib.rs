// Library entry point for A3Note
// This allows running `cargo test --lib` for unit tests

pub mod commands;
pub mod error;
pub mod export;
pub mod models;
pub mod search;
pub mod watcher;

// Re-export commonly used types
pub use error::{A3Error, A3Result};
pub use models::{FileContent, FileItem, SearchResult};
