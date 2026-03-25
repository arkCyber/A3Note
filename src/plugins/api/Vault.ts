/**
 * Vault API
 * Provides file system access compatible with Obsidian
 */

import { tauriApi } from '../../api/tauri';

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
}

export interface TFolder {
  path: string;
  name: string;
  children: (TFile | TFolder)[];
}

export class Vault {
  private workspacePath: string | null = null;
  
  /**
   * Set workspace path
   */
  setWorkspacePath(path: string): void {
    this.workspacePath = path;
  }
  
  /**
   * Read file content
   */
  async read(file: TFile | string): Promise<string> {
    const path = typeof file === 'string' ? file : file.path;
    const fullPath = this.getFullPath(path);
    
    try {
      const content = await tauriApi.readFile(fullPath);
      return content.content;
    } catch (error) {
      throw new Error(`Failed to read file: ${path}`);
    }
  }
  
  /**
   * Read file as binary
   */
  async readBinary(file: TFile | string): Promise<ArrayBuffer> {
    const content = await this.read(file);
    const encoder = new TextEncoder();
    return encoder.encode(content).buffer;
  }
  
  /**
   * Modify file content
   */
  async modify(file: TFile | string, data: string): Promise<void> {
    const path = typeof file === 'string' ? file : file.path;
    const fullPath = this.getFullPath(path);
    
    try {
      await tauriApi.writeFile(fullPath, data);
      this.trigger('modify', typeof file === 'string' ? this.getFileFromPath(file) : file);
    } catch (error) {
      throw new Error(`Failed to modify file: ${path}`);
    }
  }
  
  /**
   * Create new file
   */
  async create(path: string, data: string): Promise<TFile> {
    const fullPath = this.getFullPath(path);
    
    try {
      await tauriApi.createFile(fullPath, false);
      await tauriApi.writeFile(fullPath, data);
      
      const file = this.getFileFromPath(path);
      this.trigger('create', file);
      return file;
    } catch (error) {
      throw new Error(`Failed to create file: ${path}`);
    }
  }
  
  /**
   * Create folder
   */
  async createFolder(path: string): Promise<TFolder> {
    const fullPath = this.getFullPath(path);
    
    try {
      await tauriApi.createFile(fullPath, true);
      return this.getFolderFromPath(path);
    } catch (error) {
      throw new Error(`Failed to create folder: ${path}`);
    }
  }
  
  /**
   * Delete file or folder
   */
  async delete(file: TFile | TFolder | string): Promise<void> {
    const path = typeof file === 'string' ? file : file.path;
    const fullPath = this.getFullPath(path);
    
    try {
      await tauriApi.deleteFile(fullPath);
      this.trigger('delete', typeof file === 'string' ? this.getFileFromPath(file) : file);
    } catch (error) {
      throw new Error(`Failed to delete: ${path}`);
    }
  }
  
  /**
   * Rename file or folder
   */
  async rename(file: TFile | TFolder | string, newPath: string): Promise<void> {
    // Implementation would use file system rename
    // For now, we'll copy and delete
    const oldPath = typeof file === 'string' ? file : file.path;
    const content = await this.read(oldPath);
    await this.create(newPath, content);
    await this.delete(oldPath);
    this.trigger('rename', this.getFileFromPath(newPath));
  }
  
  /**
   * Copy file
   */
  async copy(source: string, destination: string): Promise<TFile> {
    const content = await this.read(source);
    return await this.create(destination, content);
  }
  
  /**
   * Check if file exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      await this.read(path);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get abstract file by path
   */
  async getAbstractFileByPath(path: string): Promise<TFile | TFolder | null> {
    if (!this.workspacePath) return null;
    
    const fullPath = this.getFullPath(path);
    
    try {
      const stats = await tauriApi.getFileStats(fullPath);
      
      if (stats.isDirectory) {
        return this.getFolderFromPath(path);
      } else {
        return this.getFileFromPath(path);
      }
    } catch {
      return null;
    }
  }
  
  /**
   * Get all files in vault
   */
  async getFiles(): Promise<TFile[]> {
    if (!this.workspacePath) return [];
    
    const files: TFile[] = [];
    await this.traverseDirectory('/', files);
    return files;
  }
  
  /**
   * Get all markdown files
   */
  async getMarkdownFiles(): Promise<TFile[]> {
    const allFiles = await this.getFiles();
    return allFiles.filter(f => f.extension === 'md');
  }
  
  /**
   * Get all loaded files (files and folders)
   */
  async getAllLoadedFiles(): Promise<(TFile | TFolder)[]> {
    if (!this.workspacePath) return [];
    
    const items: (TFile | TFolder)[] = [];
    await this.traverseDirectoryAll('/', items);
    return items;
  }
  
