/**
 * Plugin System Tests
 * Tests for Obsidian plugin compatibility system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { App } from '../plugins/api/App';
import { Plugin } from '../plugins/types/plugin';
import { PluginManifest } from '../plugins/types/manifest';

// Test plugin class
class TestPlugin extends Plugin {
  loadCalled = false;
  unloadCalled = false;
  
  async onload() {
    this.loadCalled = true;
  }
  
  async onunload() {
    this.unloadCalled = true;
  }
}

const testManifest: PluginManifest = {
  id: 'test-plugin',
  name: 'Test Plugin',
  version: '1.0.0',
  minAppVersion: '1.0.0',
  description: 'A test plugin',
  author: 'Test Author',
};

describe('Plugin System', () => {
  let app: App;
  
  beforeEach(() => {
    app = new App();
    localStorage.clear();
  });
  
  afterEach(async () => {
    await app.plugins.unloadAllPlugins();
    localStorage.clear();
  });
  
  describe('App', () => {
    it('should create app instance with all subsystems', () => {
      expect(app).toBeDefined();
      expect(app.vault).toBeDefined();
      expect(app.workspace).toBeDefined();
      expect(app.metadataCache).toBeDefined();
      expect(app.commands).toBeDefined();
      expect(app.plugins).toBeDefined();
    });
    
    it('should initialize with workspace path', () => {
      const testPath = '/test/workspace';
      app.initialize(testPath);
      // Vault should have workspace path set
      expect(app.vault).toBeDefined();
    });
  });
  
  describe('PluginManager', () => {
    it('should register a plugin', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      
      const plugin = app.plugins.getPlugin('test-plugin');
      expect(plugin).toBeDefined();
      expect(plugin).toBeInstanceOf(TestPlugin);
    });
    
    it('should enable a plugin', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      await app.plugins.enablePlugin('test-plugin');
      
      const plugin = app.plugins.getPlugin('test-plugin') as TestPlugin;
      expect(plugin.loadCalled).toBe(true);
      expect(app.plugins.isPluginEnabled('test-plugin')).toBe(true);
    });
    
    it('should disable a plugin', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      await app.plugins.enablePlugin('test-plugin');
      await app.plugins.disablePlugin('test-plugin');
      
      const plugin = app.plugins.getPlugin('test-plugin') as TestPlugin;
      expect(plugin.unloadCalled).toBe(true);
      expect(app.plugins.isPluginEnabled('test-plugin')).toBe(false);
    });
    
    it('should unload a plugin', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      await app.plugins.enablePlugin('test-plugin');
      await app.plugins.unloadPlugin('test-plugin');
      
      const plugin = app.plugins.getPlugin('test-plugin');
      expect(plugin).toBeUndefined();
    });
    
    it('should get all plugins', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      
      const plugins = app.plugins.getAllPlugins();
      expect(plugins).toHaveLength(1);
      expect(plugins[0].manifest.id).toBe('test-plugin');
    });
    
    it('should get enabled plugins', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      await app.plugins.enablePlugin('test-plugin');
      
      const enabledPlugins = app.plugins.getEnabledPlugins();
      expect(enabledPlugins).toHaveLength(1);
      expect(enabledPlugins[0].enabled).toBe(true);
    });
    
    it('should persist plugin config to localStorage', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      await app.plugins.enablePlugin('test-plugin');
      
      const config = localStorage.getItem('a3note-plugin-configs');
      expect(config).toBeDefined();
      
      const parsed = JSON.parse(config!);
      expect(parsed['test-plugin']).toBeDefined();
      expect(parsed['test-plugin'].enabled).toBe(true);
    });
  });
  
  describe('Plugin Base Class', () => {
    it('should add commands', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      const plugin = app.plugins.getPlugin('test-plugin') as TestPlugin;
      
      let commandExecuted = false;
      plugin.addCommand({
        id: 'test-command',
        name: 'Test Command',
        callback: () => { commandExecuted = true; }
      });
      
      const command = app.commands.findCommand('test-command');
      expect(command).toBeDefined();
      
      app.commands.executeCommand('test-command');
      expect(commandExecuted).toBe(true);
    });
    
    it('should save and load plugin data', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      const plugin = app.plugins.getPlugin('test-plugin') as TestPlugin;
      
      const testData = { foo: 'bar', count: 42 };
      await plugin.saveData(testData);
      
      const loadedData = await plugin.loadData();
      expect(loadedData).toEqual(testData);
    });
    
    it('should add status bar item', async () => {
      await app.plugins.registerPlugin(TestPlugin, testManifest);
      const plugin = app.plugins.getPlugin('test-plugin') as TestPlugin;
      
      const statusBarItem = plugin.addStatusBarItem();
      expect(statusBarItem).toBeInstanceOf(HTMLElement);
    });
  });
  
  describe('Vault API', () => {
    beforeEach(() => {
      app.initialize('/test/workspace');
    });
    
    it('should have vault instance', () => {
      expect(app.vault).toBeDefined();
    });
    
    it('should have file operation methods', () => {
      expect(typeof app.vault.read).toBe('function');
      expect(typeof app.vault.modify).toBe('function');
      expect(typeof app.vault.create).toBe('function');
      expect(typeof app.vault.delete).toBe('function');
      expect(typeof app.vault.exists).toBe('function');
    });
  });
  
  describe('Workspace API', () => {
    it('should have workspace instance', () => {
      expect(app.workspace).toBeDefined();
    });
    
    it('should manage active file', () => {
      const testFile = {
        path: '/test.md',
        name: 'test.md',
        basename: 'test',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      app.workspace.setActiveFile(testFile);
      const activeFile = app.workspace.getActiveFile();
      expect(activeFile).toEqual(testFile);
    });
  });
  
  describe('MetadataCache API', () => {
    it('should have metadata cache instance', () => {
      expect(app.metadataCache).toBeDefined();
    });
    
    it('should parse markdown metadata', () => {
      const content = `
# Heading 1
Some text with [[link]] and #tag

## Heading 2
More text
      `.trim();
      
      const testFile = {
        path: '/test.md',
        name: 'test.md',
        basename: 'test',
        extension: 'md',
        stat: { ctime: Date.now(), mtime: Date.now(), size: 0 }
      };
      
      app.metadataCache.updateCache(testFile, content);
      const metadata = app.metadataCache.getFileCache(testFile);
      
      expect(metadata).toBeDefined();
      expect(metadata?.headings).toHaveLength(2);
      expect(metadata?.links).toHaveLength(1);
      expect(metadata?.tags).toHaveLength(1);
    });
  });
  
  describe('Commands API', () => {
    it('should register commands', () => {
      let executed = false;
      
      app.commands.registerCommand({
        id: 'test-cmd',
        name: 'Test Command',
        callback: () => { executed = true; }
      });
      
      const result = app.commands.executeCommand('test-cmd');
      expect(result).toBe(true);
      expect(executed).toBe(true);
    });
    
    it('should get all commands', () => {
      app.commands.registerCommand({
        id: 'cmd1',
        name: 'Command 1',
        callback: () => {}
      });
      
      app.commands.registerCommand({
        id: 'cmd2',
        name: 'Command 2',
        callback: () => {}
      });
      
      const commands = app.commands.getAllCommands();
      expect(commands).toHaveLength(2);
    });
    
    it('should unregister commands', () => {
      app.commands.registerCommand({
        id: 'temp-cmd',
        name: 'Temp Command',
        callback: () => {}
      });
      
      app.commands.unregisterCommand('temp-cmd');
      const command = app.commands.findCommand('temp-cmd');
      expect(command).toBeUndefined();
    });
  });
});
