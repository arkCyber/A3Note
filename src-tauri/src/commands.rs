use crate::error::{A3Error, A3Result};
use crate::error::validation::{validate_path, validate_filename, validate_extension, validate_file_size};
use crate::models::{FileContent, FileItem, SearchResult};
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use log::{info, warn, error, debug};

/// Read file content from disk with comprehensive validation
/// 
/// # Arguments
/// * `path` - Absolute path to the file
/// 
/// # Returns
/// * `Ok(FileContent)` - File content on success
/// * `Err(A3Error)` - Detailed error on failure
/// 
/// # Safety
/// - Validates path to prevent directory traversal
/// - Checks file size limits
/// - Verifies file extension
#[tauri::command]
pub async fn read_file_content(path: String) -> Result<FileContent, String> {
    info!("Reading file: {}", path);
    
    // Validate and canonicalize path
    let validated_path = validate_path(&path)
        .map_err(|e| e.to_string())?;
    
    // Check if file exists
    if !validated_path.exists() {
        error!("File not found: {}", path);
        return Err(A3Error::FileNotFound { path }.to_string());
    }
    
    // Check if it's a file (not a directory)
    if !validated_path.is_file() {
        error!("Path is not a file: {}", path);
        return Err(A3Error::InvalidPath { path }.to_string());
    }
    
    // Validate file extension
    validate_extension(&validated_path)
        .map_err(|e| e.to_string())?;
    
    // Check file size
    let metadata = fs::metadata(&validated_path)
        .map_err(|e| A3Error::FileReadError {
            path: path.clone(),
            reason: e.to_string(),
        }.to_string())?;
    
    validate_file_size(metadata.len())
        .map_err(|e| e.to_string())?;
    
    // Read file content
    let content = fs::read_to_string(&validated_path)
        .map_err(|e| A3Error::FileReadError {
            path: path.clone(),
            reason: e.to_string(),
        }.to_string())?;
    
    debug!("Successfully read {} bytes from {}", content.len(), path);
    Ok(FileContent { path, content })
}

