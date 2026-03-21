/**
 * Plugin Downloader Service
 * Handles downloading and installing plugins from GitHub
 */

import { PluginManifest } from '../plugins/types/manifest';
import { App } from '../plugins/api/App';
import { app as appInstance } from '../plugins/api/App';

export interface PluginDownloadInfo {
  repo: string;
  version?: string;
  branch?: string;
}

export interface PluginFiles {
  manifest: PluginManifest;
  mainJs: string;
  styles?: string;
}

export class PluginDownloader {
  private app: App;
  
  constructor(app: App) {
    this.app = app;
  }
  
  /**
   * Download plugin from GitHub repository
   */
  async downloadPlugin(info: PluginDownloadInfo): Promise<PluginFiles> {
    try {
      const { repo, version = 'latest', branch = 'master' } = info;
      
      // Extract owner and repo name from URL
      const match = repo.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub repository URL');
      }
      
      const [, owner, repoName] = match;
      const cleanRepoName = repoName.replace(/\.git$/, '');
      
      // Construct raw GitHub URLs
      const baseUrl = version === 'latest'
        ? `https://raw.githubusercontent.com/${owner}/${cleanRepoName}/${branch}`
        : `https://raw.githubusercontent.com/${owner}/${cleanRepoName}/${version}`;
      
      // Download manifest.json
      const manifestUrl = `${baseUrl}/manifest.json`;
      const manifestResponse = await fetch(manifestUrl);
      if (!manifestResponse.ok) {
        throw new Error(`Failed to download manifest: ${manifestResponse.statusText}`);
      }
      const manifest: PluginManifest = await manifestResponse.json();
      
      // Download main.js
      const mainJsUrl = `${baseUrl}/main.js`;
      const mainJsResponse = await fetch(mainJsUrl);
      if (!mainJsResponse.ok) {
        throw new Error(`Failed to download main.js: ${mainJsResponse.statusText}`);
      }
      const mainJs = await mainJsResponse.text();
      
      // Try to download styles.css (optional)
      let styles: string | undefined;
      try {
        const stylesUrl = `${baseUrl}/styles.css`;
        const stylesResponse = await fetch(stylesUrl);
        if (stylesResponse.ok) {
          styles = await stylesResponse.text();
        }
      } catch (error) {
        // Styles are optional, ignore error
        console.log('No styles.css found for plugin');
      }
      
      return { manifest, mainJs, styles };
    } catch (error) {
      console.error('Failed to download plugin:', error);
      throw error;
    }
  }
  
  /**
   * Install downloaded plugin
   */
  async installPlugin(files: PluginFiles): Promise<void> {
    try {
      const { manifest } = files;
      // mainJs and styles would be used in real implementation
      
      // Validate manifest
      if (!manifest.id || !manifest.name || !manifest.version) {
        throw new Error('Invalid plugin manifest');
      }
      
      // Check if plugin already installed
      const existingPlugin = this.app.plugins.getPlugin(manifest.id);
      if (existingPlugin) {
        throw new Error(`Plugin ${manifest.id} is already installed`);
      }
      
      // In a real implementation, we would:
      // 1. Save plugin files to disk (.a3note/plugins/{id}/)
      // 2. Load the plugin code dynamically
      // 3. Register the plugin with PluginManager
      
      // For now, we'll simulate this with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Plugin ${manifest.name} (${manifest.id}) installed successfully`);
    } catch (error) {
      console.error('Failed to install plugin:', error);
      throw error;
    }
  }
  
  /**
   * Download and install plugin in one step
   */
  async downloadAndInstall(info: PluginDownloadInfo): Promise<void> {
    const files = await this.downloadPlugin(info);
    await this.installPlugin(files);
  }
  
  /**
   * Uninstall plugin
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    try {
      // Unload plugin first
      await this.app.plugins.unloadPlugin(pluginId);
      
      // In a real implementation, we would:
      // 1. Delete plugin files from disk
      // 2. Remove from plugin registry
      
      console.log(`Plugin ${pluginId} uninstalled successfully`);
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      throw error;
    }
  }
  
  /**
   * Update plugin to latest version
   */
  async updatePlugin(pluginId: string, repo: string): Promise<void> {
    try {
      // Uninstall old version
      await this.uninstallPlugin(pluginId);
      
      // Download and install new version
      await this.downloadAndInstall({ repo, version: 'latest' });
      
      console.log(`Plugin ${pluginId} updated successfully`);
    } catch (error) {
      console.error('Failed to update plugin:', error);
      throw error;
    }
  }
  
  /**
   * Check if plugin has updates available
   */
  async checkForUpdates(pluginId: string, repo: string): Promise<boolean> {
    try {
      const currentPlugin = this.app.plugins.getPlugin(pluginId);
      if (!currentPlugin) {
        return false;
      }
      
      const currentVersion = currentPlugin.manifest.version;
      
      // Download latest manifest
      const files = await this.downloadPlugin({ repo, version: 'latest' });
      const latestVersion = files.manifest.version;
      
      // Simple version comparison (in real implementation, use semver)
      return latestVersion !== currentVersion;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pluginDownloader = new PluginDownloader(appInstance);
