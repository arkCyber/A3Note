// File Watcher Hook - Aerospace Grade
// Monitors file system changes and auto-refreshes workspace

import { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { log } from '../utils/logger';

export interface FileSystemEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  path: string;
  oldPath?: string;
}

interface UseFileWatcherOptions {
  enabled?: boolean;
  onFileCreated?: (path: string) => void;
  onFileModified?: (path: string) => void;
  onFileDeleted?: (path: string) => void;
  onFileRenamed?: (oldPath: string, newPath: string) => void;
}

/**
 * Hook to watch file system changes in the workspace
 * Automatically refreshes file list when external changes occur
 */
export function useFileWatcher(
  workspacePath: string | null,
  onRefresh: () => void,
  options: UseFileWatcherOptions = {}
) {
  const {
    enabled = true,
    onFileCreated,
    onFileModified,
    onFileDeleted,
    onFileRenamed,
  } = options;

  const unlistenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !workspacePath) {
      return;
    }

    log.info('[FileWatcher] Starting file watcher for:', workspacePath);

    // Listen for file system events from Tauri backend
    const setupListener = async () => {
      try {
        const unlisten = await listen<FileSystemEvent>('file-system-event', (event) => {
          const { type, path, oldPath } = event.payload;
          
          log.debug('[FileWatcher] File system event:', { type, path, oldPath });

          // Handle different event types
          switch (type) {
            case 'created':
              log.info('[FileWatcher] File created:', path);
              onFileCreated?.(path);
              onRefresh();
              break;

            case 'modified':
              log.debug('[FileWatcher] File modified:', path);
              onFileModified?.(path);
              // Don't auto-refresh on modify to avoid interrupting user
              break;

            case 'deleted':
              log.info('[FileWatcher] File deleted:', path);
              onFileDeleted?.(path);
              onRefresh();
              break;

            case 'renamed':
              if (oldPath) {
                log.info('[FileWatcher] File renamed:', oldPath, '->', path);
                onFileRenamed?.(oldPath, path);
                onRefresh();
              }
              break;

            default:
              log.warn('[FileWatcher] Unknown event type:', type);
          }
        });

        unlistenRef.current = unlisten;
        log.info('[FileWatcher] File watcher initialized successfully');
      } catch (error) {
        log.error('[FileWatcher] Failed to setup file watcher:', error);
      }
    };

    setupListener();

    // Cleanup on unmount
    return () => {
      if (unlistenRef.current) {
        log.info('[FileWatcher] Stopping file watcher');
        unlistenRef.current();
        unlistenRef.current = null;
      }
    };
  }, [enabled, workspacePath, onRefresh, onFileCreated, onFileModified, onFileDeleted, onFileRenamed]);

  return {
    isWatching: enabled && !!workspacePath && !!unlistenRef.current,
  };
}
