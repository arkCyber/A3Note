/**
 * Callouts Extension - Obsidian Compatible
 * Aerospace-grade callout/admonition support
 */

import { ViewPlugin, Decoration, DecorationSet, EditorView, ViewUpdate } from '@codemirror/view';
import { Range } from '@codemirror/state';

/**
 * Callout types with their icons and colors
 */
const CALLOUT_TYPES: Record<string, { icon: string; color: string }> = {
  note: { icon: '📝', color: '#3b82f6' },
  abstract: { icon: '📄', color: '#06b6d4' },
  summary: { icon: '📋', color: '#06b6d4' },
  tldr: { icon: '📋', color: '#06b6d4' },
  info: { icon: 'ℹ️', color: '#3b82f6' },
  todo: { icon: '✅', color: '#3b82f6' },
  tip: { icon: '💡', color: '#06b6d4' },
  hint: { icon: '💡', color: '#06b6d4' },
  important: { icon: '🔥', color: '#06b6d4' },
  success: { icon: '✔️', color: '#10b981' },
  check: { icon: '✔️', color: '#10b981' },
  done: { icon: '✔️', color: '#10b981' },
  question: { icon: '❓', color: '#a855f7' },
  help: { icon: '❓', color: '#a855f7' },
  faq: { icon: '❓', color: '#a855f7' },
  warning: { icon: '⚠️', color: '#f59e0b' },
  caution: { icon: '⚠️', color: '#f59e0b' },
  attention: { icon: '⚠️', color: '#f59e0b' },
  failure: { icon: '❌', color: '#ef4444' },
  fail: { icon: '❌', color: '#ef4444' },
  missing: { icon: '❌', color: '#ef4444' },
  danger: { icon: '⚡', color: '#ef4444' },
  error: { icon: '⚡', color: '#ef4444' },
  bug: { icon: '🐛', color: '#ef4444' },
  example: { icon: '📚', color: '#a855f7' },
  quote: { icon: '💬', color: '#64748b' },
  cite: { icon: '💬', color: '#64748b' },
};

/**
 * Parse callout syntax
 */
function parseCallout(line: string): {
  type: string;
  title?: string;
  foldable?: boolean;
  defaultFolded?: boolean;
} | null {
  // Match: > [!type]+ Title or > [!type]- Title or > [!type] Title
  const match = line.match(/^>\s*\[!(\w+)\]([+-])?\s*(.*)?$/);
  if (!match) return null;

  const [, type, fold, title] = match;
  
  return {
    type: type.toLowerCase(),
    title: title?.trim() || type.charAt(0).toUpperCase() + type.slice(1),
    foldable: fold === '+' || fold === '-',
    defaultFolded: fold === '-',
  };
}

/**
 * Check if line is callout content
 */
