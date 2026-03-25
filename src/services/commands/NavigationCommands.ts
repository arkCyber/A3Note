/**
 * Navigation Commands - Aerospace-grade navigation command definitions
 * Complete set of navigation commands for command palette
 */

import { Command } from './CommandRegistry';

export interface NavigationCommandContext {
  goToLine: () => void;
  goToFile: () => void;
  goToSymbol: () => void;
  goToDefinition: () => void;
  goToReferences: () => void;
  goBack: () => void;
  goForward: () => void;
  jumpToTop: () => void;
  jumpToBottom: () => void;
  jumpToMatchingBracket: () => void;
  nextHeading: () => void;
  previousHeading: () => void;
  nextLink: () => void;
  previousLink: () => void;
  followLink: () => void;
  openLinkInNewPane: () => void;
  navigateBack: () => void;
  navigateForward: () => void;
  quickSwitcher: () => void;
  recentFiles: () => void;
}

/**
 * Create navigation commands
 */
export function createNavigationCommands(context: NavigationCommandContext): Command[] {
  return [
    // Go to commands
    {
      id: 'navigate:go-to-line',
      label: 'Go to Line',
      description: 'Jump to specific line number',
      shortcut: '⌘+L',
      category: 'navigate',
      icon: 'hash',
      action: context.goToLine,
    },
    {
      id: 'navigate:go-to-file',
      label: 'Go to File',
      description: 'Quick file switcher',
      shortcut: '⌘+O',
      category: 'navigate',
      icon: 'file',
      action: context.goToFile,
    },
    {
      id: 'navigate:go-to-symbol',
      label: 'Go to Symbol',
      description: 'Jump to heading or symbol',
      shortcut: '⌘+Shift+O',
      category: 'navigate',
      icon: 'bookmark',
      action: context.goToSymbol,
    },
    {
      id: 'navigate:go-to-definition',
      label: 'Go to Definition',
      description: 'Jump to link definition',
      shortcut: 'F12',
      category: 'navigate',
      icon: 'arrow-right',
      action: context.goToDefinition,
    },
    {
      id: 'navigate:go-to-references',
      label: 'Go to References',
      description: 'Show all references',
      shortcut: 'Shift+F12',
      category: 'navigate',
      icon: 'link',
      action: context.goToReferences,
    },

    // History navigation
    {
      id: 'navigate:back',
      label: 'Navigate Back',
      description: 'Go to previous location',
      shortcut: '⌘+⌥+←',
      category: 'navigate',
      icon: 'arrow-left',
      action: context.goBack,
    },
    {
      id: 'navigate:forward',
      label: 'Navigate Forward',
      description: 'Go to next location',
      shortcut: '⌘+⌥+→',
      category: 'navigate',
      icon: 'arrow-right',
      action: context.goForward,
    },

    // Jump commands
    {
      id: 'navigate:jump-top',
      label: 'Jump to Top',
      description: 'Jump to beginning of file',
      shortcut: '⌘+Home',
      category: 'navigate',
      icon: 'arrow-up-to-line',
      action: context.jumpToTop,
    },
    {
      id: 'navigate:jump-bottom',
      label: 'Jump to Bottom',
      description: 'Jump to end of file',
      shortcut: '⌘+End',
      category: 'navigate',
      icon: 'arrow-down-to-line',
      action: context.jumpToBottom,
    },
    {
      id: 'navigate:jump-bracket',
      label: 'Jump to Matching Bracket',
      description: 'Jump to matching bracket',
      shortcut: '⌘+Shift+\\',
      category: 'navigate',
      icon: 'brackets',
      action: context.jumpToMatchingBracket,
    },

    // Heading navigation
    {
      id: 'navigate:next-heading',
      label: 'Next Heading',
      description: 'Jump to next heading',
      shortcut: '⌘+↓',
      category: 'navigate',
      icon: 'heading',
      action: context.nextHeading,
    },
    {
      id: 'navigate:previous-heading',
      label: 'Previous Heading',
      description: 'Jump to previous heading',
      shortcut: '⌘+↑',
      category: 'navigate',
      icon: 'heading',
      action: context.previousHeading,
    },

    // Link navigation
    {
      id: 'navigate:next-link',
      label: 'Next Link',
      description: 'Jump to next link',
      shortcut: '⌘+→',
      category: 'navigate',
      icon: 'link',
      action: context.nextLink,
    },
    {
      id: 'navigate:previous-link',
      label: 'Previous Link',
      description: 'Jump to previous link',
      shortcut: '⌘+←',
      category: 'navigate',
      icon: 'link',
      action: context.previousLink,
    },
    {
      id: 'navigate:follow-link',
      label: 'Follow Link',
      description: 'Open link under cursor',
      shortcut: '⌘+Click',
      category: 'navigate',
      icon: 'external-link',
      action: context.followLink,
    },
    {
      id: 'navigate:open-link-new-pane',
      label: 'Open Link in New Pane',
      description: 'Open link in new pane',
      shortcut: '⌘+Shift+Click',
      category: 'navigate',
      icon: 'external-link',
      action: context.openLinkInNewPane,
    },

    // Quick switcher
    {
      id: 'navigate:quick-switcher',
      label: 'Quick Switcher',
      description: 'Open quick switcher',
      shortcut: '⌘+P',
      category: 'navigate',
      icon: 'search',
      action: context.quickSwitcher,
    },
    {
      id: 'navigate:recent-files',
      label: 'Recent Files',
      description: 'Show recent files',
      shortcut: '⌘+Shift+P',
      category: 'navigate',
      icon: 'clock',
      action: context.recentFiles,
    },
  ];
}
