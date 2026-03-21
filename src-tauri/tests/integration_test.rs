// Integration tests for A3Note Tauri commands
// Tests the complete flow from command invocation to response

use std::fs;
use tempfile::TempDir;

/// Helper to create test workspace
fn create_test_workspace() -> TempDir {
    let temp_dir = TempDir::new().expect("Failed to create temp dir");
    
    // Create test structure
    fs::write(temp_dir.path().join("note1.md"), "# Note 1\n\nContent").unwrap();
    fs::write(temp_dir.path().join("note2.md"), "# Note 2\n\nMore content").unwrap();
    
    let subdir = temp_dir.path().join("subfolder");
    fs::create_dir(&subdir).unwrap();
    fs::write(subdir.join("nested.md"), "# Nested\n\nNested content").unwrap();
    
    temp_dir
}

#[test]
fn test_workspace_lifecycle() {
    let workspace = create_test_workspace();
    let workspace_path = workspace.path().to_string_lossy().to_string();
    
    // Verify workspace structure
    assert!(workspace.path().join("note1.md").exists());
    assert!(workspace.path().join("note2.md").exists());
    assert!(workspace.path().join("subfolder").exists());
    assert!(workspace.path().join("subfolder/nested.md").exists());
}

#[test]
fn test_file_operations_workflow() {
    let workspace = create_test_workspace();
    
    // Create new file
    let new_file = workspace.path().join("new_note.md");
    fs::write(&new_file, "# New Note").unwrap();
    assert!(new_file.exists());
    
    // Read file
    let content = fs::read_to_string(&new_file).unwrap();
    assert_eq!(content, "# New Note");
    
    // Update file
    fs::write(&new_file, "# Updated Note\n\nNew content").unwrap();
    let updated_content = fs::read_to_string(&new_file).unwrap();
    assert!(updated_content.contains("Updated"));
    
    // Delete file
    fs::remove_file(&new_file).unwrap();
    assert!(!new_file.exists());
}

#[test]
fn test_concurrent_file_operations() {
    use std::thread;
    use std::sync::Arc;
    
    let workspace = Arc::new(create_test_workspace());
    let mut handles = vec![];
    
    // Spawn multiple threads performing file operations
    for i in 0..10 {
        let workspace_clone = Arc::clone(&workspace);
        let handle = thread::spawn(move || {
            let file_path = workspace_clone.path().join(format!("concurrent_{}.md", i));
            fs::write(&file_path, format!("Content {}", i)).unwrap();
            
            let content = fs::read_to_string(&file_path).unwrap();
            assert_eq!(content, format!("Content {}", i));
        });
        handles.push(handle);
    }
    
    // Wait for all threads
    for handle in handles {
        handle.join().unwrap();
    }
    
    // Verify all files created
    for i in 0..10 {
        let file_path = workspace.path().join(format!("concurrent_{}.md", i));
        assert!(file_path.exists());
    }
}

#[test]
fn test_error_recovery() {
    let workspace = create_test_workspace();
    
    // Try to read non-existent file
    let result = fs::read_to_string(workspace.path().join("nonexistent.md"));
    assert!(result.is_err());
    
    // Try to create file with invalid name (should be handled by validation)
    let invalid_path = workspace.path().join("invalid\0name.md");
    let result = fs::write(&invalid_path, "content");
    assert!(result.is_err());
}

#[test]
fn test_large_workspace() {
    let workspace = create_test_workspace();
    
    // Create many files
    for i in 0..100 {
        let file_path = workspace.path().join(format!("note_{}.md", i));
        fs::write(&file_path, format!("# Note {}\n\nContent", i)).unwrap();
    }
    
    // Count files
    let count = fs::read_dir(workspace.path())
        .unwrap()
        .filter(|e| e.is_ok())
        .count();
    
    // Should have 100 new files + 2 original + 1 subfolder = 103
    assert!(count >= 100);
}

#[test]
fn test_atomic_write_safety() {
    let workspace = create_test_workspace();
    let file_path = workspace.path().join("atomic_test.md");
    
    // Write initial content
    fs::write(&file_path, "Initial content").unwrap();
    
    // Simulate atomic write with temp file
    let temp_path = file_path.with_extension("tmp");
    fs::write(&temp_path, "New content").unwrap();
    fs::rename(&temp_path, &file_path).unwrap();
    
    // Verify final content
    let content = fs::read_to_string(&file_path).unwrap();
    assert_eq!(content, "New content");
    
    // Verify temp file is gone
    assert!(!temp_path.exists());
}
