/**
 * App API
 * Main application instance compatible with Obsidian
 */

import { Vault } from './Vault';
import { Workspace } from './Workspace';
import { MetadataCache } from './MetadataCache';
import { Command } from '../types/plugin';
import { PluginManager } from '../loader/PluginManager';

export class Commands {
  private commands: Map<string, Command> = new Map();
  
  /**
   * Register a command
   */
  registerCommand(command: Command): void {
    this.commands.set(command.id, command);
  }
  
  /**
   * Unregister a command
   */
  unregisterCommand(id: string): void {
    this.commands.delete(id);
  }
  
  /**
   * Execute a command
   */
  executeCommand(id: string): boolean {
    const command = this.commands.get(id);
    if (command && command.callback) {
      command.callback();
      return true;
    }
    return false;
  }
  
  /**
   * Get all commands
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }
  
  /**
   * Find command by ID
   */
  findCommand(id: string): Command | undefined {
    return this.commands.get(id);
  }
}

export class App {
  /** Vault instance for file operations */
  vault: Vault;
  
  /** Workspace instance for UI management */
  workspace: Workspace;
  
  /** Metadata cache for file metadata */
  metadataCache: MetadataCache;
  
  /** Commands registry */
  commands: Commands;
  
  /** Plugin manager */
  plugins: PluginManager;
  
  /** Last update time */
  lastUpdate: number;
  
  /** App version */
  appVersion: string = '1.0.0';
  
  constructor() {
    this.vault = new Vault();
    this.workspace = new Workspace();
    this.metadataCache = new MetadataCache();
    this.commands = new Commands();
    this.plugins = new PluginManager(this);
    this.lastUpdate = Date.now();
  }
  
  /**
   * Initialize the app with workspace path
   */
  initialize(workspacePath: string): void {
    this.vault.setWorkspacePath(workspacePath);
  }
  
  /**
   * Get app version
   */
  getVersion(): string {
    return this.appVersion;
  }
  
  /**
   * Check if app is mobile
   */
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  
  /**
   * Load local storage data
   */
  loadLocalStorage(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  
  /**
   * Save to local storage
   */
  saveLocalStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  /**
   * Register global event
   */
  on(event: string, callback: (...args: any[]) => void): void {
    window.addEventListener(`app:${event}`, callback as EventListener);
  }
  
  /**
   * Trigger global event
   */
  trigger(event: string, ...args: any[]): void {
    const customEvent = new CustomEvent(`app:${event}`, { detail: args });
    window.dispatchEvent(customEvent);
  }
}

// Create singleton instance
export const app = new App();
