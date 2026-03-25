/**
 * Editor Commands - Aerospace-grade editor command definitions
 * Complete set of editing commands for command palette
 */

import { Command } from './CommandRegistry';

export interface EditorCommandContext {
  undo: () => void;
  redo: () => void;
  cut: () => void;
  copy: () => void;
  paste: () => void;
  selectAll: () => void;
  find: () => void;
  replace: () => void;
  findNext: () => void;
  findPrevious: () => void;
  toggleComment: () => void;
  duplicateLine: () => void;
  deleteLine: () => void;
  moveLineUp: () => void;
  moveLineDown: () => void;
  indentLine: () => void;
  outdentLine: () => void;
  insertLineAbove: () => void;
  insertLineBelow: () => void;
  joinLines: () => void;
  transformToUppercase: () => void;
  transformToLowercase: () => void;
  transformToTitleCase: () => void;
  sortLinesAscending: () => void;
  sortLinesDescending: () => void;
  trimTrailingWhitespace: () => void;
}

/**
 * Create editor commands
 */
export function createEditorCommands(context: EditorCommandContext): Command[] {
  return [
    // Basic editing
    {
      id: 'editor:undo',
      label: 'Undo',
      description: 'Undo last change',
      shortcut: '⌘+Z',
      category: 'edit',
      icon: 'undo',
      action: context.undo,
    },
    {
      id: 'editor:redo',
      label: 'Redo',
      description: 'Redo last undone change',
      shortcut: '⌘+Shift+Z',
      category: 'edit',
      icon: 'redo',
      action: context.redo,
    },
    {
      id: 'editor:cut',
      label: 'Cut',
      description: 'Cut selected text',
      shortcut: '⌘+X',
      category: 'edit',
      icon: 'scissors',
      action: context.cut,
    },
    {
      id: 'editor:copy',
      label: 'Copy',
      description: 'Copy selected text',
      shortcut: '⌘+C',
      category: 'edit',
      icon: 'copy',
      action: context.copy,
    },
    {
      id: 'editor:paste',
      label: 'Paste',
      description: 'Paste from clipboard',
      shortcut: '⌘+V',
      category: 'edit',
      icon: 'clipboard',
      action: context.paste,
    },
    {
      id: 'editor:select-all',
      label: 'Select All',
      description: 'Select all text',
      shortcut: '⌘+A',
      category: 'edit',
      icon: 'select-all',
      action: context.selectAll,
    },

    // Find and replace
    {
      id: 'editor:find',
      label: 'Find',
      description: 'Find text in current file',
      shortcut: '⌘+F',
      category: 'edit',
      icon: 'search',
      action: context.find,
    },
    {
      id: 'editor:replace',
      label: 'Replace',
      description: 'Find and replace text',
      shortcut: '⌘+H',
      category: 'edit',
      icon: 'replace',
      action: context.replace,
    },
    {
      id: 'editor:find-next',
      label: 'Find Next',
      description: 'Find next occurrence',
      shortcut: '⌘+G',
      category: 'edit',
      icon: 'arrow-down',
      action: context.findNext,
    },
    {
      id: 'editor:find-previous',
      label: 'Find Previous',
      description: 'Find previous occurrence',
      shortcut: '⌘+Shift+G',
      category: 'edit',
      icon: 'arrow-up',
      action: context.findPrevious,
    },

    // Line operations
    {
      id: 'editor:toggle-comment',
      label: 'Toggle Comment',
      description: 'Comment/uncomment line',
      shortcut: '⌘+/',
      category: 'edit',
      icon: 'message-square',
      action: context.toggleComment,
    },
    {
      id: 'editor:duplicate-line',
      label: 'Duplicate Line',
      description: 'Duplicate current line',
      shortcut: '⌘+Shift+D',
      category: 'edit',
      icon: 'copy',
      action: context.duplicateLine,
    },
    {
      id: 'editor:delete-line',
      label: 'Delete Line',
      description: 'Delete current line',
      shortcut: '⌘+Shift+K',
      category: 'edit',
      icon: 'trash',
      action: context.deleteLine,
    },
    {
      id: 'editor:move-line-up',
      label: 'Move Line Up',
      description: 'Move line up',
      shortcut: '⌥+↑',
      category: 'edit',
      icon: 'arrow-up',
      action: context.moveLineUp,
    },
    {
      id: 'editor:move-line-down',
      label: 'Move Line Down',
      description: 'Move line down',
      shortcut: '⌥+↓',
      category: 'edit',
      icon: 'arrow-down',
      action: context.moveLineDown,
    },
    {
      id: 'editor:indent-line',
      label: 'Indent Line',
      description: 'Indent current line',
      shortcut: '⌘+]',
      category: 'edit',
      icon: 'indent',
      action: context.indentLine,
    },
    {
      id: 'editor:outdent-line',
      label: 'Outdent Line',
      description: 'Outdent current line',
      shortcut: '⌘+[',
      category: 'edit',
      icon: 'outdent',
      action: context.outdentLine,
    },
    {
      id: 'editor:insert-line-above',
      label: 'Insert Line Above',
      description: 'Insert new line above',
      shortcut: '⌘+Shift+Enter',
      category: 'edit',
      icon: 'plus',
      action: context.insertLineAbove,
    },
    {
      id: 'editor:insert-line-below',
      label: 'Insert Line Below',
      description: 'Insert new line below',
      shortcut: '⌘+Enter',
      category: 'edit',
      icon: 'plus',
      action: context.insertLineBelow,
    },
    {
      id: 'editor:join-lines',
      label: 'Join Lines',
      description: 'Join current line with next',
      shortcut: '⌘+J',
      category: 'edit',
      icon: 'merge',
      action: context.joinLines,
    },

    // Text transformation
    {
      id: 'editor:transform-uppercase',
      label: 'Transform to Uppercase',
      description: 'Convert selection to uppercase',
      category: 'edit',
      icon: 'type',
      action: context.transformToUppercase,
    },
    {
      id: 'editor:transform-lowercase',
      label: 'Transform to Lowercase',
      description: 'Convert selection to lowercase',
      category: 'edit',
      icon: 'type',
      action: context.transformToLowercase,
    },
    {
      id: 'editor:transform-titlecase',
      label: 'Transform to Title Case',
      description: 'Convert selection to title case',
      category: 'edit',
      icon: 'type',
      action: context.transformToTitleCase,
    },
    {
      id: 'editor:sort-lines-asc',
      label: 'Sort Lines Ascending',
      description: 'Sort selected lines A-Z',
      category: 'edit',
      icon: 'arrow-up-az',
      action: context.sortLinesAscending,
    },
    {
      id: 'editor:sort-lines-desc',
      label: 'Sort Lines Descending',
      description: 'Sort selected lines Z-A',
      category: 'edit',
      icon: 'arrow-down-za',
      action: context.sortLinesDescending,
    },
    {
      id: 'editor:trim-whitespace',
      label: 'Trim Trailing Whitespace',
      description: 'Remove trailing whitespace',
      category: 'edit',
      icon: 'eraser',
      action: context.trimTrailingWhitespace,
    },
  ];
}
