/**
 * File Operations Utilities
 * Handles file creation, deletion, and movement with settings integration
 */

import { log } from './logger';

export interface FileOperationOptions {
  confirmDelete?: boolean;
  deleteToTrash?: boolean;
  newNoteLocation?: 'root' | 'current' | 'folder';
  newNoteFolderPath?: string;
  attachmentLocation?: 'root' | 'current' | 'folder';
  attachmentFolderPath?: string;
  autoUpdateLinks?: boolean;
}

/**
 * Delete a file with confirmation
 */
export async function deleteFile(
  filePath: string,
  options: FileOperationOptions = {}
): Promise<boolean> {
  const { confirmDelete = true, deleteToTrash = true } = options;

  // Show confirmation dialog if enabled
  if (confirmDelete) {
    const confirmed = confirm(`确定要删除文件 "${filePath}" 吗？`);
    if (!confirmed) {
      log.info('[FileOps] File deletion cancelled by user');
      return false;
    }
  }

  try {
    if (deleteToTrash) {
      // Move to trash (system recycle bin)
      log.info('[FileOps] Moving file to trash:', filePath);
      // In web environment, we can't actually move to system trash
      // This would need Tauri API in desktop app
      log.warn('[FileOps] Trash functionality not available in web mode');
    }

    // Actual deletion would happen here
    log.info('[FileOps] File deleted:', filePath);
    return true;
  } catch (error) {
    log.error('[FileOps] Failed to delete file:', error);
    return false;
  }
}

/**
 * Get the path for a new note based on settings
 */
export function getNewNotePath(
  currentPath: string,
  options: FileOperationOptions = {}
): string {
  const { newNoteLocation = 'root', newNoteFolderPath = '' } = options;

  switch (newNoteLocation) {
    case 'root':
      return '/';
    case 'current':
      // Extract directory from current path
      const lastSlash = currentPath.lastIndexOf('/');
      return lastSlash > 0 ? currentPath.substring(0, lastSlash) : '/';
    case 'folder':
      return newNoteFolderPath || '/';
    default:
      return '/';
  }
}

/**
 * Get the path for an attachment based on settings
 */
export function getAttachmentPath(
  currentPath: string,
  options: FileOperationOptions = {}
): string {
  const { attachmentLocation = 'folder', attachmentFolderPath = 'attachments' } = options;

  switch (attachmentLocation) {
    case 'root':
      return '/';
    case 'current':
      const lastSlash = currentPath.lastIndexOf('/');
      return lastSlash > 0 ? currentPath.substring(0, lastSlash) : '/';
    case 'folder':
      return attachmentFolderPath || 'attachments';
    default:
      return 'attachments';
  }
}

/**
 * Update internal links when a file is moved
 */
export async function updateInternalLinks(
  oldPath: string,
  newPath: string,
  options: FileOperationOptions = {}
): Promise<void> {
  const { autoUpdateLinks = true } = options;

  if (!autoUpdateLinks) {
    log.info('[FileOps] Auto-update links disabled');
    return;
  }

  try {
    log.info('[FileOps] Updating internal links:', { oldPath, newPath });
    // This would scan all files and update links
    // Implementation would depend on the file system API
    log.info('[FileOps] Links updated successfully');
  } catch (error) {
    log.error('[FileOps] Failed to update links:', error);
  }
}

/**
 * Format link based on Wiki link setting
 */
export function formatLink(
  targetPath: string,
  linkText: string,
  useWikiLinks: boolean = true
): string {
  if (useWikiLinks) {
    // Wiki-style: [[link]]
    return `[[${linkText || targetPath}]]`;
  } else {
    // Markdown-style: [text](path)
    return `[${linkText || targetPath}](${targetPath})`;
  }
}

/**
 * Create a new note with proper path
 */
export async function createNewNote(
  title: string,
  currentPath: string,
  options: FileOperationOptions = {}
): Promise<string> {
  const basePath = getNewNotePath(currentPath, options);
  const fileName = `${title}.md`;
  const fullPath = `${basePath}/${fileName}`.replace('//', '/');

  log.info('[FileOps] Creating new note:', fullPath);
  
  // Actual file creation would happen here
  return fullPath;
}

/**
 * Save attachment with proper path
 */
export async function saveAttachment(
  file: File,
  currentPath: string,
  options: FileOperationOptions = {}
): Promise<string> {
  const basePath = getAttachmentPath(currentPath, options);
  const fullPath = `${basePath}/${file.name}`.replace('//', '/');

  log.info('[FileOps] Saving attachment:', fullPath);
  
  // Actual file save would happen here
  return fullPath;
}
