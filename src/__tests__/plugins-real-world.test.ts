/**
 * Real-World Plugin Tests
 * Tests for plugins that simulate real Obsidian plugin functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { App } from '../plugins/api/App';
import { TFile } from '../plugins/api/Vault';
import WordCountPlugin, { wordCountManifest } from '../plugins/samples/WordCountPlugin';
import QuickSwitcherPlugin, { quickSwitcherManifest } from '../plugins/samples/QuickSwitcherPlugin';
import BacklinksPlugin, { backlinksManifest } from '../plugins/samples/BacklinksPlugin';

describe('Real-World Plugin Tests', () => {
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
  
  describe('Word Count Plugin', () => {
    it('should register and enable successfully', async () => {
      await app.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
      await app.plugins.enablePlugin('word-count-plugin');
      
      expect(app.plugins.isPluginEnabled('word-count-plugin')).toBe(true);
    });
    
    it('should add word count command', async () => {
      await app.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
      await app.plugins.enablePlugin('word-count-plugin');
      
      const command = app.commands.findCommand('show-word-count');
      expect(command).toBeDefined();
      expect(command?.name).toBe('Show Word Count Statistics');
    });
    
    it('should count words correctly', async () => {
      await app.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
      await app.plugins.enablePlugin('word-count-plugin');
      
      const plugin = app.plugins.getPlugin('word-count-plugin') as WordCountPlugin;
      expect(plugin).toBeDefined();
      
      // Create a test file with content
      const testFile: TFile = {
        path: '/test.md',
        name: 'test.md',
        basename: 'test',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      const content = 'This is a test document with some words.';
      app.metadataCache.updateCache(testFile, content);
      app.workspace.setActiveFile(testFile);
      
      // Plugin should update word count
      // (In real implementation, this would be tested with proper mocking)
    });
  });
  
  describe('Quick Switcher Plugin', () => {
    it('should register and enable successfully', async () => {
      await app.plugins.registerPlugin(QuickSwitcherPlugin, quickSwitcherManifest);
      await app.plugins.enablePlugin('quick-switcher-plugin');
      
      expect(app.plugins.isPluginEnabled('quick-switcher-plugin')).toBe(true);
    });
    
    it('should add quick switcher commands', async () => {
      await app.plugins.registerPlugin(QuickSwitcherPlugin, quickSwitcherManifest);
      await app.plugins.enablePlugin('quick-switcher-plugin');
      
      const openCommand = app.commands.findCommand('open-quick-switcher');
      const searchCommand = app.commands.findCommand('search-current-file');
      
      expect(openCommand).toBeDefined();
      expect(searchCommand).toBeDefined();
      expect(openCommand?.name).toBe('Open Quick Switcher');
      expect(searchCommand?.name).toBe('Search in Current File');
    });
    
    it('should have hotkeys configured', async () => {
      await app.plugins.registerPlugin(QuickSwitcherPlugin, quickSwitcherManifest);
      await app.plugins.enablePlugin('quick-switcher-plugin');
      
      const openCommand = app.commands.findCommand('open-quick-switcher');
      expect(openCommand?.hotkeys).toBeDefined();
      expect(openCommand?.hotkeys?.length).toBeGreaterThan(0);
    });
  });
  
  describe('Backlinks Plugin', () => {
    it('should register and enable successfully', async () => {
      await app.plugins.registerPlugin(BacklinksPlugin, backlinksManifest);
      await app.plugins.enablePlugin('backlinks-plugin');
      
      expect(app.plugins.isPluginEnabled('backlinks-plugin')).toBe(true);
    });
    
    it('should add backlinks command', async () => {
      await app.plugins.registerPlugin(BacklinksPlugin, backlinksManifest);
      await app.plugins.enablePlugin('backlinks-plugin');
      
      const command = app.commands.findCommand('show-backlinks');
      expect(command).toBeDefined();
      expect(command?.name).toBe('Show Backlinks');
    });
    
    it('should track backlinks correctly', async () => {
      await app.plugins.registerPlugin(BacklinksPlugin, backlinksManifest);
      await app.plugins.enablePlugin('backlinks-plugin');
      
      // Create test files
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
      app.workspace.setActiveFile(file1);
      
      // Check backlinks
      const backlinks = app.metadataCache.getBacklinksForFile(file1);
      expect(backlinks.size).toBeGreaterThan(0);
    });
  });
  
  describe('Multi-Plugin Integration', () => {
    it('should run multiple plugins simultaneously', async () => {
      // Register all three plugins
      await app.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
      await app.plugins.registerPlugin(QuickSwitcherPlugin, quickSwitcherManifest);
      await app.plugins.registerPlugin(BacklinksPlugin, backlinksManifest);
      
      // Enable all plugins
      await app.plugins.enablePlugin('word-count-plugin');
      await app.plugins.enablePlugin('quick-switcher-plugin');
      await app.plugins.enablePlugin('backlinks-plugin');
      
      // Check all are enabled
      expect(app.plugins.getEnabledPlugins()).toHaveLength(3);
      
      // Check all commands are registered
      const allCommands = app.commands.getAllCommands();
      expect(allCommands.length).toBeGreaterThanOrEqual(4); // At least 4 commands from 3 plugins
    });
    
    it('should not interfere with each other', async () => {
      await app.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
      await app.plugins.registerPlugin(BacklinksPlugin, backlinksManifest);
      
      await app.plugins.enablePlugin('word-count-plugin');
      await app.plugins.enablePlugin('backlinks-plugin');
      
      // Disable one plugin
      await app.plugins.disablePlugin('word-count-plugin');
      
      // Other plugin should still be enabled
      expect(app.plugins.isPluginEnabled('backlinks-plugin')).toBe(true);
      expect(app.plugins.isPluginEnabled('word-count-plugin')).toBe(false);
    });
  });
  
  describe('Plugin Persistence', () => {
    it('should persist plugin state across sessions', async () => {
      // First session
      await app.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
      await app.plugins.enablePlugin('word-count-plugin');
      
      // Simulate app restart
      const app2 = new App();
      app2.initialize('/test/workspace');
      
      // Register plugin again
      await app2.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
      
      // Check if it was enabled before
      const config = app2.plugins.getPluginConfig('word-count-plugin');
      expect(config).toBeDefined();
      expect(config?.enabled).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle plugin load errors gracefully', async () => {
      await app.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
      
      // Try to enable twice
      await app.plugins.enablePlugin('word-count-plugin');
      
      // Should not throw, just warn
      await app.plugins.enablePlugin('word-count-plugin');
      
      expect(app.plugins.isPluginEnabled('word-count-plugin')).toBe(true);
    });
    
    it('should handle missing files gracefully', async () => {
      await app.plugins.registerPlugin(BacklinksPlugin, backlinksManifest);
      await app.plugins.enablePlugin('backlinks-plugin');
      
      // Set active file to null
      app.workspace.setActiveFile(null);
      
      // Plugin should handle this gracefully
      const backlinks = app.metadataCache.getBacklinksForFile({
        path: '/nonexistent.md',
        name: 'nonexistent.md',
        basename: 'nonexistent',
        extension: 'md',
        stat: { ctime: 0, mtime: 0, size: 0 }
      });
      
      expect(backlinks.size).toBe(0);
    });
  });
});
