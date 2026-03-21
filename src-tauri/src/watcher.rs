// File system watcher for detecting external changes
// Monitors workspace directory and notifies frontend of changes

use notify::{Watcher, RecursiveMode, Event, EventKind};
use std::path::Path;
use std::sync::mpsc::channel;
use std::time::Duration;
use log::{info, warn, error};

/// File system event types
#[derive(Debug, Clone, serde::Serialize)]
pub enum FileSystemEvent {
    Created { path: String },
    Modified { path: String },
    Deleted { path: String },
    Renamed { old_path: String, new_path: String },
}

/// Start watching a directory for changes
/// 
/// # Arguments
/// * `path` - Directory path to watch
/// * `callback` - Function to call when changes are detected
/// 
/// # Returns
/// * `Result<(), String>` - Success or error message
pub fn start_watching<F>(path: &str, mut callback: F) -> Result<(), String>
where
    F: FnMut(FileSystemEvent) + Send + 'static,
{
    info!("Starting file watcher for: {}", path);
    
    let (tx, rx) = channel();
    
    // Create watcher with 2 second debounce
    let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        match res {
            Ok(event) => {
                if let Err(e) = tx.send(event) {
                    error!("Failed to send event: {}", e);
                }
            }
            Err(e) => error!("Watch error: {:?}", e),
        }
    })
    .map_err(|e| format!("Failed to create watcher: {}", e))?;
    
    // Start watching
    watcher
        .watch(Path::new(path), RecursiveMode::Recursive)
        .map_err(|e| format!("Failed to watch path: {}", e))?;
    
    // Spawn thread to handle events
    std::thread::spawn(move || {
        loop {
            match rx.recv_timeout(Duration::from_secs(1)) {
                Ok(event) => {
                    if let Some(fs_event) = process_event(event) {
                        callback(fs_event);
                    }
                }
                Err(std::sync::mpsc::RecvTimeoutError::Timeout) => continue,
                Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                    warn!("Watcher channel disconnected");
                    break;
                }
            }
        }
        
        // Keep watcher alive
        drop(watcher);
    });
    
    Ok(())
}

/// Process notify event into our FileSystemEvent
fn process_event(event: Event) -> Option<FileSystemEvent> {
    match event.kind {
        EventKind::Create(_) => {
            if let Some(path) = event.paths.first() {
                Some(FileSystemEvent::Created {
                    path: path.to_string_lossy().to_string(),
                })
            } else {
                None
            }
        }
        EventKind::Modify(_) => {
            if let Some(path) = event.paths.first() {
                Some(FileSystemEvent::Modified {
                    path: path.to_string_lossy().to_string(),
                })
            } else {
                None
            }
        }
        EventKind::Remove(_) => {
            if let Some(path) = event.paths.first() {
                Some(FileSystemEvent::Deleted {
                    path: path.to_string_lossy().to_string(),
                })
            } else {
                None
            }
        }
        EventKind::Other => {
            // Handle rename events
            if event.paths.len() == 2 {
                Some(FileSystemEvent::Renamed {
                    old_path: event.paths[0].to_string_lossy().to_string(),
                    new_path: event.paths[1].to_string_lossy().to_string(),
                })
            } else {
                None
            }
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::sync::{Arc, Mutex};
    use tempfile::TempDir;
    
    #[test]
    fn test_file_watcher_create() {
        let temp_dir = TempDir::new().unwrap();
        let events = Arc::new(Mutex::new(Vec::new()));
        let events_clone = Arc::clone(&events);
        
        start_watching(
            temp_dir.path().to_str().unwrap(),
            move |event| {
                events_clone.lock().unwrap().push(event);
            },
        )
        .unwrap();
        
        // Create a file
        let test_file = temp_dir.path().join("test.md");
        fs::write(&test_file, "test content").unwrap();
        
        // Wait for event
        std::thread::sleep(Duration::from_millis(500));
        
        let captured_events = events.lock().unwrap();
        assert!(!captured_events.is_empty());
    }
    
    #[test]
    fn test_file_watcher_modify() {
        let temp_dir = TempDir::new().unwrap();
        let test_file = temp_dir.path().join("test.md");
        fs::write(&test_file, "initial").unwrap();
        
        let events = Arc::new(Mutex::new(Vec::new()));
        let events_clone = Arc::clone(&events);
        
        start_watching(
            temp_dir.path().to_str().unwrap(),
            move |event| {
                events_clone.lock().unwrap().push(event);
            },
        )
        .unwrap();
        
        // Modify the file
        fs::write(&test_file, "modified content").unwrap();
        
        // Wait for event
        std::thread::sleep(Duration::from_millis(500));
        
        let captured_events = events.lock().unwrap();
        assert!(!captured_events.is_empty());
    }
}
