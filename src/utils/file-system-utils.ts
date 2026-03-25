/**
 * File System Utilities - Aerospace-grade file system operations
 * Cross-platform file system utilities
 */

/**
 * Open file in system's default file manager
 */
export async function showInFileManager(filePath: string): Promise<boolean> {
  try {
    // Check if running in Tauri environment
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = (window as any).__TAURI__.tauri;
      await invoke('show_in_folder', { path: filePath });
      return true;
    }

    // Fallback for web/electron environment
    if (typeof window !== 'undefined' && (window as any).electron) {
      await (window as any).electron.showItemInFolder(filePath);
      return true;
    }

    // Web fallback - copy path to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(filePath);
      console.log('File path copied to clipboard:', filePath);
      return true;
    }

    console.warn('Show in file manager not supported in this environment');
    return false;
  } catch (error) {
    console.error('Failed to show in file manager:', error);
    return false;
  }
}

/**
 * Open file in new window
 */
export async function openInNewWindow(filePath: string): Promise<boolean> {
  try {
    // Check if running in Tauri environment
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = (window as any).__TAURI__.tauri;
      await invoke('open_in_new_window', { path: filePath });
      return true;
    }

    // Fallback for web environment - open in new tab
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('file', filePath);
      window.open(url.toString(), '_blank');
      return true;
    }

    console.warn('Open in new window not supported in this environment');
    return false;
  } catch (error) {
    console.error('Failed to open in new window:', error);
    return false;
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is markdown
 */
export function isMarkdownFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ext === 'md' || ext === 'markdown';
}

/**
 * Check if file is image
 */
export function isImageFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
}

/**
 * Check if file is video
 */
export function isVideoFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext);
}

/**
 * Check if file is audio
 */
export function isAudioFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext);
}

/**
 * Get file name from path
 */
export function getFileName(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}

/**
 * Get file name without extension
 */
export function getFileNameWithoutExtension(filePath: string): string {
  const fileName = getFileName(filePath);
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
}

/**
 * Get directory path
 */
export function getDirectoryPath(filePath: string): string {
  const parts = filePath.split('/');
  parts.pop();
  return parts.join('/');
}

/**
 * Join paths
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map((part, index) => {
      if (index === 0) {
        return part.trim().replace(/\/+$/, '');
      }
      return part.trim().replace(/(^\/+|\/+$)/g, '');
    })
    .filter(part => part.length > 0)
    .join('/');
}

/**
 * Normalize path (remove ./ and ../)
 */
export function normalizePath(path: string): string {
  const parts = path.split('/').filter(part => part && part !== '.');
  const normalized: string[] = [];

  for (const part of parts) {
    if (part === '..') {
      normalized.pop();
    } else {
      normalized.push(part);
    }
  }

  return normalized.join('/');
}

/**
 * Check if path is absolute
 */
export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/') || /^[a-zA-Z]:/.test(path);
}

/**
 * Make path relative to base
 */
export function makeRelativePath(path: string, base: string): string {
  const pathParts = normalizePath(path).split('/');
  const baseParts = normalizePath(base).split('/');

  let i = 0;
  while (i < pathParts.length && i < baseParts.length && pathParts[i] === baseParts[i]) {
    i++;
  }

  const upCount = baseParts.length - i;
  const remainingPath = pathParts.slice(i);

  const relativeParts = Array(upCount).fill('..').concat(remainingPath);
  return relativeParts.join('/') || '.';
}

/**
 * Sanitize file name (remove invalid characters)
 */
export function sanitizeFileName(fileName: string): string {
  // Remove or replace invalid characters
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/^\.+/, '')
    .trim();
}

/**
 * Generate unique file name
 */
export function generateUniqueFileName(baseName: string, existingNames: string[]): string {
  const nameSet = new Set(existingNames);
  
  if (!nameSet.has(baseName)) {
    return baseName;
  }

  const ext = getFileExtension(baseName);
  const nameWithoutExt = ext ? baseName.slice(0, -(ext.length + 1)) : baseName;

  let counter = 1;
  let uniqueName: string;

  do {
    uniqueName = ext 
      ? `${nameWithoutExt} ${counter}.${ext}`
      : `${nameWithoutExt} ${counter}`;
    counter++;
  } while (nameSet.has(uniqueName));

  return uniqueName;
}
