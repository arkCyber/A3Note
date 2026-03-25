/**
 * Block Reference Extension
 * Implements Obsidian-style block references: ^block-id and [[note#^block-id]]
 */

import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { Range, StateField, StateEffect } from '@codemirror/state';
import { log } from '../utils/logger';

/**
 * Block ID widget for displaying block reference IDs
 */
class BlockIdWidget extends WidgetType {
  constructor(private blockId: string) {
    super();
  }

  eq(other: BlockIdWidget): boolean {
    return other.blockId === this.blockId;
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'cm-block-id';
    span.textContent = `^${this.blockId}`;
    span.setAttribute('data-block-id', this.blockId);
    span.title = 'Block reference ID';
    
    // Make it clickable to copy
    span.onclick = () => {
      navigator.clipboard.writeText(`^${this.blockId}`);
      span.classList.add('cm-block-id-copied');
      setTimeout(() => span.classList.remove('cm-block-id-copied'), 1000);
    };

    return span;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

/**
 * Block reference link widget
 */
class BlockRefLinkWidget extends WidgetType {
  constructor(
    private filePath: string,
    private blockId: string,
    private displayText?: string
  ) {
    super();
  }

  eq(other: BlockRefLinkWidget): boolean {
    return (
      other.filePath === this.filePath &&
      other.blockId === this.blockId &&
      other.displayText === this.displayText
    );
  }

  toDOM(): HTMLElement {
    const link = document.createElement('a');
    link.className = 'cm-block-ref-link';
    link.textContent = this.displayText || `${this.filePath}#^${this.blockId}`;
    link.href = '#';
    link.setAttribute('data-file', this.filePath);
    link.setAttribute('data-block-id', this.blockId);
    link.title = `Go to block ^${this.blockId} in ${this.filePath}`;

    link.onclick = (e) => {
      e.preventDefault();
      this.navigateToBlock();
    };

    return link;
  }

  private navigateToBlock(): void {
    const event = new CustomEvent('block-ref:navigate', {
      detail: {
        path: this.filePath,
        blockId: this.blockId,
      },
    });
    window.dispatchEvent(event);
  }

  ignoreEvent(): boolean {
    return false;
  }
}

/**
 * Parse block ID from line
 */
function parseBlockId(text: string): string | null {
  const match = text.match(/\s+\^([\w-]+)\s*$/);
  return match ? match[1] : null;
}

/**
 * Parse block reference link
 */
function parseBlockRefLink(text: string): {
  filePath: string;
  blockId: string;
  displayText?: string;
} | null {
  // [[file#^block-id]]
  // [[file#^block-id|display text]]
  const regex = /\[\[([^\]#|]+)#\^([\w-]+)(?:\|([^\]]+))?\]\]/;
  const match = text.match(regex);

  if (!match) {
    return null;
  }

  return {
    filePath: match[1].trim().endsWith('.md') ? match[1].trim() : `${match[1].trim()}.md`,
    blockId: match[2].trim(),
    displayText: match[3]?.trim(),
  };
}

/**
 * State effect to register block IDs
 */
export const registerBlockId = StateEffect.define<{ line: number; blockId: string }>();

/**
 * State field to track block IDs
 */
export const blockIdState = StateField.define<Map<number, string>>({
  create: () => new Map(),
  update(value, tr) {
    const newMap = new Map(value);
    
    for (const effect of tr.effects) {
      if (effect.is(registerBlockId)) {
        newMap.set(effect.value.line, effect.value.blockId);
      }
    }

    // Clean up if document changed
    if (tr.docChanged) {
      // This is simplified - in production, you'd want to track line changes
      // and update the map accordingly
    }

    return newMap;
  },
});

/**
 * Block reference extension
 */
export const blockRefExtension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const decorations: Range<Decoration>[] = [];
      const doc = view.state.doc;
      const effects: StateEffect<any>[] = [];

      for (const { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to; ) {
          const line = doc.lineAt(pos);
          const text = line.text;

          // Check for block ID definition (^block-id at end of line)
          const blockId = parseBlockId(text);
          if (blockId) {
            const blockIdStart = text.lastIndexOf(`^${blockId}`);
            const blockIdPos = line.from + blockIdStart;

            // Add widget for block ID
            decorations.push(
              Decoration.widget({
                widget: new BlockIdWidget(blockId),
                side: 1,
              }).range(line.to)
            );

            // Dim the ^block-id syntax
            decorations.push(
              Decoration.mark({
                class: 'cm-block-id-syntax',
              }).range(blockIdPos, line.to)
            );

            // Register block ID
            effects.push(
              registerBlockId.of({
                line: line.number - 1,
                blockId,
              })
            );
          }

          // Check for block reference links [[file#^block-id]]
          const blockRefMatch = text.match(/\[\[[^\]]+#\^[\w-]+(?:\|[^\]]+)?\]\]/g);
          if (blockRefMatch) {
            for (const match of blockRefMatch) {
              const refInfo = parseBlockRefLink(match);
              if (refInfo) {
                const matchStart = text.indexOf(match);
                const matchPos = line.from + matchStart;

                // Add link widget
                decorations.push(
                  Decoration.widget({
                    widget: new BlockRefLinkWidget(
                      refInfo.filePath,
                      refInfo.blockId,
                      refInfo.displayText
                    ),
                    side: 1,
                  }).range(matchPos + match.length)
                );

                // Dim the original syntax
                decorations.push(
                  Decoration.mark({
                    class: 'cm-block-ref-syntax',
                  }).range(matchPos, matchPos + match.length)
                );
              }
            }
          }

          pos = line.to + 1;
        }
      }

      // Dispatch effects if any
      if (effects.length > 0) {
        view.dispatch({ effects });
      }

      return Decoration.set(decorations, true);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

/**
 * Block reference theme
 */
export const blockRefTheme = EditorView.baseTheme({
  '.cm-block-id': {
    display: 'inline-block',
    marginLeft: '0.5em',
    padding: '0.1em 0.4em',
    fontSize: '0.85em',
    fontFamily: 'monospace',
    color: 'var(--text-faint)',
    backgroundColor: 'var(--background-modifier-border)',
    borderRadius: '3px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'var(--background-modifier-border-hover)',
      color: 'var(--text-normal)',
    },
  },
  '.cm-block-id-copied': {
    backgroundColor: 'var(--interactive-accent)',
    color: 'var(--text-on-accent)',
  },
  '.cm-block-id-syntax': {
    opacity: '0.3',
  },
  '.cm-block-ref-link': {
    color: 'var(--link-color)',
    textDecoration: 'none',
    cursor: 'pointer',
    borderBottom: '1px solid var(--link-color)',
    '&:hover': {
      color: 'var(--link-color-hover)',
      borderBottomColor: 'var(--link-color-hover)',
    },
  },
  '.cm-block-ref-syntax': {
    display: 'none',
  },
});

/**
 * Generate a random block ID
 */
export function generateBlockId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Insert block ID at cursor position
 */
export function insertBlockId(view: EditorView): void {
  const blockId = generateBlockId();
  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);

  // Insert at end of line
  view.dispatch({
    changes: {
      from: line.to,
      insert: ` ^${blockId}`,
    },
  });

  log.info('BlockRef', `Inserted block ID: ^${blockId}`);
}
