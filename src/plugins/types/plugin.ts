/**
 * Plugin types and interfaces
 * Compatible with Obsidian Plugin API
 */

import { PluginManifest } from './manifest';
import { App } from '../api/App';

export interface Command {
  /** Unique command ID */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Command callback */
  callback?: () => void;
  
  /** Check callback - returns true if command should be available */
  checkCallback?: (checking: boolean) => boolean;
  
  /** Editor callback */
  editorCallback?: (editor: any, view: any) => void;
  
  /** Hotkey */
  hotkeys?: Hotkey[];
}

export interface Hotkey {
  modifiers: string[];
  key: string;
}

export interface MenuItem {
  title: string;
  icon?: string;
  callback: () => void;
  section?: string;
}

export interface RibbonAction {
  icon: string;
  title: string;
  callback: () => void;
}

export interface ViewCreator {
  (leaf: any): any;
}

export interface PluginSettingTab {
  app: App;
  plugin: Plugin;
  containerEl: HTMLElement;
  
  display(): void;
  hide(): void;
}

/**
 * Base Plugin class
 * All plugins should extend this class
 */
export abstract class Plugin {
  /** App instance */
  app: App;
  
  /** Plugin manifest */
  manifest: PluginManifest;
  
  /** Registered commands */
  private commands: Map<string, Command> = new Map();
  
  /** Registered views */
  private views: Map<string, ViewCreator> = new Map();
  
  /** Ribbon actions */
  private ribbonActions: RibbonAction[] = [];
  
  /** Status bar items */
  private statusBarItems: HTMLElement[] = [];
  
  constructor(app: App, manifest: PluginManifest) {
    this.app = app;
    this.manifest = manifest;
  }
  
  /**
   * Called when plugin is loaded
   */
  abstract onload(): Promise<void>;
  
  /**
   * Called when plugin is unloaded
   */
  abstract onunload(): Promise<void>;
  
  /**
   * Add a command to the command palette
   */
  addCommand(command: Command): void {
    this.commands.set(command.id, command);
    this.app.commands.registerCommand(command);
  }
  
  /**
   * Register a custom view
   */
  registerView(viewType: string, viewCreator: ViewCreator): void {
    this.views.set(viewType, viewCreator);
    this.app.workspace.registerViewType(viewType, viewCreator);
  }
  
  /**
   * Add an icon to the ribbon (left sidebar)
   */
  addRibbonIcon(icon: string, title: string, callback: () => void): HTMLElement {
    const action: RibbonAction = { icon, title, callback };
    this.ribbonActions.push(action);
    return this.app.workspace.addRibbonIcon(action);
  }
  
  /**
   * Add an item to the status bar
   */
  addStatusBarItem(): HTMLElement {
    const item = this.app.workspace.addStatusBarItem();
    this.statusBarItems.push(item);
    return item;
  }
  
  /**
   * Register an event handler
   */
  registerEvent(_event: any): void {
    // Event handling implementation
  }
  
  /**
   * Register a DOM event
   */
  registerDomEvent(el: HTMLElement, type: string, callback: EventListener): void {
    el.addEventListener(type, callback);
  }
  
  /**
   * Register an interval
   */
  registerInterval(interval: number): number {
    return window.setInterval(() => {}, interval);
  }
  
  /**
   * Load plugin data
   */
  async loadData(): Promise<any> {
    const data = localStorage.getItem(`plugin-data-${this.manifest.id}`);
    return data ? JSON.parse(data) : null;
  }
  
  /**
   * Save plugin data
   */
  async saveData(data: any): Promise<void> {
    localStorage.setItem(`plugin-data-${this.manifest.id}`, JSON.stringify(data));
  }
  
  /**
   * Cleanup on unload
   */
  protected cleanup(): void {
    // Unregister commands
    this.commands.forEach((command) => {
      this.app.commands.unregisterCommand(command.id);
    });
    this.commands.clear();
    
    // Unregister views
    this.views.forEach((_, viewType) => {
      this.app.workspace.unregisterViewType(viewType);
    });
    this.views.clear();
    
    // Remove ribbon actions
    this.ribbonActions.forEach((action) => {
      this.app.workspace.removeRibbonIcon(action);
    });
    this.ribbonActions = [];
    
    // Remove status bar items
    this.statusBarItems.forEach((item) => {
      item.remove();
    });
    this.statusBarItems = [];
  }
}
