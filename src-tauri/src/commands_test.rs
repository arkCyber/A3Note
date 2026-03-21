// Comprehensive unit tests for commands module
// Following aerospace-grade testing standards

#[cfg(test)]
mod tests {
    use super::super::*;
    use tempfile::TempDir;
    use std::fs;
    use std::path::PathBuf;

    /// Helper function to create a temporary test directory
    fn setup_test_dir() -> TempDir {
        TempDir::new().expect("Failed to create temp dir")
    }

    /// Helper function to create a test file
    fn create_test_file(dir: &TempDir, name: &str, content: &str) -> PathBuf {
        let file_path = dir.path().join(name);
        fs::write(&file_path, content).expect("Failed to write test file");
        file_path
    }

    #[tokio::test]
    async fn test_read_file_content_success() {
        let temp_dir = setup_test_dir();
        let test_content = "# Test Note\n\nThis is a test.";
        let file_path = create_test_file(&temp_dir, "test.md", test_content);

        let result = read_file_content(file_path.to_string_lossy().to_string()).await;
        
        assert!(result.is_ok());
        let file_content = result.unwrap();
        assert_eq!(file_content.content, test_content);
    }

    #[tokio::test]
    async fn test_read_file_content_not_found() {
        let result = read_file_content("/nonexistent/file.md".to_string()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not found") || result.unwrap_err().contains("Invalid path"));
    }

    #[tokio::test]
    async fn test_read_file_content_invalid_extension() {
        let temp_dir = setup_test_dir();
        let file_path = create_test_file(&temp_dir, "test.exe", "malicious");

        let result = read_file_content(file_path.to_string_lossy().to_string()).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not allowed"));
    }

    #[tokio::test]
    async fn test_write_file_content_success() {
        let temp_dir = setup_test_dir();
        let file_path = temp_dir.path().join("new_file.md");
        let test_content = "# New Note\n\nContent here.";

        let result = write_file_content(
            file_path.to_string_lossy().to_string(),
            test_content.to_string()
        ).await;

        assert!(result.is_ok());
        assert!(file_path.exists());
        
        let written_content = fs::read_to_string(&file_path).unwrap();
        assert_eq!(written_content, test_content);
    }

    #[tokio::test]
    async fn test_write_file_content_creates_parent_dirs() {
        let temp_dir = setup_test_dir();
        let file_path = temp_dir.path().join("subdir").join("nested").join("file.md");
        let test_content = "Nested file content";

        let result = write_file_content(
            file_path.to_string_lossy().to_string(),
            test_content.to_string()
        ).await;

        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    #[tokio::test]
    async fn test_write_file_content_invalid_filename() {
        let temp_dir = setup_test_dir();
        let file_path = temp_dir.path().join("invalid/file.md");

        let result = write_file_content(
            file_path.to_string_lossy().to_string(),
            "content".to_string()
        ).await;

        // Should fail due to invalid character in filename
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_write_file_content_too_large() {
        let temp_dir = setup_test_dir();
        let file_path = temp_dir.path().join("large.md");
        
        // Create content larger than MAX_FILE_SIZE (100MB)
        let large_content = "x".repeat(101 * 1024 * 1024);

        let result = write_file_content(
            file_path.to_string_lossy().to_string(),
            large_content
        ).await;

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("exceeds maximum"));
    }

    #[tokio::test]
    async fn test_create_file_success() {
        let temp_dir = setup_test_dir();
        let file_path = temp_dir.path().join("created.md");

        let result = create_file(
            file_path.to_string_lossy().to_string(),
            false
        ).await;

        assert!(result.is_ok());
        assert!(file_path.exists());
        assert!(file_path.is_file());
    }

    #[tokio::test]
    async fn test_create_directory_success() {
        let temp_dir = setup_test_dir();
        let dir_path = temp_dir.path().join("new_directory");

        let result = create_file(
            dir_path.to_string_lossy().to_string(),
            true
        ).await;

        assert!(result.is_ok());
        assert!(dir_path.exists());
        assert!(dir_path.is_dir());
    }

    #[tokio::test]
    async fn test_create_file_already_exists() {
        let temp_dir = setup_test_dir();
        let file_path = create_test_file(&temp_dir, "existing.md", "content");

        let result = create_file(
            file_path.to_string_lossy().to_string(),
            false
        ).await;

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("already exists"));
    }

    #[tokio::test]
    async fn test_delete_file_success() {
        let temp_dir = setup_test_dir();
        let file_path = create_test_file(&temp_dir, "to_delete.md", "content");

        assert!(file_path.exists());

        let result = delete_file(file_path.to_string_lossy().to_string()).await;

        assert!(result.is_ok());
        assert!(!file_path.exists());
    }

    #[tokio::test]
    async fn test_delete_directory_success() {
        let temp_dir = setup_test_dir();
        let dir_path = temp_dir.path().join("dir_to_delete");
        fs::create_dir(&dir_path).unwrap();
        
        // Create a file inside
        fs::write(dir_path.join("file.md"), "content").unwrap();

        let result = delete_file(dir_path.to_string_lossy().to_string()).await;

        assert!(result.is_ok());
        assert!(!dir_path.exists());
    }

    #[tokio::test]
    async fn test_delete_file_not_found() {
        let result = delete_file("/nonexistent/file.md".to_string()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_list_directory_success() {
        let temp_dir = setup_test_dir();
        
        // Create test structure
        create_test_file(&temp_dir, "file1.md", "content1");
        create_test_file(&temp_dir, "file2.md", "content2");
        fs::create_dir(temp_dir.path().join("subdir")).unwrap();

        let result = list_directory(temp_dir.path().to_string_lossy().to_string()).await;

        assert!(result.is_ok());
        let items = result.unwrap();
        assert_eq!(items.len(), 3);
        
        // Check sorting: directories first
        assert!(items[0].is_directory);
        assert!(!items[1].is_directory);
        assert!(!items[2].is_directory);
    }

    #[tokio::test]
    async fn test_list_directory_not_found() {
        let result = list_directory("/nonexistent/directory".to_string()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_search_files_success() {
        let temp_dir = setup_test_dir();
        
        create_test_file(&temp_dir, "note1.md", "This is a test note with keyword");
        create_test_file(&temp_dir, "note2.md", "Another note without the term");
        create_test_file(&temp_dir, "note3.md", "This has the keyword too");

        let result = search_files(
            temp_dir.path().to_string_lossy().to_string(),
            "keyword".to_string()
        ).await;

        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 2);
        
        for result in &results {
            assert!(result.snippet.to_lowercase().contains("keyword"));
        }
    }

    #[tokio::test]
    async fn test_search_files_case_insensitive() {
        let temp_dir = setup_test_dir();
        
        create_test_file(&temp_dir, "note.md", "UPPERCASE keyword here");

        let result = search_files(
            temp_dir.path().to_string_lossy().to_string(),
            "keyword".to_string()
        ).await;

        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 1);
    }

    #[tokio::test]
    async fn test_search_files_no_results() {
        let temp_dir = setup_test_dir();
        
        create_test_file(&temp_dir, "note.md", "No matching content");

        let result = search_files(
            temp_dir.path().to_string_lossy().to_string(),
            "nonexistent".to_string()
        ).await;

        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 0);
    }

    // Property-based tests using proptest
    #[cfg(feature = "proptest")]
    mod property_tests {
        use super::*;
        use proptest::prelude::*;

        proptest! {
            #[test]
            fn test_write_read_roundtrip(content in "\\PC{0,1000}") {
                let temp_dir = setup_test_dir();
                let file_path = temp_dir.path().join("test.md");
                
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
                    let write_result = write_file_content(
                        file_path.to_string_lossy().to_string(),
                        content.clone()
                    ).await;
                    
                    if write_result.is_ok() {
                        let read_result = read_file_content(
                            file_path.to_string_lossy().to_string()
                        ).await;
                        
                        assert!(read_result.is_ok());
                        assert_eq!(read_result.unwrap().content, content);
                    }
                });
            }
        }
    }
}
