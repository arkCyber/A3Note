/**
 * FileManager API - Obsidian Compatible
 * Aerospace-grade file management system
 */

import { Events } from './Events';
import { log } from '../../utils/logger';

export interface TFile {
  path: string;
  name: string;
  basename: string;
  extension: string;
  stat: {
    ctime: number;
    mtime: number;
    size: number;
  };
  parent?: TFolder;
}

export interface TFolder {
  path: string;
  name: string;
  children: (TFile | TFolder)[];
  parent?: TFolder;
}

export interface FileStats {
  ctime: number;
  mtime: number;
  size: number;
}

/**
 * FileManager class for file operations
 */
export class FileManager extends Events {
  private files: Map<string, TFile> = new Map();
  private folders: Map<string, TFolder> = new Map();

  /**
   * Create a new file
   */
  async createFile(path: string, content: string = ''): Promise<TFile> {
    try {
      // Validate path
      if (!path || path.trim() === '') {
        throw new Error('Invalid file path');
      }

      // Check if file already exists
      if (this.files.has(path)) {
        throw new Error(`File already exists: ${path}`);
      }

      // Create parent folders if needed
      const parentPath = this.getParentPath(path);
      if (parentPath && !this.folders.has(parentPath)) {
        await this.createFolder(parentPath);
      }

      // Create file
      const file: TFile = {
        path,
        name: this.getFileName(path),
        basename: this.getBaseName(path),
        extension: this.getExtension(path),
        stat: {
          ctime: Date.now(),
          mtime: Date.now(),
          size: content.length,
        },
        parent: parentPath ? this.folders.get(parentPath) : undefined,
      };

      this.files.set(path, file);

      // Add to parent folder
      if (file.parent) {
        file.parent.children.push(file);
      }

      // Trigger event
      this.trigger('create', file);

      log.info('FileManager', `Created file: ${path}`);
      return file;
    } catch (error) {
      log.error('FileManager', `Failed to create file: ${path}`, error as Error);
      throw error;
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(path: string): Promise<TFolder> {
    try {
      // Check if folder already exists
      if (this.folders.has(path)) {
        return this.folders.get(path)!;
      }

      // Create parent folders recursively
      const parentPath = this.getParentPath(path);
      let parent: TFolder | undefined;
      
      if (parentPath) {
        parent = await this.createFolder(parentPath);
      }

      // Create folder
      const folder: TFolder = {
        path,
        name: this.getFileName(path),
        children: [],
        parent,
      };

      this.folders.set(path, folder);

      // Add to parent folder
      if (parent) {
        parent.children.push(folder);
      }

      // Trigger event
      this.trigger('create-folder', folder);

      log.info('FileManager', `Created folder: ${path}`);
      return folder;
    } catch (error) {
      log.error('FileManager', `Failed to create folder: ${path}`, error as Error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(file: TFile): Promise<void> {
    try {
      // Remove from parent
      if (file.parent) {
        const index = file.parent.children.indexOf(file);
        if (index !== -1) {
          file.parent.children.splice(index, 1);
        }
      }

      // Remove from map
      this.files.delete(file.path);

      // Trigger event
      this.trigger('delete', file);

      log.info('FileManager', `Deleted file: ${file.path}`);
    } catch (error) {
      log.error('FileManager', `Failed to delete file: ${file.path}`, error as Error);
      throw error;
    }
  }

  /**
   * Rename a file
   */
  async renameFile(file: TFile, newPath: string): Promise<void> {
    try {
      // Check if new path already exists
      if (this.files.has(newPath)) {
        throw new Error(`File already exists: ${newPath}`);
      }

      const oldPath = file.path;

      // Update file
      this.files.delete(oldPath);
      file.path = newPath;
      file.name = this.getFileName(newPath);
      file.basename = this.getBaseName(newPath);
      file.extension = this.getExtension(newPath);
      file.stat.mtime = Date.now();
      this.files.set(newPath, file);

      // Trigger event
      this.trigger('rename', file, oldPath);

      log.info('FileManager', `Renamed file: ${oldPath} -> ${newPath}`);
    } catch (error) {
      log.error('FileManager', `Failed to rename file: ${file.path}`, error as Error);
      throw error;
    }
  }

  /**
   * Move a file to a new location
   */
  async moveFile(file: TFile, newPath: string): Promise<void> {
    try {
      // Create parent folder if needed
      const parentPath = this.getParentPath(newPath);
      if (parentPath && !this.folders.has(parentPath)) {
        await this.createFolder(parentPath);
      }

      // Remove from old parent
      if (file.parent) {
        const index = file.parent.children.indexOf(file);
        if (index !== -1) {
          file.parent.children.splice(index, 1);
        }
      }

      // Update file
      const oldPath = file.path;
      this.files.delete(oldPath);
      file.path = newPath;
      file.name = this.getFileName(newPath);
      file.basename = this.getBaseName(newPath);
      file.parent = parentPath ? this.folders.get(parentPath) : undefined;
      file.stat.mtime = Date.now();
      this.files.set(newPath, file);

      // Add to new parent
      if (file.parent) {
        file.parent.children.push(file);
      }

      // Trigger event
      this.trigger('move', file, oldPath);

      log.info('FileManager', `Moved file: ${oldPath} -> ${newPath}`);
    } catch (error) {
      log.error('FileManager', `Failed to move file: ${file.path}`, error as Error);
      throw error;
    }
  }

  /**
   * Copy a file
   */
  async copyFile(file: TFile, newPath: string): Promise<TFile> {
    try {
      // Check if new path already exists
      if (this.files.has(newPath)) {
        throw new Error(`File already exists: ${newPath}`);
      }

      // Create new file
      const newFile: TFile = {
        path: newPath,
        name: this.getFileName(newPath),
        basename: this.getBaseName(newPath),
        extension: this.getExtension(newPath),
        stat: {
          ctime: Date.now(),
          mtime: Date.now(),
          size: file.stat.size,
        },
        parent: file.parent,
      };

      this.files.set(newPath, newFile);

      // Add to parent folder
      if (newFile.parent) {
        newFile.parent.children.push(newFile);
      }

      // Trigger event
      this.trigger('copy', newFile, file);

      log.info('FileManager', `Copied file: ${file.path} -> ${newPath}`);
      return newFile;
    } catch (error) {
      log.error('FileManager', `Failed to copy file: ${file.path}`, error as Error);
      throw error;
    }
  }

  /**
   * Get a file by path
   */
  getFile(path: string): TFile | null {
    return this.files.get(path) || null;
  }

  /**
   * Get a folder by path
   */
  getFolder(path: string): TFolder | null {
    return this.folders.get(path) || null;
  }

  /**
   * Get all files
   */
  getAllFiles(): TFile[] {
    return Array.from(this.files.values());
  }

  /**
   * Get all folders
   */
  getAllFolders(): TFolder[] {
    return Array.from(this.folders.values());
  }

  /**
   * Get files in a folder
   */
  getFilesInFolder(folder: TFolder): TFile[] {
    return folder.children.filter(child => 'extension' in child) as TFile[];
  }

  /**
   * Get markdown files
   */
  getMarkdownFiles(): TFile[] {
    return this.getAllFiles().filter(file => file.extension === 'md');
  }

  /**
   * Generate unique path
   */
  generateUniquePath(basePath: string): string {
    let path = basePath;
    let counter = 1;

    while (this.files.has(path)) {
      const ext = this.getExtension(basePath);
      const base = basePath.substring(0, basePath.length - ext.length - 1);
      path = `${base} ${counter}.${ext}`;
      counter++;
    }

    return path;
  }

  /**
   * Get file name from path
   */
  private getFileName(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1] || '';
  }

  /**
   * Get base name (without extension)
   */
  private getBaseName(path: string): string {
    const name = this.getFileName(path);
    const lastDot = name.lastIndexOf('.');
    return lastDot > 0 ? name.substring(0, lastDot) : name;
  }

  /**
   * Get file extension
   */
  private getExtension(path: string): string {
    const name = this.getFileName(path);
    const lastDot = name.lastIndexOf('.');
    return lastDot > 0 ? name.substring(lastDot + 1) : '';
  }

  /**
   * Get parent path
   */
  private getParentPath(path: string): string | null {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : null;
  }

  /**
   * Process file (update metadata)
   */
  async processFile(file: TFile, content: string): Promise<void> {
    try {
      file.stat.mtime = Date.now();
      file.stat.size = content.length;

      // Trigger event
      this.trigger('modify', file);

      log.debug('FileManager', `Processed file: ${file.path}`);
    } catch (error) {
      log.error('FileManager', `Failed to process file: ${file.path}`, error as Error);
      throw error;
    }
  }

  /**
   * Clear all files and folders
   */
  clear(): void {
    this.files.clear();
    this.folders.clear();
    log.info('FileManager', 'Cleared all files and folders');
  }
}

/**
 * Singleton instance
 */
let instance: FileManager | null = null;

export function getFileManager(): FileManager {
  if (!instance) {
    instance = new FileManager();
  }
  return instance;
}

export function resetFileManager(): void {
  instance = null;
}
