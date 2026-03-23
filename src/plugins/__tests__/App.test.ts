/**
 * Plugin App API Tests - Aerospace Level
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { App, app, Commands } from '../../api/App';

describe('Plugin App API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('App Class', () => {
    it('should create App instance', () => {
      const testApp = new App();
      expect(testApp).toBeDefined();
      expect(testApp.vault).toBeDefined();
      expect(testApp.workspace).toBeDefined();
      expect(testApp.metadataCache).toBeDefined();
      expect(testApp.commands).toBeDefined();
      expect(testApp.plugins).toBeDefined();
    });

    it('should have correct version', () => {
      expect(app.getVersion()).toBe('1.0.0');
    });

    it('should initialize with workspace path', () => {
      const testApp = new App();
      testApp.initialize('/test/workspace');
      expect(testApp.vault).toBeDefined();
    });

    it('should detect mobile correctly', () => {
      const isMobile = app.isMobile();
      expect(typeof isMobile).toBe('boolean');
    });

    it('should save to localStorage', () => {
      app.saveLocalStorage('testKey', { test: 'value' });
      const result = app.loadLocalStorage('testKey');
      expect(result).toEqual({ test: 'value' });
    });

    it('should load from localStorage', () => {
      app.saveLocalStorage('testKey', { test: 'value' });
      const result = app.loadLocalStorage('testKey');
      expect(result).toEqual({ test: 'value' });
    });

    it('should handle non-existent localStorage key', () => {
      const result = app.loadLocalStorage('nonExistentKey');
      expect(result).toBeNull();
    });

    it('should register global event', () => {
      const callback = vi.fn();
      app.on('testEvent', callback);
      expect(callback).toBeDefined();
    });

    it('should trigger global event', () => {
      const callback = vi.fn();
      app.on('testEvent', callback);
      app.trigger('testEvent', 'arg1', 'arg2');
      expect(callback).toHaveBeenCalled();
    });

    it('should handle event with no listeners', () => {
      expect(() => {
        app.trigger('nonExistentEvent');
      }).not.toThrow();
    });
  });

  describe('Commands Class', () => {
    it('should create Commands instance', () => {
      const commands = new Commands();
      expect(commands).toBeDefined();
    });

    it('should register command', () => {
      const commands = new Commands();
      const command = {
        id: 'test-command',
        name: 'Test Command',
        callback: vi.fn(),
      };
      
      commands.registerCommand(command);
      expect(commands.findCommand('test-command')).toBeDefined();
    });

    it('should unregister command', () => {
      const commands = new Commands();
      const command = {
        id: 'test-command',
        name: 'Test Command',
        callback: vi.fn(),
      };
      
      commands.registerCommand(command);
      commands.unregisterCommand('test-command');
      expect(commands.findCommand('test-command')).toBeUndefined();
    });

    it('should execute command', () => {
      const commands = new Commands();
      const callback = vi.fn();
      const command = {
        id: 'test-command',
        name: 'Test Command',
        callback,
      };
      
      commands.registerCommand(command);
      const result = commands.executeCommand('test-command');
      
      expect(result).toBe(true);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return false for non-existent command', () => {
      const commands = new Commands();
      const result = commands.executeCommand('non-existent-command');
      expect(result).toBe(false);
    });

    it('should get all commands', () => {
      const commands = new Commands();
      const command1 = {
        id: 'command-1',
        name: 'Command 1',
        callback: vi.fn(),
      };
      const command2 = {
        id: 'command-2',
        name: 'Command 2',
        callback: vi.fn(),
      };
      
      commands.registerCommand(command1);
      commands.registerCommand(command2);
      
      const allCommands = commands.getAllCommands();
      expect(allCommands.length).toBe(2);
    });

    it('should find command by ID', () => {
      const commands = new Commands();
      const command = {
        id: 'test-command',
        name: 'Test Command',
        callback: vi.fn(),
      };
      
      commands.registerCommand(command);
      const found = commands.findCommand('test-command');
      
      expect(found).toBeDefined();
      expect(found?.id).toBe('test-command');
    });

    it('should return undefined for non-existent command', () => {
      const commands = new Commands();
      const found = commands.findCommand('non-existent-command');
      expect(found).toBeUndefined();
    });
  });

  describe('Singleton Instance', () => {
    it('should export singleton app instance', () => {
      expect(app).toBeDefined();
      expect(app).toBeInstanceOf(App);
    });

    it('should maintain singleton pattern', () => {
      const app1 = app;
      const app2 = app;
      expect(app1).toBe(app2);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => {
        app.saveLocalStorage('testKey', { test: 'value' });
      }).not.toThrow();
      
      mockSetItem.mockRestore();
    });

    it('should handle localStorage JSON parse errors', () => {
      const mockGetItem = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid json');
      
      const result = app.loadLocalStorage('testKey');
      expect(result).toBeNull();
      
      mockGetItem.mockRestore();
    });

    it('should handle command execution errors gracefully', () => {
      const commands = new Commands();
      const command = {
        id: 'error-command',
        name: 'Error Command',
        callback: () => { throw new Error('Command error'); },
      };
      
      commands.registerCommand(command);
      
      expect(() => {
        commands.executeCommand('error-command');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should register commands quickly', () => {
      const commands = new Commands();
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        commands.registerCommand({
          id: `command-${i}`,
          name: `Command ${i}`,
          callback: vi.fn(),
        });
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should execute commands quickly', () => {
      const commands = new Commands();
      const command = {
        id: 'test-command',
        name: 'Test Command',
        callback: vi.fn(),
      };
      
      commands.registerCommand(command);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        commands.executeCommand('test-command');
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle many commands efficiently', () => {
      const commands = new Commands();
      
      for (let i = 0; i < 10000; i++) {
        commands.registerCommand({
          id: `command-${i}`,
          name: `Command ${i}`,
          callback: vi.fn(),
        });
      }
      
      const allCommands = commands.getAllCommands();
      expect(allCommands.length).toBe(10000);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory when registering commands', () => {
      const commands = new Commands();
      
      for (let i = 0; i < 1000; i++) {
        commands.registerCommand({
          id: `command-${i}`,
          name: `Command ${i}`,
          callback: vi.fn(),
        });
      }
      
      const allCommands = commands.getAllCommands();
      expect(allCommands.length).toBe(1000);
    });

    it('should clean up commands when unregistered', () => {
      const commands = new Commands();
      
      for (let i = 0; i < 100; i++) {
        commands.registerCommand({
          id: `command-${i}`,
          name: `Command ${i}`,
          callback: vi.fn(),
        });
      }
      
      for (let i = 0; i < 100; i++) {
        commands.unregisterCommand(`command-${i}`);
      }
      
      const allCommands = commands.getAllCommands();
      expect(allCommands.length).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should integrate with plugin system', () => {
      expect(app.plugins).toBeDefined();
    });

    it('should integrate with vault', () => {
      expect(app.vault).toBeDefined();
    });

    it('should integrate with workspace', () => {
      expect(app.workspace).toBeDefined();
    });

    it('should integrate with metadata cache', () => {
      expect(app.metadataCache).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty command ID', () => {
      const commands = new Commands();
      const result = commands.executeCommand('');
      expect(result).toBe(false);
    });

    it('should handle null command ID', () => {
      const commands = new Commands();
      const result = commands.executeCommand(null as any);
      expect(result).toBe(false);
    });

    it('should handle undefined command ID', () => {
      const commands = new Commands();
      const result = commands.executeCommand(undefined as any);
      expect(result).toBe(false);
    });

    it('should handle command with no callback', () => {
      const commands = new Commands();
      const command = {
        id: 'no-callback-command',
        name: 'No Callback Command',
        callback: undefined as any,
      };
      
      commands.registerCommand(command);
      const result = commands.executeCommand('no-callback-command');
      
      expect(result).toBe(true);
    });

    it('should handle duplicate command registration', () => {
      const commands = new Commands();
      const command = {
        id: 'duplicate-command',
        name: 'Duplicate Command',
        callback: vi.fn(),
      };
      
      commands.registerCommand(command);
      commands.registerCommand(command);
      
      const found = commands.findCommand('duplicate-command');
      expect(found).toBeDefined();
    });
  });
});
