/**
 * Command System Integration Tests - Aerospace-grade testing
 * DO-178C Level A Testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandRegistry } from '../../services/commands/CommandRegistry';
import { createEditorCommands } from '../../services/commands/EditorCommands';
import { createNavigationCommands } from '../../services/commands/NavigationCommands';
import { createFormatCommands } from '../../services/commands/FormatCommands';
import { createWorkspaceCommands } from '../../services/commands/WorkspaceCommands';

describe('Command System Integration', () => {
  let registry: CommandRegistry;
  let mockContext: any;

  beforeEach(() => {
    registry = new CommandRegistry();
    
    // Create mock context with all required methods
    mockContext = {
      // Editor commands
      undo: vi.fn(),
      redo: vi.fn(),
      cut: vi.fn(),
      copy: vi.fn(),
      paste: vi.fn(),
      selectAll: vi.fn(),
      find: vi.fn(),
      replace: vi.fn(),
      findNext: vi.fn(),
      findPrevious: vi.fn(),
      toggleComment: vi.fn(),
      duplicateLine: vi.fn(),
      deleteLine: vi.fn(),
      moveLineUp: vi.fn(),
      moveLineDown: vi.fn(),
      indentLine: vi.fn(),
      outdentLine: vi.fn(),
      insertLineAbove: vi.fn(),
      insertLineBelow: vi.fn(),
      joinLines: vi.fn(),
      transformToUppercase: vi.fn(),
      transformToLowercase: vi.fn(),
      transformToTitleCase: vi.fn(),
      sortLinesAscending: vi.fn(),
      sortLinesDescending: vi.fn(),
      trimTrailingWhitespace: vi.fn(),
      
      // Navigation commands
      goToLine: vi.fn(),
      goToFile: vi.fn(),
      goToSymbol: vi.fn(),
      goToDefinition: vi.fn(),
      goToReferences: vi.fn(),
      goBack: vi.fn(),
      goForward: vi.fn(),
      jumpToTop: vi.fn(),
      jumpToBottom: vi.fn(),
      jumpToMatchingBracket: vi.fn(),
      nextHeading: vi.fn(),
      previousHeading: vi.fn(),
      nextLink: vi.fn(),
      previousLink: vi.fn(),
      followLink: vi.fn(),
      openLinkInNewPane: vi.fn(),
      navigateBack: vi.fn(),
      navigateForward: vi.fn(),
      quickSwitcher: vi.fn(),
      recentFiles: vi.fn(),
      
      // Format commands
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleStrikethrough: vi.fn(),
      toggleHighlight: vi.fn(),
      toggleCode: vi.fn(),
      toggleCodeBlock: vi.fn(),
      insertLink: vi.fn(),
      insertImage: vi.fn(),
      insertTable: vi.fn(),
      insertHeading1: vi.fn(),
      insertHeading2: vi.fn(),
      insertHeading3: vi.fn(),
      insertHeading4: vi.fn(),
      insertHeading5: vi.fn(),
      insertHeading6: vi.fn(),
      insertBulletList: vi.fn(),
      insertNumberedList: vi.fn(),
      insertTaskList: vi.fn(),
      insertBlockquote: vi.fn(),
      insertHorizontalRule: vi.fn(),
      insertCallout: vi.fn(),
      insertMathBlock: vi.fn(),
      insertMathInline: vi.fn(),
      insertFootnote: vi.fn(),
      insertWikilink: vi.fn(),
      insertEmbed: vi.fn(),
      increaseHeadingLevel: vi.fn(),
      decreaseHeadingLevel: vi.fn(),
      toggleHeading: vi.fn(),
      clearFormatting: vi.fn(),
      
      // Workspace commands
      splitVertical: vi.fn(),
      splitHorizontal: vi.fn(),
      closePane: vi.fn(),
      closeOtherPanes: vi.fn(),
      closeAllPanes: vi.fn(),
      focusLeft: vi.fn(),
      focusRight: vi.fn(),
      focusUp: vi.fn(),
      focusDown: vi.fn(),
      moveToLeftPane: vi.fn(),
      moveToRightPane: vi.fn(),
      toggleLeftSidebar: vi.fn(),
      toggleRightSidebar: vi.fn(),
      toggleBothSidebars: vi.fn(),
      saveLayout: vi.fn(),
      loadLayout: vi.fn(),
      resetLayout: vi.fn(),
      toggleFullscreen: vi.fn(),
      toggleZenMode: vi.fn(),
      openInNewWindow: vi.fn(),
      duplicatePane: vi.fn(),
      swapPanes: vi.fn(),
      maximizePane: vi.fn(),
      restorePane: vi.fn(),
    };
  });

  describe('Command Registration', () => {
    it('should register all editor commands', () => {
      const commands = createEditorCommands(mockContext);
      registry.registerMany(commands);

      expect(registry.hasCommand('editor:undo')).toBe(true);
      expect(registry.hasCommand('editor:redo')).toBe(true);
      expect(registry.hasCommand('editor:cut')).toBe(true);
      expect(registry.hasCommand('editor:copy')).toBe(true);
      expect(registry.hasCommand('editor:paste')).toBe(true);
    });

    it('should register all navigation commands', () => {
      const commands = createNavigationCommands(mockContext);
      registry.registerMany(commands);

      expect(registry.hasCommand('navigate:go-to-line')).toBe(true);
      expect(registry.hasCommand('navigate:go-to-file')).toBe(true);
      expect(registry.hasCommand('navigate:back')).toBe(true);
      expect(registry.hasCommand('navigate:forward')).toBe(true);
    });

    it('should register all format commands', () => {
      const commands = createFormatCommands(mockContext);
      registry.registerMany(commands);

      expect(registry.hasCommand('format:bold')).toBe(true);
      expect(registry.hasCommand('format:italic')).toBe(true);
      expect(registry.hasCommand('format:heading-1')).toBe(true);
      expect(registry.hasCommand('format:link')).toBe(true);
    });

    it('should register all workspace commands', () => {
      const commands = createWorkspaceCommands(mockContext);
      registry.registerMany(commands);

      expect(registry.hasCommand('workspace:split-vertical')).toBe(true);
      expect(registry.hasCommand('workspace:close-pane')).toBe(true);
      expect(registry.hasCommand('workspace:toggle-left-sidebar')).toBe(true);
    });

    it('should register all command categories', () => {
      const editorCommands = createEditorCommands(mockContext);
      const navCommands = createNavigationCommands(mockContext);
      const formatCommands = createFormatCommands(mockContext);
      const workspaceCommands = createWorkspaceCommands(mockContext);

      registry.registerMany([
        ...editorCommands,
        ...navCommands,
        ...formatCommands,
        ...workspaceCommands,
      ]);

      const editCommands = registry.getCommandsByCategory('edit');
      const navigateCommands = registry.getCommandsByCategory('navigate');
      const formatCmds = registry.getCommandsByCategory('format');
      const workspaceCmds = registry.getCommandsByCategory('workspace');

      expect(editCommands.length).toBeGreaterThan(0);
      expect(navigateCommands.length).toBeGreaterThan(0);
      expect(formatCmds.length).toBeGreaterThan(0);
      expect(workspaceCmds.length).toBeGreaterThan(0);
    });
  });

  describe('Command Execution', () => {
    beforeEach(() => {
      const editorCommands = createEditorCommands(mockContext);
      registry.registerMany(editorCommands);
    });

    it('should execute editor commands', async () => {
      await registry.execute('editor:undo');
      expect(mockContext.undo).toHaveBeenCalled();

      await registry.execute('editor:redo');
      expect(mockContext.redo).toHaveBeenCalled();
    });

    it('should execute navigation commands', async () => {
      const navCommands = createNavigationCommands(mockContext);
      registry.registerMany(navCommands);

      await registry.execute('navigate:go-to-line');
      expect(mockContext.goToLine).toHaveBeenCalled();
    });

    it('should execute format commands', async () => {
      const formatCommands = createFormatCommands(mockContext);
      registry.registerMany(formatCommands);

      await registry.execute('format:bold');
      expect(mockContext.toggleBold).toHaveBeenCalled();
    });

    it('should execute workspace commands', async () => {
      const workspaceCommands = createWorkspaceCommands(mockContext);
      registry.registerMany(workspaceCommands);

      await registry.execute('workspace:split-vertical');
      expect(mockContext.splitVertical).toHaveBeenCalled();
    });
  });

  describe('Command Search', () => {
    beforeEach(() => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
        ...createFormatCommands(mockContext),
        ...createWorkspaceCommands(mockContext),
      ];
      registry.registerMany(allCommands);
    });

    it('should search across all command categories', () => {
      const results = registry.searchCommands('line');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find commands by action name', () => {
      const results = registry.searchCommands('undo');
      expect(results.some(cmd => cmd.id === 'editor:undo')).toBe(true);
    });

    it('should find commands by category', () => {
      const results = registry.searchCommands('format');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find commands by description', () => {
      const results = registry.searchCommands('jump');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
        ...createFormatCommands(mockContext),
        ...createWorkspaceCommands(mockContext),
      ];
      registry.registerMany(allCommands);
    });

    it('should have shortcuts for common editor commands', () => {
      const undo = registry.getCommand('editor:undo');
      expect(undo?.shortcut).toBeDefined();

      const redo = registry.getCommand('editor:redo');
      expect(redo?.shortcut).toBeDefined();
    });

    it('should have shortcuts for navigation commands', () => {
      const goToLine = registry.getCommand('navigate:go-to-line');
      expect(goToLine?.shortcut).toBeDefined();
    });

    it('should have shortcuts for format commands', () => {
      const bold = registry.getCommand('format:bold');
      expect(bold?.shortcut).toBeDefined();

      const italic = registry.getCommand('format:italic');
      expect(italic?.shortcut).toBeDefined();
    });

    it('should have unique shortcuts', () => {
      const allCommands = registry.getAllCommands();
      const shortcuts = allCommands
        .filter(cmd => cmd.shortcut)
        .map(cmd => cmd.shortcut);

      const uniqueShortcuts = new Set(shortcuts);
      expect(shortcuts.length).toBe(uniqueShortcuts.size);
    });
  });

  describe('Command Categories', () => {
    it('should organize commands by category', () => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
        ...createFormatCommands(mockContext),
        ...createWorkspaceCommands(mockContext),
      ];
      registry.registerMany(allCommands);

      const categories = registry.getCategories();
      expect(categories.length).toBeGreaterThan(0);

      const categoryIds = categories.map(c => c.id);
      expect(categoryIds).toContain('edit');
      expect(categoryIds).toContain('navigate');
      expect(categoryIds).toContain('format');
      expect(categoryIds).toContain('workspace');
    });

    it('should have all commands in valid categories', () => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
        ...createFormatCommands(mockContext),
        ...createWorkspaceCommands(mockContext),
      ];
      registry.registerMany(allCommands);

      const validCategories = registry.getCategories().map(c => c.id);
      const commands = registry.getAllCommands();

      for (const cmd of commands) {
        expect(validCategories).toContain(cmd.category);
      }
    });
  });

  describe('Command Count', () => {
    it('should have 50+ total commands', () => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
        ...createFormatCommands(mockContext),
        ...createWorkspaceCommands(mockContext),
      ];
      registry.registerMany(allCommands);

      expect(registry.getCommandCount()).toBeGreaterThanOrEqual(50);
    });

    it('should have 20+ editor commands', () => {
      const commands = createEditorCommands(mockContext);
      expect(commands.length).toBeGreaterThanOrEqual(20);
    });

    it('should have 15+ navigation commands', () => {
      const commands = createNavigationCommands(mockContext);
      expect(commands.length).toBeGreaterThanOrEqual(15);
    });

    it('should have 25+ format commands', () => {
      const commands = createFormatCommands(mockContext);
      expect(commands.length).toBeGreaterThanOrEqual(25);
    });

    it('should have 20+ workspace commands', () => {
      const commands = createWorkspaceCommands(mockContext);
      expect(commands.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
      ];
      registry.registerMany(allCommands);
    });

    it('should handle command execution errors gracefully', async () => {
      mockContext.undo.mockRejectedValue(new Error('Test error'));

      const result = await registry.execute('editor:undo');
      expect(result).toBe(false);
    });

    it('should continue working after error', async () => {
      mockContext.undo.mockRejectedValue(new Error('Test error'));
      await registry.execute('editor:undo');

      // Should still work for other commands
      const result = await registry.execute('editor:redo');
      expect(result).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should register commands quickly', () => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
        ...createFormatCommands(mockContext),
        ...createWorkspaceCommands(mockContext),
      ];

      const start = performance.now();
      registry.registerMany(allCommands);
      const end = performance.now();

      expect(end - start).toBeLessThan(50);
    });

    it('should search commands quickly', () => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
        ...createFormatCommands(mockContext),
        ...createWorkspaceCommands(mockContext),
      ];
      registry.registerMany(allCommands);

      const start = performance.now();
      registry.searchCommands('format');
      const end = performance.now();

      expect(end - start).toBeLessThan(10);
    });

    it('should execute commands quickly', async () => {
      const commands = createEditorCommands(mockContext);
      registry.registerMany(commands);

      const start = performance.now();
      await registry.execute('editor:undo');
      const end = performance.now();

      expect(end - start).toBeLessThan(5);
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(() => {
      const allCommands = [
        ...createEditorCommands(mockContext),
        ...createNavigationCommands(mockContext),
        ...createFormatCommands(mockContext),
        ...createWorkspaceCommands(mockContext),
      ];
      registry.registerMany(allCommands);
    });

    it('should support typical editing workflow', async () => {
      // User types, then wants to undo
      await registry.execute('editor:undo');
      expect(mockContext.undo).toHaveBeenCalled();

      // User wants to redo
      await registry.execute('editor:redo');
      expect(mockContext.redo).toHaveBeenCalled();

      // User wants to format text
      await registry.execute('format:bold');
      expect(mockContext.toggleBold).toHaveBeenCalled();
    });

    it('should support navigation workflow', async () => {
      // User wants to jump to a line
      await registry.execute('navigate:go-to-line');
      expect(mockContext.goToLine).toHaveBeenCalled();

      // User wants to go back
      await registry.execute('navigate:back');
      expect(mockContext.goBack).toHaveBeenCalled();
    });

    it('should support workspace management workflow', async () => {
      // User splits pane
      await registry.execute('workspace:split-vertical');
      expect(mockContext.splitVertical).toHaveBeenCalled();

      // User toggles sidebar
      await registry.execute('workspace:toggle-left-sidebar');
      expect(mockContext.toggleLeftSidebar).toHaveBeenCalled();
    });

    it('should support command palette search workflow', () => {
      // User searches for "bold"
      let results = registry.searchCommands('bold');
      expect(results.some(cmd => cmd.id === 'format:bold')).toBe(true);

      // User searches for "split"
      results = registry.searchCommands('split');
      expect(results.some(cmd => cmd.id === 'workspace:split-vertical')).toBe(true);
    });
  });
});
