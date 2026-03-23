use std::fs;
use std::path::PathBuf;
use tauri::command;

#[derive(Debug, thiserror::Error)]
pub enum MediaError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Invalid path: {0}")]
    InvalidPath(String),
    #[error("File too large: {0} bytes")]
    FileTooLarge(usize),
}

impl serde::Serialize for MediaError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

const MAX_FILE_SIZE: usize = 100 * 1024 * 1024; // 100MB

#[command]
pub async fn save_media_file(
    workspace_path: String,
    relative_path: String,
    data: Vec<u8>,
) -> Result<String, MediaError> {
    // Validate file size
    if data.len() > MAX_FILE_SIZE {
        return Err(MediaError::FileTooLarge(data.len()));
    }

    // Construct full path
    let workspace = PathBuf::from(&workspace_path);
    let file_path = workspace.join(&relative_path);

    // Validate path (prevent directory traversal)
    if !file_path.starts_with(&workspace) {
        return Err(MediaError::InvalidPath(
            "Path escapes workspace directory".to_string(),
        ));
    }

    // Create parent directories if they don't exist
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)?;
    }

    // Write file
    fs::write(&file_path, data)?;

    Ok(relative_path)
}

#[command]
pub async fn read_media_file(
    workspace_path: String,
    relative_path: String,
) -> Result<Vec<u8>, MediaError> {
    let workspace = PathBuf::from(&workspace_path);
    let file_path = workspace.join(&relative_path);

    // Validate path
    if !file_path.starts_with(&workspace) {
        return Err(MediaError::InvalidPath(
            "Path escapes workspace directory".to_string(),
        ));
    }

    // Check file exists
    if !file_path.exists() {
        return Err(MediaError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "File not found",
        )));
    }

    // Read file
    let data = fs::read(&file_path)?;

    // Validate size
    if data.len() > MAX_FILE_SIZE {
        return Err(MediaError::FileTooLarge(data.len()));
    }

    Ok(data)
}

#[command]
pub async fn delete_media_file(
    workspace_path: String,
    relative_path: String,
) -> Result<(), MediaError> {
    let workspace = PathBuf::from(&workspace_path);
    let file_path = workspace.join(&relative_path);

    // Validate path
    if !file_path.starts_with(&workspace) {
        return Err(MediaError::InvalidPath(
            "Path escapes workspace directory".to_string(),
        ));
    }

    // Delete file
    if file_path.exists() {
        fs::remove_file(&file_path)?;
    }

    Ok(())
}

#[command]
pub async fn list_media_files(
    workspace_path: String,
    folder: String,
) -> Result<Vec<String>, MediaError> {
    let workspace = PathBuf::from(&workspace_path);
    let folder_path = workspace.join(&folder);

    // Validate path
    if !folder_path.starts_with(&workspace) {
        return Err(MediaError::InvalidPath(
            "Path escapes workspace directory".to_string(),
        ));
    }

    let mut files = Vec::new();

    if folder_path.exists() && folder_path.is_dir() {
        for entry in fs::read_dir(&folder_path)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() {
                if let Some(file_name) = path.file_name() {
                    if let Some(name) = file_name.to_str() {
                        // Check if it's a media file
                        let ext = path
                            .extension()
                            .and_then(|e| e.to_str())
                            .unwrap_or("")
                            .to_lowercase();

                        let is_media = matches!(
                            ext.as_str(),
                            "png" | "jpg" | "jpeg" | "gif" | "webp" | "svg" | "bmp"
                                | "mp4" | "webm" | "ogv" | "mov" | "mkv"
                                | "mp3" | "wav" | "m4a" | "ogg" | "flac"
                        );

                        if is_media {
                            files.push(format!("{}/{}", folder, name));
                        }
                    }
                }
            }
        }
    }

    Ok(files)
}

#[command]
pub async fn get_media_info(
    workspace_path: String,
    relative_path: String,
) -> Result<MediaInfo, MediaError> {
    let workspace = PathBuf::from(&workspace_path);
    let file_path = workspace.join(&relative_path);

    // Validate path
    if !file_path.starts_with(&workspace) {
        return Err(MediaError::InvalidPath(
            "Path escapes workspace directory".to_string(),
        ));
    }

    if !file_path.exists() {
        return Err(MediaError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "File not found",
        )));
    }

    let metadata = fs::metadata(&file_path)?;
    let size = metadata.len() as usize;

    let file_name = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();

    let extension = file_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let media_type = match extension.as_str() {
        "png" | "jpg" | "jpeg" | "gif" | "webp" | "svg" | "bmp" => "image",
        "mp4" | "webm" | "ogv" | "mov" | "mkv" => "video",
        "mp3" | "wav" | "m4a" | "ogg" | "flac" => "audio",
        _ => "unknown",
    }
    .to_string();

    Ok(MediaInfo {
        path: relative_path,
        name: file_name,
        size,
        media_type,
        extension,
    })
}

#[derive(Debug, serde::Serialize)]
pub struct MediaInfo {
    pub path: String,
    pub name: String,
    pub size: usize,
    pub media_type: String,
    pub extension: String,
}
