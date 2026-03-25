/**
 * Workspace Commands - Aerospace-grade workspace command definitions
 * Complete set of workspace and layout commands
 */

import { Command } from './CommandRegistry';

export interface WorkspaceCommandContext {
  splitVertical: () => void;
  splitHorizontal: () => void;
  closePane: () => void;
  closeOtherPanes: () => void;
  closeAllPanes: () => void;
  focusLeft: () => void;
  focusRight: () => void;
  focusUp: () => void;
  focusDown: () => void;
  moveToLeftPane: () => void;
  moveToRightPane: () => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleBothSidebars: () => void;
  saveLayout: () => void;
  loadLayout: () => void;
  resetLayout: () => void;
  toggleFullscreen: () => void;
  toggleZenMode: () => void;
  openInNewWindow: () => void;
  duplicatePane: () => void;
  swapPanes: () => void;
  maximizePane: () => void;
  restorePane: () => void;
}

/**
 * Create workspace commands
 */
export function createWorkspaceCommands(context: WorkspaceCommandContext): Command[] {
  return [
    // Split operations
    {
      id: 'workspace:split-vertical',
      label: 'Split Vertically',
      description: 'Split pane vertically',
      shortcut: '⌘+\\',
      category: 'workspace',
      icon: 'columns',
      action: context.splitVertical,
    },
    {
      id: 'workspace:split-horizontal',
      label: 'Split Horizontally',
      description: 'Split pane horizontally',
      shortcut: '⌘+Shift+\\',
      category: 'workspace',
      icon: 'rows',
      action: context.splitHorizontal,
    },

    // Pane management
    {
      id: 'workspace:close-pane',
      label: 'Close Pane',
      description: 'Close current pane',
      shortcut: '⌘+W',
      category: 'workspace',
      icon: 'x',
      action: context.closePane,
    },
    {
      id: 'workspace:close-other-panes',
      label: 'Close Other Panes',
      description: 'Close all panes except current',
      shortcut: '⌘+⌥+W',
      category: 'workspace',
      icon: 'x-circle',
      action: context.closeOtherPanes,
    },
    {
      id: 'workspace:close-all-panes',
      label: 'Close All Panes',
      description: 'Close all panes',
      shortcut: '⌘+Shift+⌥+W',
      category: 'workspace',
      icon: 'x-square',
      action: context.closeAllPanes,
    },
    {
      id: 'workspace:duplicate-pane',
      label: 'Duplicate Pane',
      description: 'Duplicate current pane',
      category: 'workspace',
      icon: 'copy',
      action: context.duplicatePane,
    },

    // Focus navigation
    {
      id: 'workspace:focus-left',
      label: 'Focus Left Pane',
      description: 'Move focus to left pane',
      shortcut: '⌘+⌥+←',
      category: 'workspace',
      icon: 'arrow-left',
      action: context.focusLeft,
    },
    {
      id: 'workspace:focus-right',
      label: 'Focus Right Pane',
      description: 'Move focus to right pane',
      shortcut: '⌘+⌥+→',
      category: 'workspace',
      icon: 'arrow-right',
      action: context.focusRight,
    },
    {
      id: 'workspace:focus-up',
      label: 'Focus Upper Pane',
      description: 'Move focus to upper pane',
      shortcut: '⌘+⌥+↑',
      category: 'workspace',
      icon: 'arrow-up',
      action: context.focusUp,
    },
    {
      id: 'workspace:focus-down',
      label: 'Focus Lower Pane',
      description: 'Move focus to lower pane',
      shortcut: '⌘+⌥+↓',
      category: 'workspace',
      icon: 'arrow-down',
      action: context.focusDown,
    },

    // Move pane
    {
      id: 'workspace:move-left',
      label: 'Move to Left Pane',
      description: 'Move file to left pane',
      shortcut: '⌘+Shift+⌥+←',
      category: 'workspace',
      icon: 'move-left',
      action: context.moveToLeftPane,
    },
    {
      id: 'workspace:move-right',
      label: 'Move to Right Pane',
      description: 'Move file to right pane',
      shortcut: '⌘+Shift+⌥+→',
      category: 'workspace',
      icon: 'move-right',
      action: context.moveToRightPane,
    },
    {
      id: 'workspace:swap-panes',
      label: 'Swap Panes',
      description: 'Swap current pane with adjacent',
      category: 'workspace',
      icon: 'repeat',
      action: context.swapPanes,
    },

    // Sidebar toggles
    {
      id: 'workspace:toggle-left-sidebar',
      label: 'Toggle Left Sidebar',
      description: 'Show/hide left sidebar',
      shortcut: '⌘+B',
      category: 'workspace',
      icon: 'sidebar-left',
      action: context.toggleLeftSidebar,
    },
    {
      id: 'workspace:toggle-right-sidebar',
      label: 'Toggle Right Sidebar',
      description: 'Show/hide right sidebar',
      shortcut: '⌘+⌥+B',
      category: 'workspace',
      icon: 'sidebar-right',
      action: context.toggleRightSidebar,
    },
    {
      id: 'workspace:toggle-both-sidebars',
      label: 'Toggle Both Sidebars',
      description: 'Show/hide both sidebars',
      shortcut: '⌘+Shift+B',
      category: 'workspace',
      icon: 'sidebar',
      action: context.toggleBothSidebars,
    },

    // Layout management
    {
      id: 'workspace:save-layout',
      label: 'Save Layout',
      description: 'Save current workspace layout',
      category: 'workspace',
      icon: 'save',
      action: context.saveLayout,
    },
    {
      id: 'workspace:load-layout',
      label: 'Load Layout',
      description: 'Load saved workspace layout',
      category: 'workspace',
      icon: 'folder-open',
      action: context.loadLayout,
    },
    {
      id: 'workspace:reset-layout',
      label: 'Reset Layout',
      description: 'Reset to default layout',
      category: 'workspace',
      icon: 'refresh-cw',
      action: context.resetLayout,
    },

    // View modes
    {
      id: 'workspace:toggle-fullscreen',
      label: 'Toggle Fullscreen',
      description: 'Enter/exit fullscreen mode',
      shortcut: '⌘+⌃+F',
      category: 'workspace',
      icon: 'maximize',
      action: context.toggleFullscreen,
    },
    {
      id: 'workspace:toggle-zen-mode',
      label: 'Toggle Zen Mode',
      description: 'Enter/exit zen mode',
      shortcut: '⌘+Shift+Z',
      category: 'workspace',
      icon: 'eye-off',
      action: context.toggleZenMode,
    },
    {
      id: 'workspace:maximize-pane',
      label: 'Maximize Pane',
      description: 'Maximize current pane',
      shortcut: '⌘+Shift+M',
      category: 'workspace',
      icon: 'maximize-2',
      action: context.maximizePane,
    },
    {
      id: 'workspace:restore-pane',
      label: 'Restore Pane',
      description: 'Restore pane size',
      category: 'workspace',
      icon: 'minimize-2',
      action: context.restorePane,
    },

    // Window management
    {
      id: 'workspace:new-window',
      label: 'Open in New Window',
      description: 'Open file in new window',
      shortcut: '⌘+Shift+N',
      category: 'workspace',
      icon: 'external-link',
      action: context.openInNewWindow,
    },
  ];
}
