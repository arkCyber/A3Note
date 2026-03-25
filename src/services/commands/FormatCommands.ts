/**
 * Format Commands - Aerospace-grade formatting command definitions
 * Complete set of Markdown formatting commands
 */

import { Command } from './CommandRegistry';

export interface FormatCommandContext {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleStrikethrough: () => void;
  toggleHighlight: () => void;
  toggleCode: () => void;
  toggleCodeBlock: () => void;
  insertLink: () => void;
  insertImage: () => void;
  insertTable: () => void;
  insertHeading1: () => void;
  insertHeading2: () => void;
  insertHeading3: () => void;
  insertHeading4: () => void;
  insertHeading5: () => void;
  insertHeading6: () => void;
  insertBulletList: () => void;
  insertNumberedList: () => void;
  insertTaskList: () => void;
  insertBlockquote: () => void;
  insertHorizontalRule: () => void;
  insertCallout: () => void;
  insertMathBlock: () => void;
  insertMathInline: () => void;
  insertFootnote: () => void;
  insertWikilink: () => void;
  insertEmbed: () => void;
  increaseHeadingLevel: () => void;
  decreaseHeadingLevel: () => void;
  toggleHeading: () => void;
  clearFormatting: () => void;
}

/**
 * Create format commands
 */
export function createFormatCommands(context: FormatCommandContext): Command[] {
  return [
    // Text formatting
    {
      id: 'format:bold',
      label: 'Toggle Bold',
      description: 'Make text bold',
      shortcut: '⌘+B',
      category: 'format',
      icon: 'bold',
      action: context.toggleBold,
    },
    {
      id: 'format:italic',
      label: 'Toggle Italic',
      description: 'Make text italic',
      shortcut: '⌘+I',
      category: 'format',
      icon: 'italic',
      action: context.toggleItalic,
    },
    {
      id: 'format:strikethrough',
      label: 'Toggle Strikethrough',
      description: 'Strike through text',
      shortcut: '⌘+Shift+X',
      category: 'format',
      icon: 'strikethrough',
      action: context.toggleStrikethrough,
    },
    {
      id: 'format:highlight',
      label: 'Toggle Highlight',
      description: 'Highlight text',
      shortcut: '⌘+Shift+H',
      category: 'format',
      icon: 'highlighter',
      action: context.toggleHighlight,
    },
    {
      id: 'format:code',
      label: 'Toggle Inline Code',
      description: 'Format as inline code',
      shortcut: '⌘+`',
      category: 'format',
      icon: 'code',
      action: context.toggleCode,
    },
    {
      id: 'format:code-block',
      label: 'Insert Code Block',
      description: 'Insert code block',
      shortcut: '⌘+Shift+`',
      category: 'format',
      icon: 'code-2',
      action: context.toggleCodeBlock,
    },

    // Headings
    {
      id: 'format:heading-1',
      label: 'Insert Heading 1',
      description: 'Insert level 1 heading',
      shortcut: '⌘+1',
      category: 'format',
      icon: 'heading-1',
      action: context.insertHeading1,
    },
    {
      id: 'format:heading-2',
      label: 'Insert Heading 2',
      description: 'Insert level 2 heading',
      shortcut: '⌘+2',
      category: 'format',
      icon: 'heading-2',
      action: context.insertHeading2,
    },
    {
      id: 'format:heading-3',
      label: 'Insert Heading 3',
      description: 'Insert level 3 heading',
      shortcut: '⌘+3',
      category: 'format',
      icon: 'heading-3',
      action: context.insertHeading3,
    },
    {
      id: 'format:heading-4',
      label: 'Insert Heading 4',
      description: 'Insert level 4 heading',
      shortcut: '⌘+4',
      category: 'format',
      icon: 'heading-4',
      action: context.insertHeading4,
    },
    {
      id: 'format:heading-5',
      label: 'Insert Heading 5',
      description: 'Insert level 5 heading',
      shortcut: '⌘+5',
      category: 'format',
      icon: 'heading-5',
      action: context.insertHeading5,
    },
    {
      id: 'format:heading-6',
      label: 'Insert Heading 6',
      description: 'Insert level 6 heading',
      shortcut: '⌘+6',
      category: 'format',
      icon: 'heading-6',
      action: context.insertHeading6,
    },
    {
      id: 'format:increase-heading',
      label: 'Increase Heading Level',
      description: 'Increase heading level',
      shortcut: '⌘+=',
      category: 'format',
      icon: 'chevron-up',
      action: context.increaseHeadingLevel,
    },
    {
      id: 'format:decrease-heading',
      label: 'Decrease Heading Level',
      description: 'Decrease heading level',
      shortcut: '⌘+-',
      category: 'format',
      icon: 'chevron-down',
      action: context.decreaseHeadingLevel,
    },
    {
      id: 'format:toggle-heading',
      label: 'Toggle Heading',
      description: 'Toggle heading format',
      category: 'format',
      icon: 'heading',
      action: context.toggleHeading,
    },

    // Lists
    {
      id: 'format:bullet-list',
      label: 'Insert Bullet List',
      description: 'Insert bullet list',
      shortcut: '⌘+Shift+8',
      category: 'format',
      icon: 'list',
      action: context.insertBulletList,
    },
    {
      id: 'format:numbered-list',
      label: 'Insert Numbered List',
      description: 'Insert numbered list',
      shortcut: '⌘+Shift+7',
      category: 'format',
      icon: 'list-ordered',
      action: context.insertNumberedList,
    },
    {
      id: 'format:task-list',
      label: 'Insert Task List',
      description: 'Insert task list',
      shortcut: '⌘+Shift+9',
      category: 'format',
      icon: 'check-square',
      action: context.insertTaskList,
    },

    // Links and embeds
    {
      id: 'format:link',
      label: 'Insert Link',
      description: 'Insert markdown link',
      shortcut: '⌘+K',
      category: 'format',
      icon: 'link',
      action: context.insertLink,
    },
    {
      id: 'format:wikilink',
      label: 'Insert Wikilink',
      description: 'Insert wikilink',
      shortcut: '⌘+Shift+K',
      category: 'format',
      icon: 'link-2',
      action: context.insertWikilink,
    },
    {
      id: 'format:image',
      label: 'Insert Image',
      description: 'Insert image',
      shortcut: '⌘+Shift+I',
      category: 'format',
      icon: 'image',
      action: context.insertImage,
    },
    {
      id: 'format:embed',
      label: 'Insert Embed',
      description: 'Embed file or content',
      shortcut: '⌘+Shift+E',
      category: 'format',
      icon: 'file-plus',
      action: context.insertEmbed,
    },

    // Blocks
    {
      id: 'format:blockquote',
      label: 'Insert Blockquote',
      description: 'Insert blockquote',
      shortcut: '⌘+Shift+.',
      category: 'format',
      icon: 'quote',
      action: context.insertBlockquote,
    },
    {
      id: 'format:horizontal-rule',
      label: 'Insert Horizontal Rule',
      description: 'Insert horizontal rule',
      category: 'format',
      icon: 'minus',
      action: context.insertHorizontalRule,
    },
    {
      id: 'format:table',
      label: 'Insert Table',
      description: 'Insert table',
      shortcut: '⌘+Shift+T',
      category: 'format',
      icon: 'table',
      action: context.insertTable,
    },
    {
      id: 'format:callout',
      label: 'Insert Callout',
      description: 'Insert callout block',
      shortcut: '⌘+Shift+C',
      category: 'format',
      icon: 'alert-circle',
      action: context.insertCallout,
    },

    // Math
    {
      id: 'format:math-inline',
      label: 'Insert Inline Math',
      description: 'Insert inline math',
      shortcut: '⌘+Shift+M',
      category: 'format',
      icon: 'sigma',
      action: context.insertMathInline,
    },
    {
      id: 'format:math-block',
      label: 'Insert Math Block',
      description: 'Insert math block',
      shortcut: '⌘+Shift+⌥+M',
      category: 'format',
      icon: 'sigma',
      action: context.insertMathBlock,
    },

    // Other
    {
      id: 'format:footnote',
      label: 'Insert Footnote',
      description: 'Insert footnote',
      category: 'format',
      icon: 'superscript',
      action: context.insertFootnote,
    },
    {
      id: 'format:clear',
      label: 'Clear Formatting',
      description: 'Remove all formatting',
      shortcut: '⌘+\\',
      category: 'format',
      icon: 'eraser',
      action: context.clearFormatting,
    },
  ];
}