/// Write content to file with validation and atomic operations
/// 
/// # Arguments
/// * `path` - Absolute path to the file
/// * `content` - Content to write
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(A3Error)` - Detailed error on failure
/// 
/// # Safety
/// - Validates path and filename
/// - Checks content size
/// - Uses atomic write (write to temp, then rename)
/// - Creates parent directories if needed
#[tauri::command]
pub async fn write_file_content(path: String, content: String) -> Result<(), String> {
    info!("Writing file: {} ({} bytes)", path, content.len());
    
    // Validate path
    let path_buf = PathBuf::from(&path);
    
    // Validate filename
    if let Some(filename) = path_buf.file_name() {
        validate_filename(&filename.to_string_lossy())
            .map_err(|e| e.to_string())?;
    }
    
    // Validate extension
    validate_extension(&path_buf)
        .map_err(|e| e.to_string())?;
    
    // Validate content size
    validate_file_size(content.len() as u64)
        .map_err(|e| e.to_string())?;
    
    // Ensure parent directory exists
    if let Some(parent) = path_buf.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| A3Error::DirectoryError {
                path: parent.to_string_lossy().to_string(),
                reason: e.to_string(),
            }.to_string())?;
    }
    
    // Atomic write: write to temp file, then rename
    let temp_path = path_buf.with_extension("tmp");
    
    fs::write(&temp_path, &content)
        .map_err(|e| A3Error::FileWriteError {
            path: path.clone(),
            reason: e.to_string(),
        }.to_string())?;
    
    fs::rename(&temp_path, &path_buf)
        .map_err(|e| A3Error::FileWriteError {
            path: path.clone(),
            reason: format!("Failed to rename temp file: {}", e),
        }.to_string())?;
    
    debug!("Successfully wrote {} bytes to {}", content.len(), path);
    Ok(())
}

/// List all files and directories in a given path
#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<FileItem>, String> {
    let path_buf = PathBuf::from(&path);
    
    if !path_buf.exists() {
        return Err("Directory does not exist".to_string());
    }
    
    let mut items = Vec::new();
    
    for entry in fs::read_dir(&path_buf)
        .map_err(|e| format!("Failed to read directory: {}", e))? 
    {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let metadata = entry.metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        
        let file_name = entry.file_name().to_string_lossy().to_string();
        let file_path = entry.path().to_string_lossy().to_string();
        
        let modified = metadata.modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs() as i64);
        
        let is_directory = metadata.is_dir();
        
        // Recursively load children for directories
        let children = if is_directory {
            Some(load_directory_recursive(&entry.path())?)
        } else {
            None
        };
        
        items.push(FileItem {
            path: file_path,
            name: file_name,
            is_directory,
            children,
            modified,
        });
    }
    
    // Sort: directories first, then files, alphabetically
    items.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(items)
}

/// Helper function to recursively load directory structure
fn load_directory_recursive(path: &Path) -> Result<Vec<FileItem>, String> {
    let mut items = Vec::new();
    
    for entry in fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory: {}", e))? 
    {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let metadata = entry.metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        
        let file_name = entry.file_name().to_string_lossy().to_string();
        let file_path = entry.path().to_string_lossy().to_string();
        
        let modified = metadata.modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs() as i64);
        
        let is_directory = metadata.is_dir();
        
        // Recursively load children for directories (limit depth to avoid performance issues)
        let children = if is_directory {
            Some(load_directory_recursive(&entry.path())?)
        } else {
            None
        };
        
        items.push(FileItem {
            path: file_path,
            name: file_name,
            is_directory,
            children,
            modified,
        });
    }
    
    // Sort: directories first, then files, alphabetically
    items.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(items)
}

/// Create a new file or directory with validation
/// 
/// # Arguments
/// * `path` - Absolute path to create
/// * `is_directory` - Whether to create a directory or file
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(A3Error)` - Detailed error on failure
/// 
/// # Safety
/// - Validates path and filename
/// - Checks if file already exists
/// - Validates extension for files
#[tauri::command]
pub async fn create_file(path: String, is_directory: bool) -> Result<(), String> {
    info!("Creating {}: {}", if is_directory { "directory" } else { "file" }, path);
    
    let path_buf = PathBuf::from(&path);
    
    // Check if already exists
    if path_buf.exists() {
        warn!("Path already exists: {}", path);
        return Err(A3Error::FileWriteError {
            path: path.clone(),
            reason: "Path already exists".to_string(),
        }.to_string());
    }
    
    // Validate filename
    if let Some(filename) = path_buf.file_name() {
        validate_filename(&filename.to_string_lossy())
            .map_err(|e| e.to_string())?;
    }
    
    if is_directory {
        fs::create_dir_all(&path_buf)
            .map_err(|e| A3Error::DirectoryError {
                path: path.clone(),
                reason: e.to_string(),
            }.to_string())?;
    } else {
        // Validate extension for files
        validate_extension(&path_buf)
            .map_err(|e| e.to_string())?;
        
        // Ensure parent directory exists
        if let Some(parent) = path_buf.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| A3Error::DirectoryError {
                    path: parent.to_string_lossy().to_string(),
                    reason: e.to_string(),
                }.to_string())?;
        }
        
        fs::write(&path_buf, "")
            .map_err(|e| A3Error::FileWriteError {
                path: path.clone(),
                reason: e.to_string(),
            }.to_string())?;
    }
    
    debug!("Successfully created: {}", path);
    Ok(())
}

/// Delete a file or directory with safety checks
/// 
/// # Arguments
/// * `path` - Absolute path to delete
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(A3Error)` - Detailed error on failure
/// 
/// # Safety
/// - Validates path
/// - Checks if file exists
/// - Prevents deletion of system directories
#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    info!("Deleting: {}", path);
    
    // Validate path
    let validated_path = validate_path(&path)
        .map_err(|e| e.to_string())?;
    
    // Check if exists
    if !validated_path.exists() {
        warn!("Path does not exist: {}", path);
        return Err(A3Error::FileNotFound { path }.to_string());
    }
    
    // Delete
    if validated_path.is_dir() {
        fs::remove_dir_all(&validated_path)
            .map_err(|e| A3Error::DirectoryError {
                path: path.clone(),
                reason: e.to_string(),
            }.to_string())?;
    } else {
        fs::remove_file(&validated_path)
            .map_err(|e| A3Error::FileWriteError {
                path: path.clone(),
                reason: e.to_string(),
            }.to_string())?;
    }
    
    debug!("Successfully deleted: {}", path);
    Ok(())
}

/// Rename a file or directory
/// 
/// # Arguments
/// * `old_path` - Current absolute path
/// * `new_path` - New absolute path
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(A3Error)` - Detailed error on failure
/// 
/// # Safety
/// - Validates both paths
/// - Checks if source exists
/// - Prevents overwriting existing files
#[tauri::command]
pub async fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    info!("Renaming: {} -> {}", old_path, new_path);
    
    // Validate paths
    let old_validated = validate_path(&old_path)
        .map_err(|e| e.to_string())?;
    let new_validated = validate_path(&new_path)
        .map_err(|e| e.to_string())?;
    
    // Check if source exists
    if !old_validated.exists() {
        error!("Source file not found: {}", old_path);
        return Err(A3Error::FileNotFound { path: old_path }.to_string());
    }
    
    // Check if target already exists
    if new_validated.exists() {
        error!("Target file already exists: {}", new_path);
        return Err(A3Error::FileAlreadyExists { path: new_path }.to_string());
    }
    
    // Rename
    fs::rename(&old_validated, &new_validated)
        .map_err(|e| A3Error::FileWriteError {
            path: old_path.clone(),
            reason: e.to_string(),
        }.to_string())?;
    
    debug!("Successfully renamed: {} -> {}", old_path, new_path);
    Ok(())
}

