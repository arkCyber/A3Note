/**
 * Plugin Manager
 * Manages plugin lifecycle: loading, enabling, disabling, unloading
 */

import { App } from '../api/App';
import { Plugin } from '../types/plugin';
import { PluginManifest, PluginConfig } from '../types/manifest';

export interface PluginInstance {
  plugin: Plugin;
  manifest: PluginManifest;
  enabled: boolean;
}

export class PluginManager {
  private app: App;
  private plugins: Map<string, PluginInstance> = new Map();
  private pluginConfigs: Map<string, PluginConfig> = new Map();
  
  constructor(app: App) {
    this.app = app;
    this.loadPluginConfigs();
  }
  
  /**
   * Load plugin configurations from storage
   */
  private loadPluginConfigs(): void {
    const configData = localStorage.getItem('a3note-plugin-configs');
    if (configData) {
      try {
        const configs = JSON.parse(configData);
        Object.entries(configs).forEach(([id, config]) => {
          this.pluginConfigs.set(id, config as PluginConfig);
        });
      } catch (error) {
        console.error('Failed to load plugin configs:', error);
      }
    }
  }
  
  /**
   * Save plugin configurations to storage
   */
  private savePluginConfigs(): void {
    const configs: Record<string, PluginConfig> = {};
    this.pluginConfigs.forEach((config, id) => {
      configs[id] = config;
    });
    localStorage.setItem('a3note-plugin-configs', JSON.stringify(configs));
  }
  
  /**
   * Register a plugin
   */
  async registerPlugin(
    PluginClass: new (app: App, manifest: PluginManifest) => Plugin,
    manifest: PluginManifest
  ): Promise<void> {
    try {
      // Check if plugin already exists
      if (this.plugins.has(manifest.id)) {
        throw new Error(`Plugin ${manifest.id} is already registered`);
      }
      
      // Create plugin instance
      const plugin = new PluginClass(this.app, manifest);
      
      // Get or create config
      let config = this.pluginConfigs.get(manifest.id);
      if (!config) {
        config = {
          id: manifest.id,
          enabled: false,
          version: manifest.version,
          settings: {},
          installedAt: Date.now(),
        };
        this.pluginConfigs.set(manifest.id, config);
      }
      
      // Store plugin instance
      this.plugins.set(manifest.id, {
        plugin,
        manifest,
        enabled: false,
      });
      
      console.log(`Plugin registered: ${manifest.name} (${manifest.id})`);
    } catch (error) {
      console.error(`Failed to register plugin ${manifest.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Load and enable a plugin
   */
  async enablePlugin(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    if (instance.enabled) {
      console.warn(`Plugin ${pluginId} is already enabled`);
      return;
    }
    
    try {
      // Call plugin's onload method
      await instance.plugin.onload();
      
      // Mark as enabled
      instance.enabled = true;
      
      // Update config
      const config = this.pluginConfigs.get(pluginId);
      if (config) {
        config.enabled = true;
        this.savePluginConfigs();
      }
      
      console.log(`Plugin enabled: ${instance.manifest.name}`);
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error);
      throw error;
    }
  }
  
  /**
   * Disable a plugin
   */
  async disablePlugin(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    if (!instance.enabled) {
      console.warn(`Plugin ${pluginId} is already disabled`);
      return;
    }
    
    try {
      // Call plugin's onunload method
      await instance.plugin.onunload();
      
      // Call cleanup
      (instance.plugin as any).cleanup?.();
      
      // Mark as disabled
      instance.enabled = false;
      
      // Update config
      const config = this.pluginConfigs.get(pluginId);
      if (config) {
        config.enabled = false;
        this.savePluginConfigs();
      }
      
      console.log(`Plugin disabled: ${instance.manifest.name}`);
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error);
      throw error;
    }
  }
  
  /**
   * Unload and remove a plugin
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    // Disable if enabled
    if (instance.enabled) {
      await this.disablePlugin(pluginId);
    }
    
    // Remove from registry
    this.plugins.delete(pluginId);
    
    // Remove config
    this.pluginConfigs.delete(pluginId);
    this.savePluginConfigs();
    
    console.log(`Plugin unloaded: ${instance.manifest.name}`);
  }
  
  /**
   * Get a plugin instance
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)?.plugin;
  }
  
  /**
   * Get all plugins
   */
  getAllPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): PluginInstance[] {
    return this.getAllPlugins().filter(p => p.enabled);
  }
  
  /**
   * Get disabled plugins
   */
  getDisabledPlugins(): PluginInstance[] {
    return this.getAllPlugins().filter(p => !p.enabled);
  }
  
  /**
   * Check if plugin is enabled
   */
  isPluginEnabled(pluginId: string): boolean {
    return this.plugins.get(pluginId)?.enabled || false;
  }
  
  /**
   * Get plugin config
   */
  getPluginConfig(pluginId: string): PluginConfig | undefined {
    return this.pluginConfigs.get(pluginId);
  }
  
  /**
   * Update plugin settings
   */
  updatePluginSettings(pluginId: string, settings: Record<string, any>): void {
    const config = this.pluginConfigs.get(pluginId);
    if (config) {
      config.settings = { ...config.settings, ...settings };
      config.updatedAt = Date.now();
      this.savePluginConfigs();
    }
  }
  
  /**
   * Load all enabled plugins on startup
   */
  async loadEnabledPlugins(): Promise<void> {
    const enabledConfigs = Array.from(this.pluginConfigs.values())
      .filter(config => config.enabled);
    
    for (const config of enabledConfigs) {
      try {
        await this.enablePlugin(config.id);
      } catch (error) {
        console.error(`Failed to auto-enable plugin ${config.id}:`, error);
      }
    }
  }
  
  /**
   * Unload all plugins
   */
  async unloadAllPlugins(): Promise<void> {
    const pluginIds = Array.from(this.plugins.keys());
    
    for (const id of pluginIds) {
      try {
        await this.unloadPlugin(id);
      } catch (error) {
        console.error(`Failed to unload plugin ${id}:`, error);
      }
    }
  }
}