function isCalloutContent(line: string): boolean {
  return line.startsWith('>') && !line.match(/^>\s*\[!/);
}

/**
 * Create callout widget
 */
function createCalloutWidget(
  type: string,
  title: string,
  content: string[],
  foldable: boolean,
  defaultFolded: boolean
): HTMLElement {
  const calloutInfo = CALLOUT_TYPES[type] || CALLOUT_TYPES.note;
  
  const container = document.createElement('div');
  container.className = 'callout';
  container.setAttribute('data-callout', type);
  container.style.borderLeftColor = calloutInfo.color;

  // Header
  const header = document.createElement('div');
  header.className = 'callout-title';
  
  const icon = document.createElement('span');
  icon.className = 'callout-icon';
  icon.textContent = calloutInfo.icon;
  
  const titleEl = document.createElement('span');
  titleEl.className = 'callout-title-inner';
  titleEl.textContent = title;
  
  header.appendChild(icon);
  header.appendChild(titleEl);

  if (foldable) {
    const foldIcon = document.createElement('span');
    foldIcon.className = 'callout-fold';
    foldIcon.textContent = defaultFolded ? '▶' : '▼';
    header.appendChild(foldIcon);
    
    header.style.cursor = 'pointer';
    let folded = defaultFolded;
    
    header.addEventListener('click', () => {
      folded = !folded;
      foldIcon.textContent = folded ? '▶' : '▼';
      contentEl.style.display = folded ? 'none' : 'block';
    });
  }

  container.appendChild(header);

  // Content
  const contentEl = document.createElement('div');
  contentEl.className = 'callout-content';
  contentEl.style.display = defaultFolded ? 'none' : 'block';
  
  // Process content lines
  const processedContent = content
    .map(line => line.replace(/^>\s*/, ''))
    .join('\n');
  
  contentEl.innerHTML = markdownToHtml(processedContent);
  
  container.appendChild(contentEl);

  return container;
}

/**
 * Simple markdown to HTML converter for callout content
 */
function markdownToHtml(text: string): string {
  let html = text;
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

/**
 * Callouts view plugin
 */
export const calloutsExtension = ViewPlugin.fromClass(
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

      let i = 1;
      while (i <= doc.lines) {
        const line = doc.line(i);
        const lineText = line.text;

        const callout = parseCallout(lineText);
        if (callout) {
          // Find all content lines
          const contentLines: string[] = [];
          let j = i + 1;
          
          while (j <= doc.lines) {
            const contentLine = doc.line(j);
            const contentText = contentLine.text;
            
            if (isCalloutContent(contentText)) {
              contentLines.push(contentText);
              j++;
            } else {
              break;
            }
          }

          // Create widget for the entire callout
          const widget = createCalloutWidget(
            callout.type,
            callout.title || '',
            contentLines,
            callout.foldable || false,
            callout.defaultFolded || false
          );

          const deco = Decoration.widget({
            widget: {
              toDOM: () => widget,
            },
            side: 1,
          });

          decorations.push(deco.range(line.from));

          // Hide the raw callout syntax
          const hideFrom = line.from;
          const hideTo = j > i ? doc.line(j - 1).to : line.to;
          
          const hideDeco = Decoration.replace({
            widget: {
              toDOM: () => {
                const span = document.createElement('span');
                span.style.display = 'none';
                return span;
              },
            },
          });

          decorations.push(hideDeco.range(hideFrom, hideTo));

          i = j;
        } else {
          i++;
        }
      }

      return Decoration.set(decorations, true);
    }
  },
  {
    decorations: v => v.decorations,
  }
);

/**
 * Callout CSS styles
 */
export const calloutStyles = `
.callout {
  margin: 1em 0;
  padding: 0;
  border-left: 4px solid var(--callout-color, #3b82f6);
  border-radius: 4px;
  background: var(--background-secondary);
  overflow: hidden;
}

.callout-title {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.75em 1em;
  font-weight: 600;
  background: var(--background-secondary-alt);
  user-select: none;
}

.callout-icon {
  font-size: 1.2em;
  line-height: 1;
}

.callout-title-inner {
  flex: 1;
}

.callout-fold {
  font-size: 0.8em;
  opacity: 0.7;
  transition: transform 0.2s;
}

.callout-content {
  padding: 0.75em 1em;
  line-height: 1.6;
}

.callout-content code {
  padding: 0.2em 0.4em;
  background: var(--background-primary-alt);
  border-radius: 3px;
  font-family: var(--font-monospace);
  font-size: 0.9em;
}

.callout-content strong {
  font-weight: 600;
}

.callout-content em {
  font-style: italic;
}

.callout-content a {
  color: var(--link-color);
  text-decoration: none;
}

.callout-content a:hover {
  text-decoration: underline;
}

/* Callout type colors */
.callout[data-callout="note"],
.callout[data-callout="info"],
.callout[data-callout="todo"] {
  border-left-color: #3b82f6;
}

.callout[data-callout="abstract"],
.callout[data-callout="summary"],
.callout[data-callout="tldr"],
.callout[data-callout="tip"],
.callout[data-callout="hint"],
.callout[data-callout="important"] {
  border-left-color: #06b6d4;
}

.callout[data-callout="success"],
.callout[data-callout="check"],
.callout[data-callout="done"] {
  border-left-color: #10b981;
}

.callout[data-callout="question"],
.callout[data-callout="help"],
.callout[data-callout="faq"],
.callout[data-callout="example"] {
  border-left-color: #a855f7;
}

.callout[data-callout="warning"],
.callout[data-callout="caution"],
.callout[data-callout="attention"] {
  border-left-color: #f59e0b;
}

.callout[data-callout="failure"],
.callout[data-callout="fail"],
.callout[data-callout="missing"],
.callout[data-callout="danger"],
.callout[data-callout="error"],
.callout[data-callout="bug"] {
  border-left-color: #ef4444;
}

.callout[data-callout="quote"],
.callout[data-callout="cite"] {
  border-left-color: #64748b;
}
`;
