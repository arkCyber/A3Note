use serde::{Deserialize, Serialize};
use std::fmt;

/// Custom error types for A3Note application
/// Following aerospace-grade error handling standards
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum A3Error {
    /// File system errors
    FileNotFound { path: String },
    FileReadError { path: String, reason: String },
    FileWriteError { path: String, reason: String },
    DirectoryError { path: String, reason: String },
    InvalidPath { path: String },
    PermissionDenied { path: String },
    FileAlreadyExists { path: String },
    
    /// Validation errors
    InvalidFileName { name: String, reason: String },
    InvalidContent { reason: String },
    PathTraversal { path: String },
    
    /// Search errors
    SearchError { reason: String },
    IndexError { reason: String },
    
    /// System errors
    IoError { reason: String },
    SerializationError { reason: String },
    UnknownError { reason: String },
}

impl fmt::Display for A3Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            A3Error::FileNotFound { path } => {
                write!(f, "File not found: {}", path)
            }
            A3Error::FileReadError { path, reason } => {
                write!(f, "Failed to read file '{}': {}", path, reason)
            }
            A3Error::FileWriteError { path, reason } => {
                write!(f, "Failed to write file '{}': {}", path, reason)
            }
            A3Error::DirectoryError { path, reason } => {
                write!(f, "Directory error for '{}': {}", path, reason)
            }
            A3Error::InvalidPath { path } => {
                write!(f, "Invalid path: {}", path)
            }
            A3Error::PermissionDenied { path } => {
                write!(f, "Permission denied: {}", path)
            }
            A3Error::FileAlreadyExists { path } => {
                write!(f, "File already exists: {}", path)
            }
            A3Error::InvalidFileName { name, reason } => {
                write!(f, "Invalid file name '{}': {}", name, reason)
            }
            A3Error::InvalidContent { reason } => {
                write!(f, "Invalid content: {}", reason)
            }
            A3Error::PathTraversal { path } => {
                write!(f, "Path traversal attempt detected: {}", path)
            }
            A3Error::SearchError { reason } => {
                write!(f, "Search error: {}", reason)
            }
            A3Error::IndexError { reason } => {
                write!(f, "Index error: {}", reason)
            }
            A3Error::IoError { reason } => {
                write!(f, "I/O error: {}", reason)
            }
            A3Error::SerializationError { reason } => {
                write!(f, "Serialization error: {}", reason)
            }
            A3Error::UnknownError { reason } => {
                write!(f, "Unknown error: {}", reason)
            }
        }
    }
}

impl std::error::Error for A3Error {}

impl From<std::io::Error> for A3Error {
    fn from(err: std::io::Error) -> Self {
        A3Error::IoError {
            reason: err.to_string(),
        }
    }
}

impl From<serde_json::Error> for A3Error {
    fn from(err: serde_json::Error) -> Self {
        A3Error::SerializationError {
            reason: err.to_string(),
        }
    }
}

/// Result type alias for A3Note operations
pub type A3Result<T> = Result<T, A3Error>;

/// Validation utilities
pub mod validation {
    use super::A3Error;
    use std::path::{Path, PathBuf};

    /// Maximum file size: 100MB
    pub const MAX_FILE_SIZE: u64 = 100 * 1024 * 1024;
    
    /// Maximum path length
    pub const MAX_PATH_LENGTH: usize = 4096;
    
    /// Allowed file extensions
    pub const ALLOWED_EXTENSIONS: &[&str] = &["md", "markdown", "txt"];

    /// Validate file path for security
    pub fn validate_path(path: &str) -> Result<PathBuf, A3Error> {
        // Check path length
        if path.len() > MAX_PATH_LENGTH {
            return Err(A3Error::InvalidPath {
                path: path.to_string(),
            });
        }

        // Convert to PathBuf
        let path_buf = PathBuf::from(path);

        // Check for path traversal attempts
        if path.contains("..") {
            return Err(A3Error::PathTraversal {
                path: path.to_string(),
            });
        }

        // Canonicalize path to resolve symlinks and relative paths
        let canonical = path_buf.canonicalize().map_err(|e| A3Error::InvalidPath {
            path: format!("{}: {}", path, e),
        })?;

        Ok(canonical)
    }

    /// Validate file name
    pub fn validate_filename(name: &str) -> Result<(), A3Error> {
        // Check for empty name
        if name.is_empty() {
            return Err(A3Error::InvalidFileName {
                name: name.to_string(),
                reason: "File name cannot be empty".to_string(),
            });
        }

        // Check for invalid characters
        let invalid_chars = ['/', '\\', '\0', '<', '>', ':', '"', '|', '?', '*'];
        if name.chars().any(|c| invalid_chars.contains(&c)) {
            return Err(A3Error::InvalidFileName {
                name: name.to_string(),
                reason: "File name contains invalid characters".to_string(),
            });
        }

        // Check for reserved names (Windows)
        let reserved = ["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4",
                       "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2",
                       "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"];
        let name_upper = name.to_uppercase();
        if reserved.contains(&name_upper.as_str()) {
            return Err(A3Error::InvalidFileName {
                name: name.to_string(),
                reason: "File name is reserved".to_string(),
            });
        }

        Ok(())
    }

    /// Validate file extension
    pub fn validate_extension(path: &Path) -> Result<(), A3Error> {
        if let Some(ext) = path.extension() {
            let ext_str = ext.to_string_lossy().to_lowercase();
            if !ALLOWED_EXTENSIONS.contains(&ext_str.as_str()) {
                return Err(A3Error::InvalidFileName {
                    name: path.to_string_lossy().to_string(),
                    reason: format!("Extension '{}' not allowed", ext_str),
                });
            }
        }
        Ok(())
    }

    /// Validate file size
    pub fn validate_file_size(size: u64) -> Result<(), A3Error> {
        if size > MAX_FILE_SIZE {
            return Err(A3Error::InvalidContent {
                reason: format!("File size {} exceeds maximum of {}", size, MAX_FILE_SIZE),
            });
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::validation::*;

    #[test]
    fn test_validate_filename_valid() {
        assert!(validate_filename("test.md").is_ok());
        assert!(validate_filename("my-note.md").is_ok());
        assert!(validate_filename("note_123.md").is_ok());
    }

    #[test]
    fn test_validate_filename_invalid() {
        assert!(validate_filename("").is_err());
        assert!(validate_filename("test/file.md").is_err());
        assert!(validate_filename("test\\file.md").is_err());
        assert!(validate_filename("test:file.md").is_err());
        assert!(validate_filename("CON").is_err());
        assert!(validate_filename("NUL").is_err());
    }

    #[test]
    fn test_validate_extension() {
        use std::path::Path;
        
        assert!(validate_extension(Path::new("test.md")).is_ok());
        assert!(validate_extension(Path::new("test.markdown")).is_ok());
        assert!(validate_extension(Path::new("test.txt")).is_ok());
        assert!(validate_extension(Path::new("test.exe")).is_err());
        assert!(validate_extension(Path::new("test.sh")).is_err());
    }

    #[test]
    fn test_validate_file_size() {
        assert!(validate_file_size(1024).is_ok());
        assert!(validate_file_size(1024 * 1024).is_ok());
        assert!(validate_file_size(MAX_FILE_SIZE).is_ok());
        assert!(validate_file_size(MAX_FILE_SIZE + 1).is_err());
    }

    #[test]
    fn test_path_traversal_detection() {
        assert!(validate_path("../etc/passwd").is_err());
        assert!(validate_path("../../secret").is_err());
    }
}
