/**
 * Command Registry Tests - Aerospace-grade testing
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandRegistry, Command } from '../../services/commands/CommandRegistry';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;
  let mockAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    registry = new CommandRegistry();
    mockAction = vi.fn();
  });

  describe('Command Registration', () => {
    it('should register a command', () => {
      const command: Command = {
        id: 'test:command',
        label: 'Test Command',
        category: 'test',
        action: mockAction,
      };

      registry.register(command);

      expect(registry.hasCommand('test:command')).toBe(true);
      expect(registry.getCommand('test:command')).toEqual(command);
    });

    it('should register multiple commands', () => {
      const commands: Command[] = [
        { id: 'cmd1', label: 'Command 1', category: 'test', action: mockAction },
        { id: 'cmd2', label: 'Command 2', category: 'test', action: mockAction },
      ];

      registry.registerMany(commands);

      expect(registry.getCommandCount()).toBe(2);
      expect(registry.hasCommand('cmd1')).toBe(true);
      expect(registry.hasCommand('cmd2')).toBe(true);
    });

    it('should overwrite existing command with warning', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const cmd1: Command = { id: 'test', label: 'First', category: 'test', action: mockAction };
      const cmd2: Command = { id: 'test', label: 'Second', category: 'test', action: mockAction };

      registry.register(cmd1);
      registry.register(cmd2);

      expect(consoleSpy).toHaveBeenCalled();
      expect(registry.getCommand('test')?.label).toBe('Second');
      
      consoleSpy.mockRestore();
    });

    it('should unregister a command', () => {
      const command: Command = {
        id: 'test:command',
        label: 'Test Command',
        category: 'test',
        action: mockAction,
      };

      registry.register(command);
      expect(registry.hasCommand('test:command')).toBe(true);

      registry.unregister('test:command');
      expect(registry.hasCommand('test:command')).toBe(false);
    });
  });

  describe('Command Execution', () => {
    it('should execute a command', async () => {
      const command: Command = {
        id: 'test:execute',
        label: 'Execute Test',
        category: 'test',
        action: mockAction,
      };

      registry.register(command);
      const result = await registry.execute('test:execute');

      expect(result).toBe(true);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should execute async command', async () => {
      const asyncAction = vi.fn().mockResolvedValue(undefined);
      const command: Command = {
        id: 'test:async',
        label: 'Async Test',
        category: 'test',
        action: asyncAction,
      };

      registry.register(command);
      const result = await registry.execute('test:async');

      expect(result).toBe(true);
      expect(asyncAction).toHaveBeenCalledTimes(1);
    });

    it('should return false for non-existent command', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await registry.execute('non:existent');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should check condition before execution', async () => {
      const condition = vi.fn().mockReturnValue(false);
      const command: Command = {
        id: 'test:condition',
        label: 'Condition Test',
        category: 'test',
        action: mockAction,
        condition,
      };

      registry.register(command);
      const result = await registry.execute('test:condition');

      expect(result).toBe(false);
      expect(condition).toHaveBeenCalledTimes(1);
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should execute when condition is true', async () => {
      const condition = vi.fn().mockReturnValue(true);
      const command: Command = {
        id: 'test:condition-true',
        label: 'Condition True Test',
        category: 'test',
        action: mockAction,
        condition,
      };

      registry.register(command);
      const result = await registry.execute('test:condition-true');

      expect(result).toBe(true);
      expect(condition).toHaveBeenCalledTimes(1);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should handle command execution errors', async () => {
      const errorAction = vi.fn().mockRejectedValue(new Error('Test error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const command: Command = {
        id: 'test:error',
        label: 'Error Test',
        category: 'test',
        action: errorAction,
      };

      registry.register(command);
      const result = await registry.execute('test:error');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Command Queries', () => {
    beforeEach(() => {
      const commands: Command[] = [
        { id: 'file:new', label: 'New File', category: 'file', action: mockAction },
        { id: 'file:save', label: 'Save File', category: 'file', action: mockAction },
        { id: 'edit:undo', label: 'Undo', category: 'edit', action: mockAction },
        { id: 'edit:redo', label: 'Redo', category: 'edit', action: mockAction },
        { id: 'view:toggle', label: 'Toggle View', category: 'view', action: mockAction },
      ];
      registry.registerMany(commands);
    });

    it('should get all commands', () => {
      const commands = registry.getAllCommands();
      expect(commands).toHaveLength(5);
    });

    it('should get commands by category', () => {
      const fileCommands = registry.getCommandsByCategory('file');
      expect(fileCommands).toHaveLength(2);
      expect(fileCommands.every(cmd => cmd.category === 'file')).toBe(true);
    });

    it('should search commands by label', () => {
      const results = registry.searchCommands('file');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.some(cmd => cmd.label.includes('File'))).toBe(true);
    });

    it('should search commands by description', () => {
      registry.register({
        id: 'test:desc',
        label: 'Test',
        description: 'This is a special command',
        category: 'test',
        action: mockAction,
      });

      const results = registry.searchCommands('special');
      expect(results.some(cmd => cmd.id === 'test:desc')).toBe(true);
    });

    it('should prioritize label matches in search', () => {
      const results = registry.searchCommands('undo');
      expect(results[0].id).toBe('edit:undo');
    });

    it('should return empty array for no matches', () => {
      const results = registry.searchCommands('nonexistent');
      expect(results).toHaveLength(0);
    });

    it('should get command count', () => {
      expect(registry.getCommandCount()).toBe(5);
    });
  });

  describe('Categories', () => {
    it('should have predefined categories', () => {
      const categories = registry.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some(cat => cat.id === 'file')).toBe(true);
      expect(categories.some(cat => cat.id === 'edit')).toBe(true);
    });

    it('should return categories in order', () => {
      const categories = registry.getCategories();
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].order).toBeGreaterThanOrEqual(categories[i - 1].order);
      }
    });
  });

  describe('Listeners', () => {
    it('should notify listeners on command registration', () => {
      const listener = vi.fn();
      registry.addListener(listener);

      registry.register({
        id: 'test',
        label: 'Test',
        category: 'test',
        action: mockAction,
      });

      expect(listener).toHaveBeenCalled();
    });

    it('should notify listeners on command unregistration', () => {
      const listener = vi.fn();
      
      registry.register({
        id: 'test',
        label: 'Test',
        category: 'test',
        action: mockAction,
      });

      registry.addListener(listener);
      registry.unregister('test');

      expect(listener).toHaveBeenCalled();
    });

    it('should remove listener when unsubscribe is called', () => {
      const listener = vi.fn();
      const unsubscribe = registry.addListener(listener);

      unsubscribe();

      registry.register({
        id: 'test',
        label: 'Test',
        category: 'test',
        action: mockAction,
      });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      registry.addListener(listener1);
      registry.addListener(listener2);

      registry.register({
        id: 'test',
        label: 'Test',
        category: 'test',
        action: mockAction,
      });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Clear Operations', () => {
    it('should clear all commands', () => {
      registry.registerMany([
        { id: 'cmd1', label: 'Command 1', category: 'test', action: mockAction },
        { id: 'cmd2', label: 'Command 2', category: 'test', action: mockAction },
      ]);

      expect(registry.getCommandCount()).toBe(2);

      registry.clear();

      expect(registry.getCommandCount()).toBe(0);
    });

    it('should notify listeners when clearing', () => {
      const listener = vi.fn();
      registry.addListener(listener);

      registry.clear();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search query', () => {
      registry.register({
        id: 'test',
        label: 'Test',
        category: 'test',
        action: mockAction,
      });

      const results = registry.searchCommands('');
      expect(results).toHaveLength(1);
    });

    it('should handle case-insensitive search', () => {
      registry.register({
        id: 'test',
        label: 'Test Command',
        category: 'test',
        action: mockAction,
      });

      const results = registry.searchCommands('TEST');
      expect(results).toHaveLength(1);
    });

    it('should handle special characters in search', () => {
      registry.register({
        id: 'test',
        label: 'Test (Command)',
        category: 'test',
        action: mockAction,
      });

      const results = registry.searchCommands('(Command)');
      expect(results).toHaveLength(1);
    });
  });

  describe('Performance', () => {
    it('should handle large number of commands', () => {
      const commands: Command[] = [];
      for (let i = 0; i < 1000; i++) {
        commands.push({
          id: `cmd${i}`,
          label: `Command ${i}`,
          category: 'test',
          action: mockAction,
        });
      }

      const start = performance.now();
      registry.registerMany(commands);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should be fast
      expect(registry.getCommandCount()).toBe(1000);
    });

    it('should search efficiently in large command set', () => {
      const commands: Command[] = [];
      for (let i = 0; i < 1000; i++) {
        commands.push({
          id: `cmd${i}`,
          label: `Command ${i}`,
          category: 'test',
          action: mockAction,
        });
      }
      registry.registerMany(commands);

      const start = performance.now();
      const results = registry.searchCommands('500');
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should be fast
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
