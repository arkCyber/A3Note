/**
 * Advanced Plugin System Tests
 * Extended tests for Obsidian plugin compatibility system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { App } from '../plugins/api/App';
import { Plugin } from '../plugins/types/plugin';
import { PluginManifest } from '../plugins/types/manifest';
import { TFile } from '../plugins/api/Vault';

// Advanced test plugin with more features
class AdvancedTestPlugin extends Plugin {
  executedCommands: string[] = [];
  ribbonIconClicks: number = 0;
  statusBarItemCount: number = 0;
  
  async onload() {
    // Add multiple commands
    this.addCommand({
      id: 'cmd-1',
      name: 'Command 1',
      callback: () => this.executedCommands.push('cmd-1')
    });
    
    this.addCommand({
      id: 'cmd-2',
      name: 'Command 2',
      callback: () => this.executedCommands.push('cmd-2')
    });
    
    // Add ribbon icon
    this.addRibbonIcon('star', 'Test Icon', () => {
      this.ribbonIconClicks++;
    });
    
    // Add status bar item
    const statusBar = this.addStatusBarItem();
    statusBar.textContent = 'Advanced Plugin';
    this.statusBarItemCount++;
  }
  
  async onunload() {
    this.executedCommands = [];
  }
}

const advancedManifest: PluginManifest = {
  id: 'advanced-test-plugin',
  name: 'Advanced Test Plugin',
  version: '1.0.0',
  minAppVersion: '1.0.0',
  description: 'An advanced test plugin',
  author: 'Test Author',
};

describe('Advanced Plugin System Tests', () => {
  let app: App;
  
  beforeEach(() => {
    app = new App();
    app.initialize('/test/workspace');
    localStorage.clear();
  });
  
  afterEach(async () => {
    await app.plugins.unloadAllPlugins();
    localStorage.clear();
  });
  
  describe('Multi-Plugin Management', () => {
    it('should handle multiple plugins simultaneously', async () => {
      // Register two plugins
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      
      const manifest2: PluginManifest = {
        ...advancedManifest,
        id: 'plugin-2',
        name: 'Plugin 2'
      };
      await app.plugins.registerPlugin(AdvancedTestPlugin, manifest2);
      
      const allPlugins = app.plugins.getAllPlugins();
      expect(allPlugins).toHaveLength(2);
    });
    
    it('should enable multiple plugins', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      
      const manifest2: PluginManifest = {
        ...advancedManifest,
        id: 'plugin-2',
        name: 'Plugin 2'
      };
      await app.plugins.registerPlugin(AdvancedTestPlugin, manifest2);
      
      await app.plugins.enablePlugin('advanced-test-plugin');
      await app.plugins.enablePlugin('plugin-2');
      
      const enabledPlugins = app.plugins.getEnabledPlugins();
      expect(enabledPlugins).toHaveLength(2);
    });
    
    it('should disable specific plugin without affecting others', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      
      const manifest2: PluginManifest = {
        ...advancedManifest,
        id: 'plugin-2',
        name: 'Plugin 2'
      };
      await app.plugins.registerPlugin(AdvancedTestPlugin, manifest2);
      
      await app.plugins.enablePlugin('advanced-test-plugin');
      await app.plugins.enablePlugin('plugin-2');
      await app.plugins.disablePlugin('advanced-test-plugin');
      
      expect(app.plugins.isPluginEnabled('advanced-test-plugin')).toBe(false);
      expect(app.plugins.isPluginEnabled('plugin-2')).toBe(true);
    });
  });
  
  describe('Plugin Commands Integration', () => {
    it('should register multiple commands from plugin', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      await app.plugins.enablePlugin('advanced-test-plugin');
      
      const plugin = app.plugins.getPlugin('advanced-test-plugin') as unknown as AdvancedTestPlugin;
      
      // Execute commands
      app.commands.executeCommand('cmd-1');
      app.commands.executeCommand('cmd-2');
      
      expect(plugin.executedCommands).toContain('cmd-1');
      expect(plugin.executedCommands).toContain('cmd-2');
    });
    
    it('should unregister commands when plugin is disabled', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      await app.plugins.enablePlugin('advanced-test-plugin');
      await app.plugins.disablePlugin('advanced-test-plugin');
      
      const cmd1 = app.commands.findCommand('cmd-1');
      const cmd2 = app.commands.findCommand('cmd-2');
      
      expect(cmd1).toBeUndefined();
      expect(cmd2).toBeUndefined();
    });
  });
  
  describe('Plugin Data Persistence', () => {
    it('should persist plugin data across enable/disable cycles', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      await app.plugins.enablePlugin('advanced-test-plugin');
      
      const plugin = app.plugins.getPlugin('advanced-test-plugin') as AdvancedTestPlugin;
      const testData = { counter: 42, name: 'test' };
      await plugin.saveData(testData);
      
      await app.plugins.disablePlugin('advanced-test-plugin');
      await app.plugins.enablePlugin('advanced-test-plugin');
      
      const plugin2 = app.plugins.getPlugin('advanced-test-plugin') as AdvancedTestPlugin;
      const loadedData = await plugin2.loadData();
      
      expect(loadedData).toEqual(testData);
    });
    
    it('should handle empty plugin data', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      await app.plugins.enablePlugin('advanced-test-plugin');
      
      const plugin = app.plugins.getPlugin('advanced-test-plugin') as AdvancedTestPlugin;
      const data = await plugin.loadData();
      
      expect(data).toBeNull();
    });
    
    it('should update plugin settings', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      await app.plugins.enablePlugin('advanced-test-plugin');
      
      const settings = { theme: 'dark', fontSize: 14 };
      app.plugins.updatePluginSettings('advanced-test-plugin', settings);
      
      const config = app.plugins.getPluginConfig('advanced-test-plugin');
      expect(config?.settings).toEqual(settings);
    });
  });
  
  describe('MetadataCache Advanced Features', () => {
    it('should parse complex markdown with multiple elements', () => {
      const content = `
# Main Heading

Some text with [[link1]] and [[link2]].

## Subheading

More text with #tag1 and #tag2.

### Another heading

Text with [[nested/link]] and #nested/tag.
      `.trim();
      
      const testFile: TFile = {
        path: '/test.md',
        name: 'test.md',
        basename: 'test',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      app.metadataCache.updateCache(testFile, content);
      const metadata = app.metadataCache.getFileCache(testFile);
      
      expect(metadata).toBeDefined();
      expect(metadata?.headings).toHaveLength(3);
      expect(metadata?.links).toHaveLength(3);
      expect(metadata?.tags).toHaveLength(3);
      
      // Check heading levels
      expect(metadata?.headings?.[0].level).toBe(1);
      expect(metadata?.headings?.[1].level).toBe(2);
      expect(metadata?.headings?.[2].level).toBe(3);
    });
    
    it('should track backlinks between files', () => {
      const file1: TFile = {
        path: '/file1.md',
        name: 'file1.md',
        basename: 'file1',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      const file2: TFile = {
        path: '/file2.md',
        name: 'file2.md',
        basename: 'file2',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      // file2 links to file1
      app.metadataCache.updateCache(file2, 'Link to [[file1]]');
      
      const backlinks = app.metadataCache.getBacklinksForFile(file1);
      expect(backlinks.size).toBeGreaterThan(0);
    });
    
    it('should clear cache for specific file', () => {
      const testFile: TFile = {
        path: '/test.md',
        name: 'test.md',
        basename: 'test',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      app.metadataCache.updateCache(testFile, '# Heading\n[[link]]');
      expect(app.metadataCache.getFileCache(testFile)).toBeDefined();
      
      app.metadataCache.clearCache(testFile);
      expect(app.metadataCache.getFileCache(testFile)).toBeNull();
    });
  });
  
  describe('Workspace Advanced Features', () => {
    it('should manage active file state', () => {
      const file1: TFile = {
        path: '/file1.md',
        name: 'file1.md',
        basename: 'file1',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      const file2: TFile = {
        path: '/file2.md',
        name: 'file2.md',
        basename: 'file2',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      app.workspace.setActiveFile(file1);
      expect(app.workspace.getActiveFile()).toEqual(file1);
      
      app.workspace.setActiveFile(file2);
      expect(app.workspace.getActiveFile()).toEqual(file2);
      
      app.workspace.setActiveFile(null);
      expect(app.workspace.getActiveFile()).toBeNull();
    });
    
    it('should trigger workspace events', async () => {
      const testFile: TFile = {
        path: '/test.md',
        name: 'test.md',
        basename: 'test',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };

      await new Promise<void>((resolve) => {
        app.workspace.on('active-leaf-change', () => {
          resolve();
        });
      
        app.workspace.setActiveFile(testFile);
      });
    });
  });
  
  describe('Error Handling', () => {
    it('should handle plugin registration errors gracefully', async () => {
      // Try to register same plugin twice
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      
      await expect(
        app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest)
      ).rejects.toThrow();
    });
    
    it('should handle enabling non-existent plugin', async () => {
      await expect(
        app.plugins.enablePlugin('non-existent-plugin')
      ).rejects.toThrow();
    });
    
    it('should handle disabling non-existent plugin', async () => {
      await expect(
        app.plugins.disablePlugin('non-existent-plugin')
      ).rejects.toThrow();
    });
  });
  
  describe('Plugin Lifecycle', () => {
    it('should call onload when plugin is enabled', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      await app.plugins.enablePlugin('advanced-test-plugin');

      // Check that onload was called (commands should be registered)
      const allCommands = app.commands.getAllCommands();
      expect(allCommands.length).toBeGreaterThan(0);
    });
    
    it('should call onunload when plugin is disabled', async () => {
      await app.plugins.registerPlugin(AdvancedTestPlugin, advancedManifest);
      await app.plugins.enablePlugin('advanced-test-plugin');
      
      const plugin = app.plugins.getPlugin('advanced-test-plugin') as unknown as AdvancedTestPlugin;
      plugin.executedCommands.push('test');
      
      await app.plugins.disablePlugin('advanced-test-plugin');
      
      // Check that onunload was called (commands should be cleared)
      expect(plugin.executedCommands).toHaveLength(0);
    });
  });
});