  /**
   * Traverse directory recursively to collect files
   */
  private async traverseDirectory(relativePath: string, files: TFile[]): Promise<void> {
    const fullPath = this.getFullPath(relativePath);
    
    try {
      const entries = await tauriApi.readDir(fullPath);
      
      for (const entry of entries) {
        const entryPath = relativePath === '/' 
          ? `/${entry.name}` 
          : `${relativePath}/${entry.name}`;
        
        if (entry.isDirectory) {
          await this.traverseDirectory(entryPath, files);
        } else {
          files.push(this.getFileFromPath(entryPath));
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  /**
   * Traverse directory recursively to collect all items
   */
  private async traverseDirectoryAll(
    relativePath: string, 
    items: (TFile | TFolder)[]
  ): Promise<void> {
    const fullPath = this.getFullPath(relativePath);
    
    try {
      const entries = await tauriApi.readDir(fullPath);
      
      for (const entry of entries) {
        const entryPath = relativePath === '/' 
          ? `/${entry.name}` 
          : `${relativePath}/${entry.name}`;
        
        if (entry.isDirectory) {
          const folder = this.getFolderFromPath(entryPath);
          items.push(folder);
          await this.traverseDirectoryAll(entryPath, items);
        } else {
          items.push(this.getFileFromPath(entryPath));
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  /**
   * Recurse through folder children
   */
  async recurseChildren(
    folder: TFolder,
    callback: (file: TFile | TFolder) => void
  ): Promise<void> {
    const fullPath = this.getFullPath(folder.path);
    
    try {
      const entries = await tauriApi.readDir(fullPath);
      
      for (const entry of entries) {
        const entryPath = `${folder.path}/${entry.name}`;
        
        if (entry.isDirectory) {
          const childFolder = this.getFolderFromPath(entryPath);
          callback(childFolder);
          await this.recurseChildren(childFolder, callback);
        } else {
          const file = this.getFileFromPath(entryPath);
          callback(file);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  /**
   * Get root folder
   */
  async getRoot(): Promise<TFolder> {
    const root: TFolder = {
      path: '/',
      name: 'root',
      children: [],
    };
    
    if (!this.workspacePath) return root;
    
    try {
      const entries = await tauriApi.readDir(this.workspacePath);
      
      for (const entry of entries) {
        const entryPath = `/${entry.name}`;
        
        if (entry.isDirectory) {
          root.children.push(this.getFolderFromPath(entryPath));
        } else {
          root.children.push(this.getFileFromPath(entryPath));
        }
      }
    } catch (error) {
      // Workspace path doesn't exist or can't be read
    }
    
    return root;
  }
  
  /**
   * Move file to trash
   */
  async trash(file: TFile | TFolder | string, system: boolean = true): Promise<void> {
    const path = typeof file === 'string' ? file : file.path;
    const fullPath = this.getFullPath(path);
    
    if (system) {
      // Move to system trash
      try {
        await tauriApi.moveToTrash(fullPath);
        this.trigger('delete', typeof file === 'string' ? this.getFileFromPath(file) : file);
      } catch (error) {
        throw new Error(`Failed to move to trash: ${path}`);
      }
    } else {
      // Move to .trash folder in vault
      const trashPath = '.trash';
      const fileName = path.split('/').pop() || '';
      const timestamp = Date.now();
      const newPath = `${trashPath}/${timestamp}-${fileName}`;
      
      try {
        // Ensure .trash folder exists
        await this.createFolder(trashPath).catch(() => {});
        
        // Move file
        await this.rename(file, newPath);
      } catch (error) {
        throw new Error(`Failed to move to vault trash: ${path}`);
      }
    }
  }
  
  /**
   * Get available path for attachments
   */
  getAvailablePathForAttachments(
    filename: string,
    extension: string,
    currentFile?: TFile
  ): string {
    const ext = extension.startsWith('.') ? extension : '.' + extension;
    const baseDir = currentFile ? this.getFileDir(currentFile.path) : '/attachments';
    const basePath = `${baseDir}/${filename}${ext}`;
    
    // TODO: Check if file exists and generate unique name
    return basePath;
  }
  
  /**
   * Get resource path for file
   */
  getResourcePath(file: TFile): string {
    if (!this.workspacePath) return '';
    return this.getFullPath(file.path);
  }
  
  /**
   * Get file directory
   */
  private getFileDir(path: string): string {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '/';
  }
  
  /**
   * File system event listeners
   */
  private eventListeners: Map<string, Set<(file: TFile | TFolder) => void>> = new Map();
  
  /**
   * Listen for file system events
   */
  on(
    event: 'create' | 'modify' | 'delete' | 'rename',
    callback: (file: TFile | TFolder) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }
  
  /**
   * Remove event listener
   */
  off(
    event: 'create' | 'modify' | 'delete' | 'rename',
    callback: (file: TFile | TFolder) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }
  
  /**
   * Trigger file system event
   */
  private trigger(event: 'create' | 'modify' | 'delete' | 'rename', file: TFile | TFolder): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(file));
    }
  }
  
  /**
   * Helper: Get full file system path
   */
  private getFullPath(relativePath: string): string {
    if (!this.workspacePath) {
      throw new Error('Workspace path not set');
    }
    
    // Remove leading slash if present
    const cleanPath = relativePath.startsWith('/') 
      ? relativePath.slice(1) 
      : relativePath;
    
    return `${this.workspacePath}/${cleanPath}`;
  }
  
  /**
   * Helper: Create TFile from path
   */
  private getFileFromPath(path: string): TFile {
    const name = path.split('/').pop() || '';
    const parts = name.split('.');
    const extension = parts.length > 1 ? parts.pop()! : '';
    const basename = parts.join('.');
    
    return {
      path,
      name,
      basename,
      extension,
      stat: {
        ctime: Date.now(),
        mtime: Date.now(),
        size: 0,
      },
    };
  }
  
  /**
   * Helper: Create TFolder from path
   */
  private getFolderFromPath(path: string): TFolder {
    const name = path.split('/').pop() || '';
    
    return {
      path,
      name,
      children: [],
    };
  }
  
  /**
   * Adapter for file operations
   */
  get adapter() {
    return {
      read: this.read.bind(this),
      write: this.modify.bind(this),
      exists: this.exists.bind(this),
      remove: this.delete.bind(this),
    };
  }
}
