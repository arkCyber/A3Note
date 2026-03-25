/**
 * Embed/Transclusion Extension
 * Implements Obsidian-style embeds: ![[note]], ![[note#heading]], ![[note#^block-id]]
 */

import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { Range } from '@codemirror/state';
import { log } from '../utils/logger';

/**
 * Embed widget for rendering embedded content
 */
class EmbedWidget extends WidgetType {
  constructor(
    private filePath: string,
    private heading?: string,
    private blockId?: string,
    private onLoad?: (path: string, heading?: string, blockId?: string) => Promise<string>
  ) {
    super();
  }

  eq(other: EmbedWidget): boolean {
    return (
      other.filePath === this.filePath &&
      other.heading === this.heading &&
      other.blockId === this.blockId
    );
  }

  toDOM(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'cm-embed';
    container.setAttribute('data-embed-path', this.filePath);

    if (this.heading) {
      container.setAttribute('data-embed-heading', this.heading);
    }
    if (this.blockId) {
      container.setAttribute('data-embed-block', this.blockId);
    }

    const header = document.createElement('div');
    header.className = 'cm-embed-header';
    
    const title = document.createElement('span');
    title.className = 'cm-embed-title';
    title.textContent = this.getDisplayTitle();
    
    const link = document.createElement('a');
    link.className = 'cm-embed-link';
    link.textContent = '🔗';
    link.title = 'Open in new pane';
    link.href = '#';
    link.onclick = (e) => {
      e.preventDefault();
      this.openInNewPane();
    };

    header.appendChild(title);
    header.appendChild(link);
    container.appendChild(header);

    const content = document.createElement('div');
    content.className = 'cm-embed-content';
    content.textContent = 'Loading...';
    container.appendChild(content);

    this.loadContent(content);

    return container;
  }

  private getDisplayTitle(): string {
    let title = this.filePath.replace(/\.md$/, '');
    if (this.heading) {
      title += ` > ${this.heading}`;
    } else if (this.blockId) {
      title += ` > ^${this.blockId}`;
    }
    return title;
  }

  private async loadContent(contentEl: HTMLElement): Promise<void> {
    try {
      if (!this.onLoad) {
        contentEl.textContent = 'Content loading not configured';
        return;
      }

      const content = await this.onLoad(this.filePath, this.heading, this.blockId);
      
      if (content) {
        contentEl.innerHTML = '';
        const pre = document.createElement('div');
        pre.className = 'cm-embed-text';
        pre.textContent = content;
        contentEl.appendChild(pre);
      } else {
        contentEl.textContent = 'Content not found';
        contentEl.classList.add('cm-embed-error');
      }
    } catch (error) {
      log.error('EmbedWidget', 'Failed to load embed content:', error as Error);
      contentEl.textContent = 'Failed to load content';
      contentEl.classList.add('cm-embed-error');
    }
  }

  private openInNewPane(): void {
    // Trigger event to open file in new pane
    const event = new CustomEvent('embed:open', {
      detail: {
        path: this.filePath,
        heading: this.heading,
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
 * Parse embed syntax
 */
function parseEmbed(text: string): {
  filePath: string;
  heading?: string;
  blockId?: string;
} | null {
  // ![[file]]
  // ![[file#heading]]
  // ![[file#^block-id]]
  const embedRegex = /^!\[\[([^\]#]+)(?:#(\^)?([^\]]+))?\]\]$/;
  const match = text.match(embedRegex);

  if (!match) {
    return null;
  }

  const filePath = match[1].trim();
  const isBlockRef = match[2] === '^';
  const reference = match[3]?.trim();

  if (!filePath) {
    return null;
  }

  return {
    filePath: filePath.endsWith('.md') ? filePath : `${filePath}.md`,
    heading: !isBlockRef && reference ? reference : undefined,
    blockId: isBlockRef && reference ? reference : undefined,
  };
}

/**
 * Embed extension configuration
 */
export interface EmbedExtensionConfig {
  onLoadEmbed?: (path: string, heading?: string, blockId?: string) => Promise<string>;
}

/**
 * Create embed extension
 */
export function createEmbedExtension(config: EmbedExtensionConfig = {}) {
  return ViewPlugin.fromClass(
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

        for (const { from, to } of view.visibleRanges) {
          for (let pos = from; pos <= to; ) {
            const line = doc.lineAt(pos);
            const text = line.text.trim();

            // Check for embed syntax
            if (text.startsWith('![[') && text.endsWith(']]')) {
              const embedInfo = parseEmbed(text);

              if (embedInfo) {
                // Create embed widget
                decorations.push(
                  Decoration.widget({
                    widget: new EmbedWidget(
                      embedInfo.filePath,
                      embedInfo.heading,
                      embedInfo.blockId,
                      config.onLoadEmbed
                    ),
                    side: 1,
                    block: true,
                  }).range(line.to)
                );

                // Dim the original syntax
                decorations.push(
                  Decoration.mark({
                    class: 'cm-embed-syntax',
                  }).range(line.from, line.to)
                );
              }
            }

            pos = line.to + 1;
          }
        }

        return Decoration.set(decorations, true);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

/**
 * Embed theme
 */
export const embedTheme = EditorView.baseTheme({
  '.cm-embed': {
    margin: '1em 0',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: 'var(--background-secondary)',
  },
  '.cm-embed-header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5em 1em',
    backgroundColor: 'var(--background-modifier-border)',
    borderBottom: '1px solid var(--background-modifier-border)',
  },
  '.cm-embed-title': {
    fontSize: '0.9em',
    fontWeight: '500',
    color: 'var(--text-muted)',
  },
  '.cm-embed-link': {
    fontSize: '1em',
    textDecoration: 'none',
    cursor: 'pointer',
    opacity: '0.6',
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: '1',
    },
  },
  '.cm-embed-content': {
    padding: '1em',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  '.cm-embed-text': {
    fontSize: '0.95em',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  '.cm-embed-error': {
    color: 'var(--text-error)',
    fontStyle: 'italic',
  },
  '.cm-embed-syntax': {
    opacity: '0.3',
  },
});

/**
 * Default embed extension with no loader
 */
export const embedExtension = createEmbedExtension();
