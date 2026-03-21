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
      
      return this.getFileFromPath(path);
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
  getAbstractFileByPath(path: string): TFile | TFolder | null {
    // This would need to query the file system
    // For now, return a basic implementation
    return this.getFileFromPath(path);
  }
  
  /**
   * Get all files in vault
   */
  getFiles(): TFile[] {
    // This would need to traverse the entire vault
    // Implementation depends on workspace state
    return [];
  }
  
  /**
   * Get all markdown files
   */
  getMarkdownFiles(): TFile[] {
    return this.getFiles().filter(f => f.extension === 'md');
  }
  
  /**
   * Get root folder
   */
  getRoot(): TFolder {
    return {
      path: '/',
      name: 'root',
      children: [],
    };
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
