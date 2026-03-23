// Keyboard Shortcuts Hook - Aerospace Grade
// Centralized keyboard shortcut management

import { useEffect, useCallback } from 'react';
import { log } from '../utils/logger';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !shortcut.ctrl || event.ctrlKey || event.metaKey;
      const shiftMatches = !shortcut.shift || event.shiftKey;
      const altMatches = !shortcut.alt || event.altKey;
      const metaMatches = !shortcut.meta || event.metaKey;

      return keyMatches && 
             (shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey) &&
             (shortcut.shift ? event.shiftKey : !event.shiftKey) &&
             (shortcut.alt ? event.altKey : !event.altKey);
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      log.debug('[KeyboardShortcuts] Triggered:', matchingShortcut.description);
      matchingShortcut.action();
    }
  }, [enabled, shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    
    log.info('[KeyboardShortcuts] Registered', shortcuts.length, 'shortcuts');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    shortcuts,
  };
}

/**
 * Default application shortcuts
 */
export const DEFAULT_SHORTCUTS = {
  // File operations
  NEW_FILE: { key: 'n', ctrl: true, description: 'New file' },
  SAVE_FILE: { key: 's', ctrl: true, description: 'Save file' },
  OPEN_FILE: { key: 'o', ctrl: true, description: 'Open file' },
  
  // Navigation
  TOGGLE_SIDEBAR: { key: 'b', ctrl: true, description: 'Toggle sidebar' },
  TOGGLE_PREVIEW: { key: 'e', ctrl: true, description: 'Toggle preview' },
  COMMAND_PALETTE: { key: 'p', ctrl: true, description: 'Command palette' },
  SEARCH: { key: 'f', ctrl: true, description: 'Search' },
  
  // Editing
  BOLD: { key: 'b', ctrl: true, description: 'Bold' },
  ITALIC: { key: 'i', ctrl: true, description: 'Italic' },
  LINK: { key: 'k', ctrl: true, description: 'Insert link' },
  CODE: { key: '`', ctrl: true, description: 'Inline code' },
  
  // AI Features
  RAG_CHAT: { key: 'r', ctrl: true, shift: true, description: 'RAG Chat' },
  TEMPLATE: { key: 't', ctrl: true, description: 'Insert template' },
  
  // Views
  GRAPH_VIEW: { key: 'g', ctrl: true, shift: true, description: 'Graph view' },
  OUTLINE: { key: 'o', ctrl: true, shift: true, description: 'Toggle outline' },
  BACKLINKS: { key: 'l', ctrl: true, shift: true, description: 'Toggle backlinks' },
  BOOKMARKS: { key: 'b', ctrl: true, shift: true, description: 'Toggle bookmarks' },
  TAGS: { key: 't', ctrl: true, shift: true, description: 'Toggle tags' },
  
  // Daily Notes
  TODAY_NOTE: { key: 'd', ctrl: true, description: 'Today\'s note' },
  PREV_DAY: { key: 'ArrowLeft', ctrl: true, alt: true, description: 'Previous day' },
  NEXT_DAY: { key: 'ArrowRight', ctrl: true, alt: true, description: 'Next day' },
  
  // Settings
  SETTINGS: { key: ',', ctrl: true, description: 'Settings' },
};

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl || shortcut.meta) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join('+');
}