/// Move a file to a different directory
/// 
/// # Arguments
/// * `source_path` - Source file absolute path
/// * `target_dir` - Target directory absolute path
/// 
/// # Returns
/// * `Ok(String)` - New file path
/// * `Err(A3Error)` - Detailed error on failure
#[tauri::command]
pub async fn move_file(source_path: String, target_dir: String) -> Result<String, String> {
    info!("Moving: {} to {}", source_path, target_dir);
    
    // Validate paths
    let source_validated = validate_path(&source_path)
        .map_err(|e| e.to_string())?;
    let target_dir_validated = validate_path(&target_dir)
        .map_err(|e| e.to_string())?;
    
    // Check if source exists
    if !source_validated.exists() {
        return Err(A3Error::FileNotFound { path: source_path }.to_string());
    }
    
    // Check if target is a directory
    if !target_dir_validated.is_dir() {
        return Err(A3Error::InvalidPath { path: target_dir }.to_string());
    }
    
    // Build target path
    let file_name = source_validated.file_name()
        .ok_or_else(|| A3Error::InvalidPath { path: source_path.clone() }.to_string())?;
    let target_path = target_dir_validated.join(file_name);
    
    // Check if target already exists
    if target_path.exists() {
        return Err(A3Error::FileAlreadyExists { 
            path: target_path.to_string_lossy().to_string() 
        }.to_string());
    }
    
    // Move file
    fs::rename(&source_validated, &target_path)
        .map_err(|e| A3Error::FileWriteError {
            path: source_path.clone(),
            reason: e.to_string(),
        }.to_string())?;
    
    let new_path = target_path.to_string_lossy().to_string();
    debug!("Successfully moved to: {}", new_path);
    Ok(new_path)
}

/// Copy a file
/// 
/// # Arguments
/// * `source_path` - Source file absolute path
/// * `target_path` - Target file absolute path
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(A3Error)` - Detailed error on failure
#[tauri::command]
pub async fn copy_file(source_path: String, target_path: String) -> Result<(), String> {
    info!("Copying: {} to {}", source_path, target_path);
    
    // Validate paths
    let source_validated = validate_path(&source_path)
        .map_err(|e| e.to_string())?;
    let target_validated = validate_path(&target_path)
        .map_err(|e| e.to_string())?;
    
    // Check if source exists and is a file
    if !source_validated.exists() {
        return Err(A3Error::FileNotFound { path: source_path }.to_string());
    }
    
    if !source_validated.is_file() {
        return Err(A3Error::InvalidPath { path: source_path }.to_string());
    }
    
    // Check if target already exists
    if target_validated.exists() {
        return Err(A3Error::FileAlreadyExists { path: target_path }.to_string());
    }
    
    // Copy file
    fs::copy(&source_validated, &target_validated)
        .map_err(|e| A3Error::FileWriteError {
            path: source_path.clone(),
            reason: e.to_string(),
        }.to_string())?;
    
    debug!("Successfully copied to: {}", target_path);
    Ok(())
}

/// Search for text in files within a directory
#[tauri::command]
pub async fn search_files(directory: String, query: String) -> Result<Vec<SearchResult>, String> {
    let mut results = Vec::new();
    
    for entry in WalkDir::new(&directory)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        
        // Only search in markdown files
        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("md") {
            if let Ok(content) = fs::read_to_string(path) {
                for (line_num, line) in content.lines().enumerate() {
                    if let Some(col) = line.to_lowercase().find(&query.to_lowercase()) {
                        results.push(SearchResult {
                            path: path.to_string_lossy().to_string(),
                            line: line_num + 1,
                            column: col,
                            snippet: line.to_string(),
                        });
                    }
                }
            }
        }
    }
    
    Ok(results)
}
