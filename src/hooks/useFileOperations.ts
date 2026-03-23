import { useState, useCallback } from 'react';
import { FileItem } from '../types';
import { log } from '../utils/logger';

/**
 * Hook for file operations (duplicate, move, star, etc.)
 */

export interface FileOperationsState {
  starredFiles: Set<string>;
  fileProperties: Map<string, FileProperties>;
}

export interface FileProperties {
  created: Date;
  modified: Date;
  size: number;
  tags: string[];
}

export function useFileOperations() {
  const [starredFiles, setStarredFiles] = useState<Set<string>>(new Set());
  const [fileProperties] = useState<Map<string, FileProperties>>(new Map());

  // Star/Unstar file
  const toggleStar = useCallback((filePath: string) => {
    setStarredFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
        log.info('[FileOperations] Unstarred file', filePath);
      } else {
        newSet.add(filePath);
        log.info('[FileOperations] Starred file', filePath);
      }
      return newSet;
    });
  }, []);

  const isStarred = useCallback((filePath: string) => {
    return starredFiles.has(filePath);
  }, [starredFiles]);

  // Duplicate file
  const duplicateFile = useCallback(async (file: FileItem, onFileCreate: (path: string, content: string) => void) => {
    try {
      // Read original file content
      const response = await fetch(`/api/files/${encodeURIComponent(file.path)}`);
      const content = await response.text();
      
      // Generate new file name
      const nameParts = file.name.split('.');
      const ext = nameParts.pop();
      const baseName = nameParts.join('.');
      const newName = `${baseName} copy.${ext}`;
      const newPath = file.path.replace(file.name, newName);
      
      // Create duplicate
      onFileCreate(newPath, content);
      
      log.info('[FileOperations] Duplicated file', { from: file.path, to: newPath });
      return newPath;
    } catch (error) {
      log.error('[FileOperations] Failed to duplicate file', error as Error);
      throw error;
    }
  }, []);

  // Move file
  const moveFile = useCallback(async (
    file: FileItem,
    targetPath: string,
    onFileMove: (oldPath: string, newPath: string) => void
  ) => {
    try {
      const newPath = `${targetPath}/${file.name}`;
      onFileMove(file.path, newPath);
      
      log.info('[FileOperations] Moved file', { from: file.path, to: newPath });
      return newPath;
    } catch (error) {
      log.error('[FileOperations] Failed to move file', error as Error);
      throw error;
    }
  }, []);

  // Copy path to clipboard
  const copyPath = useCallback((filePath: string) => {
    navigator.clipboard.writeText(filePath);
    log.info('[FileOperations] Copied path to clipboard', filePath);
  }, []);

  // Copy Obsidian URL
  const copyObsidianURL = useCallback((file: FileItem) => {
    const url = `obsidian://open?vault=A3Note&file=${encodeURIComponent(file.path)}`;
    navigator.clipboard.writeText(url);
    log.info('[FileOperations] Copied Obsidian URL', url);
  }, []);

  // Show in system explorer
  const showInExplorer = useCallback((filePath: string) => {
    // This would need to be implemented with Electron or Tauri
    log.info('[FileOperations] Show in explorer', filePath);
    alert(`File location: ${filePath}\n\nNote: This feature requires desktop app integration.`);
  }, []);

  // Get file properties
  const getFileProperties = useCallback((filePath: string): FileProperties | null => {
    return fileProperties.get(filePath) || null;
  }, [fileProperties]);

  // Open in new tab
  const openInNewTab = useCallback((file: FileItem, onFileSelect: (file: FileItem) => void) => {
    // In a real implementation, this would open in a new tab
    // For now, we'll just select the file
    onFileSelect(file);
    log.info('[FileOperations] Open in new tab', file.path);
  }, []);

  // Open in new window
  const openInNewWindow = useCallback((file: FileItem) => {
    // This would need window management implementation
    log.info('[FileOperations] Open in new window', file.path);
    alert(`Opening ${file.name} in new window\n\nNote: This feature requires window management implementation.`);
  }, []);

  // Open to the right
  const openToRight = useCallback((file: FileItem, onFileSelect: (file: FileItem) => void) => {
    // This would need split pane implementation
    onFileSelect(file);
    log.info('[FileOperations] Open to right', file.path);
  }, []);

  return {
    starredFiles,
    toggleStar,
    isStarred,
    duplicateFile,
    moveFile,
    copyPath,
    copyObsidianURL,
    showInExplorer,
    getFileProperties,
    openInNewTab,
    openInNewWindow,
    openToRight,
  };
}
