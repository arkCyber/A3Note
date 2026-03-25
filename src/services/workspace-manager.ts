/**
 * Workspace Manager Service
 * Manages workspace layouts, saves/loads workspace states
 */

import { log } from '../utils/logger';

export interface WorkspaceLayout {
  name: string;
  openFiles: string[];
  activeFile: string | null;
  sidebarOpen: boolean;
  sidebarWidth: number;
  previewOpen: boolean;
  splitLayout: SplitLayout | null;
  pinnedFiles: string[];
  timestamp: number;
}

export interface SplitLayout {
  type: 'horizontal' | 'vertical';
  sizes: number[];
  children: (SplitLayout | string)[];
}

export interface WorkspaceState {
  currentLayout: string | null;
  layouts: Map<string, WorkspaceLayout>;
}

/**
 * Workspace Manager class
 */
export class WorkspaceManager {
  private static instance: WorkspaceManager;
  private state: WorkspaceState;
  private storageKey = 'a3note:workspaces';

  private constructor() {
    this.state = {
      currentLayout: null,
      layouts: new Map(),
    };
    this.loadFromStorage();
  }

  static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager();
    }
    return WorkspaceManager.instance;
  }

  /**
   * Save current workspace layout
   */
  async saveWorkspace(name: string, layout: Omit<WorkspaceLayout, 'name' | 'timestamp'>): Promise<void> {
    try {
      const workspace: WorkspaceLayout = {
        name,
        ...layout,
        timestamp: Date.now(),
      };

      this.state.layouts.set(name, workspace);
      this.state.currentLayout = name;
      
      await this.saveToStorage();
      
      log.info('WorkspaceManager', `Saved workspace: ${name}`);
    } catch (error) {
      log.error('WorkspaceManager', 'Failed to save workspace', error as Error);
      throw error;
    }
  }

  /**
   * Load a workspace layout
   */
  async loadWorkspace(name: string): Promise<WorkspaceLayout | null> {
    try {
      const workspace = this.state.layouts.get(name);
      
      if (!workspace) {
        log.warn('WorkspaceManager', `Workspace not found: ${name}`);
        return null;
      }

      this.state.currentLayout = name;
      await this.saveToStorage();
      
      log.info('WorkspaceManager', `Loaded workspace: ${name}`);
      return workspace;
    } catch (error) {
      log.error('WorkspaceManager', 'Failed to load workspace', error as Error);
      throw error;
    }
  }

  /**
   * Delete a workspace
   */
  async deleteWorkspace(name: string): Promise<void> {
    try {
      this.state.layouts.delete(name);
      
      if (this.state.currentLayout === name) {
        this.state.currentLayout = null;
      }

      await this.saveToStorage();
      log.info('WorkspaceManager', `Deleted workspace: ${name}`);
    } catch (error) {
      log.error('WorkspaceManager', 'Failed to delete workspace', error as Error);
      throw error;
    }
  }

  /**
   * List all workspaces
   */
  listWorkspaces(): WorkspaceLayout[] {
    return Array.from(this.state.layouts.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  /**
   * Get current workspace
   */
  getCurrentWorkspace(): WorkspaceLayout | null {
    if (!this.state.currentLayout) {
      return null;
    }
    return this.state.layouts.get(this.state.currentLayout) || null;
  }

  /**
   * Rename a workspace
   */
  async renameWorkspace(oldName: string, newName: string): Promise<void> {
    try {
      const workspace = this.state.layouts.get(oldName);
      
      if (!workspace) {
        throw new Error(`Workspace "${oldName}" not found`);
      }

      if (this.state.layouts.has(newName)) {
        throw new Error(`Workspace "${newName}" already exists`);
      }

      workspace.name = newName;
      this.state.layouts.delete(oldName);
      this.state.layouts.set(newName, workspace);

      if (this.state.currentLayout === oldName) {
        this.state.currentLayout = newName;
      }

      await this.saveToStorage();
      log.info('WorkspaceManager', `Renamed workspace: ${oldName} -> ${newName}`);
    } catch (error) {
      log.error('WorkspaceManager', 'Failed to rename workspace', error as Error);
      throw error;
    }
  }

  /**
   * Duplicate a workspace
   */
  async duplicateWorkspace(name: string, newName: string): Promise<void> {
    try {
      const workspace = this.state.layouts.get(name);
      
      if (!workspace) {
        throw new Error(`Workspace "${name}" not found`);
      }

      if (this.state.layouts.has(newName)) {
        throw new Error(`Workspace "${newName}" already exists`);
      }

      const duplicate: WorkspaceLayout = {
        ...workspace,
        name: newName,
        timestamp: Date.now(),
      };

      this.state.layouts.set(newName, duplicate);
      await this.saveToStorage();
      
      log.info('WorkspaceManager', `Duplicated workspace: ${name} -> ${newName}`);
    } catch (error) {
      log.error('WorkspaceManager', 'Failed to duplicate workspace', error as Error);
      throw error;
    }
  }

  /**
   * Auto-save current workspace
   */
  async autoSave(layout: Omit<WorkspaceLayout, 'name' | 'timestamp'>): Promise<void> {
    const autoSaveName = '__autosave__';
    await this.saveWorkspace(autoSaveName, layout);
  }

  /**
   * Load auto-saved workspace
   */
  async loadAutoSave(): Promise<WorkspaceLayout | null> {
    return this.loadWorkspace('__autosave__');
  }

  /**
   * Save to localStorage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const data = {
        currentLayout: this.state.currentLayout,
        layouts: Array.from(this.state.layouts.entries()),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      log.error('WorkspaceManager', 'Failed to save to storage', error as Error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      
      if (!data) {
        return;
      }

      const parsed = JSON.parse(data);
      this.state.currentLayout = parsed.currentLayout;
      this.state.layouts = new Map(parsed.layouts);

      log.info('WorkspaceManager', 'Loaded workspaces from storage');
    } catch (error) {
      log.error('WorkspaceManager', 'Failed to load from storage', error as Error);
    }
  }

  /**
   * Export workspace to JSON
   */
  exportWorkspace(name: string): string | null {
    const workspace = this.state.layouts.get(name);
    if (!workspace) {
      return null;
    }
    return JSON.stringify(workspace, null, 2);
  }

  /**
   * Import workspace from JSON
   */
  async importWorkspace(json: string): Promise<void> {
    try {
      const workspace: WorkspaceLayout = JSON.parse(json);
      
      if (!workspace.name) {
        throw new Error('Invalid workspace: missing name');
      }

      this.state.layouts.set(workspace.name, workspace);
      await this.saveToStorage();
      
      log.info('WorkspaceManager', `Imported workspace: ${workspace.name}`);
    } catch (error) {
      log.error('WorkspaceManager', 'Failed to import workspace', error as Error);
      throw error;
    }
  }

  /**
   * Clear all workspaces
   */
  async clearAll(): Promise<void> {
    this.state.layouts.clear();
    this.state.currentLayout = null;
    await this.saveToStorage();
    log.info('WorkspaceManager', 'Cleared all workspaces');
  }
}

// Export singleton instance
export const workspaceManager = WorkspaceManager.getInstance();
