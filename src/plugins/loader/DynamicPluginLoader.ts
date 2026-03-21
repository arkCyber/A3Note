/**
 * Dynamic Plugin Loader
 * Loads plugins dynamically from JavaScript files
 */

import { App } from '../api/App';
import { Plugin } from '../types/plugin';
import { PluginManifest } from '../types/manifest';

export interface PluginBundle {
  default: new (app: App, manifest: PluginManifest) => Plugin;
  manifest: PluginManifest;
}

export class DynamicPluginLoader {
  private app: App;
  private loadedBundles: Map<string, PluginBundle> = new Map();
  
  constructor(app: App) {
    this.app = app;
  }
  
  /**
   * Load a plugin from a JavaScript module
   */
  async loadPluginFromModule(modulePath: string): Promise<PluginBundle> {
    try {
      // Dynamic import
      const module = await import(modulePath);
      
      if (!module.default) {
        throw new Error(`Plugin at ${modulePath} does not have a default export`);
      }
      
      if (!module.manifest) {
        throw new Error(`Plugin at ${modulePath} does not export a manifest`);
      }
      
      const bundle: PluginBundle = {
        default: module.default,
        manifest: module.manifest,
      };
      
      this.loadedBundles.set(module.manifest.id, bundle);
      
      return bundle;
    } catch (error) {
      console.error(`Failed to load plugin from ${modulePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Load and register a plugin
   */
  async loadAndRegisterPlugin(modulePath: string): Promise<void> {
    const bundle = await this.loadPluginFromModule(modulePath);
    await this.app.plugins.registerPlugin(bundle.default, bundle.manifest);
  }
  
  /**
   * Load multiple plugins
   */
  async loadPlugins(modulePaths: string[]): Promise<void> {
    const results = await Promise.allSettled(
      modulePaths.map(path => this.loadAndRegisterPlugin(path))
    );
    
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`Failed to load ${failed.length} plugins`);
    }
  }
  
  /**
   * Get loaded bundle
   */
  getBundle(pluginId: string): PluginBundle | undefined {
    return this.loadedBundles.get(pluginId);
  }
  
  /**
   * Get all loaded bundles
   */
  getAllBundles(): PluginBundle[] {
    return Array.from(this.loadedBundles.values());
  }
}
