import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { Range, StateField, StateEffect } from "@codemirror/state";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { log } from "../utils/logger";

/**
 * Live Preview Mode Extension
 * Renders Markdown inline while editing, similar to Obsidian's live preview
 */

// State effect to toggle live preview
export const toggleLivePreview = StateEffect.define<boolean>();

// State field to track live preview mode
export const livePreviewState = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(toggleLivePreview)) {
        return effect.value;
      }
    }
    return value;
  },
});

/**
 * Preview widget for rendering Markdown elements
 */
class PreviewWidget extends WidgetType {
  constructor(
    private markdown: string,
    private type: "heading" | "bold" | "italic" | "link" | "image" | "code" | "blockquote"
  ) {
    super();
  }

  eq(other: PreviewWidget) {
    return other.markdown === this.markdown && other.type === this.type;
  }

  toDOM() {
    const container = document.createElement("span");
    container.className = `cm-preview cm-preview-${this.type}`;

    try {
      // Parse and sanitize markdown
      const html = marked.parse(this.markdown, { async: false }) as string;
      const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ["strong", "em", "code", "a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"],
        ALLOWED_ATTR: ["href", "src", "alt", "title"],
      });

      container.innerHTML = clean;

      // Remove wrapping <p> tags for inline elements
      if (this.type !== "heading" && this.type !== "blockquote") {
        const p = container.querySelector("p");
        if (p && p.parentNode === container) {
          container.innerHTML = p.innerHTML;
        }
      }
    } catch (error) {
      container.textContent = this.markdown;
      log.error("LivePreview", "Failed to render markdown:", error as Error);
    }

    return container;
  }

  ignoreEvent() {
    return false;
  }
}

/**
 * Live preview extension
 */
export const livePreviewExtension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.state.field(livePreviewState) !== update.startState.field(livePreviewState)) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const decorations: Range<Decoration>[] = [];
      const doc = view.state.doc;
      const enabled = view.state.field(livePreviewState);

      if (!enabled) {
        return Decoration.set(decorations);
      }

      // Get cursor position to avoid rendering at cursor
      const cursor = view.state.selection.main.head;
      const cursorLine = doc.lineAt(cursor);

      for (const { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to;) {
          const line = doc.lineAt(pos);
          
          // Skip the line with cursor for better editing experience
          if (line.number === cursorLine.number) {
            pos = line.to + 1;
            continue;
          }

          const text = line.text;

          // Headings
          const headingMatch = text.match(/^(#{1,6})\s+(.+)$/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            const content = headingMatch[2];
            const markdown = `${"#".repeat(level)} ${content}`;

            decorations.push(
              Decoration.widget({
                widget: new PreviewWidget(markdown, "heading"),
                side: 1,
                block: true,
              }).range(line.to)
            );

            // Dim the original syntax
            decorations.push(
              Decoration.mark({
                class: "cm-preview-hidden"
              }).range(line.from, line.to)
            );

            pos = line.to + 1;
            continue;
          }

          // Blockquotes
          if (text.startsWith(">")) {
            const content = text.replace(/^>\s*/, "");
            decorations.push(
              Decoration.widget({
                widget: new PreviewWidget(`> ${content}`, "blockquote"),
                side: 1,
                block: true,
              }).range(line.to)
            );

            decorations.push(
              Decoration.mark({
                class: "cm-preview-hidden"
              }).range(line.from, line.to)
            );

            pos = line.to + 1;
            continue;
          }

          // Inline elements (bold, italic, code, links)
          const visibleText = doc.sliceString(line.from, line.to);
          
          // Bold **text**
          const boldRegex = /\*\*([^*]+)\*\*/g;
          let match;
          while ((match = boldRegex.exec(visibleText)) !== null) {
            const matchStart = line.from + match.index;
            const matchEnd = matchStart + match[0].length;

            decorations.push(
              Decoration.widget({
                widget: new PreviewWidget(`**${match[1]}**`, "bold"),
                side: 1,
              }).range(matchEnd)
            );

            decorations.push(
              Decoration.mark({
                class: "cm-preview-hidden"
              }).range(matchStart, matchEnd)
            );
          }

          // Italic *text*
          const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
          while ((match = italicRegex.exec(visibleText)) !== null) {
            const matchStart = line.from + match.index;
            const matchEnd = matchStart + match[0].length;

            decorations.push(
              Decoration.widget({
                widget: new PreviewWidget(`*${match[1]}*`, "italic"),
                side: 1,
              }).range(matchEnd)
            );

            decorations.push(
              Decoration.mark({
                class: "cm-preview-hidden"
              }).range(matchStart, matchEnd)
            );
          }

          // Inline code `text`
          const codeRegex = /`([^`]+)`/g;
          while ((match = codeRegex.exec(visibleText)) !== null) {
            const matchStart = line.from + match.index;
            const matchEnd = matchStart + match[0].length;

            decorations.push(
              Decoration.widget({
                widget: new PreviewWidget(`\`${match[1]}\``, "code"),
                side: 1,
              }).range(matchEnd)
            );

            decorations.push(
              Decoration.mark({
                class: "cm-preview-hidden"
              }).range(matchStart, matchEnd)
            );
          }

          // Links [text](url)
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          while ((match = linkRegex.exec(visibleText)) !== null) {
            const matchStart = line.from + match.index;
            const matchEnd = matchStart + match[0].length;

            decorations.push(
              Decoration.widget({
                widget: new PreviewWidget(`[${match[1]}](${match[2]})`, "link"),
                side: 1,
              }).range(matchEnd)
            );

            decorations.push(
              Decoration.mark({
                class: "cm-preview-hidden"
              }).range(matchStart, matchEnd)
            );
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

/**
 * Live preview theme
 */
export const livePreviewTheme = EditorView.baseTheme({
  ".cm-preview": {
    display: "inline-block",
    verticalAlign: "baseline",
  },
  ".cm-preview-hidden": {
    display: "none",
  },
  ".cm-preview-heading h1": {
    fontSize: "2em",
    fontWeight: "700",
    margin: "0.5em 0",
    color: "#e0e0e0",
  },
  ".cm-preview-heading h2": {
    fontSize: "1.75em",
    fontWeight: "700",
    margin: "0.5em 0",
    color: "#e0e0e0",
  },
  ".cm-preview-heading h3": {
    fontSize: "1.5em",
    fontWeight: "600",
    margin: "0.5em 0",
    color: "#d4d4d4",
  },
  ".cm-preview-heading h4": {
    fontSize: "1.25em",
    fontWeight: "600",
    margin: "0.5em 0",
    color: "#d4d4d4",
  },
  ".cm-preview-heading h5": {
    fontSize: "1.1em",
    fontWeight: "600",
    margin: "0.5em 0",
    color: "#c0c0c0",
  },
  ".cm-preview-heading h6": {
    fontSize: "1em",
    fontWeight: "600",
    margin: "0.5em 0",
    color: "#c0c0c0",
  },
  ".cm-preview-bold strong": {
    fontWeight: "700",
    color: "#e0e0e0",
  },
  ".cm-preview-italic em": {
    fontStyle: "italic",
    color: "#d4d4d4",
  },
  ".cm-preview-code code": {
    backgroundColor: "#2d2d2d",
    color: "#4fc3f7",
    padding: "2px 4px",
    borderRadius: "3px",
    fontFamily: "'Fira Code', 'Consolas', monospace",
  },
  ".cm-preview-link a": {
    color: "#4fc3f7",
    textDecoration: "none",
    borderBottom: "1px solid #4fc3f7",
  },
  ".cm-preview-link a:hover": {
    textDecoration: "underline",
  },
  ".cm-preview-blockquote blockquote": {
    borderLeft: "3px solid #4fc3f7",
    paddingLeft: "1em",
    marginLeft: "0",
    color: "#9e9e9e",
    fontStyle: "italic",
  },
});

/**
 * Toggle live preview mode
 */
export function toggleLivePreviewMode(view: EditorView): void {
  const current = view.state.field(livePreviewState);
  view.dispatch({
    effects: toggleLivePreview.of(!current),
  });
  log.info("LivePreview", `Live preview ${!current ? "enabled" : "disabled"}`);
}

/**
 * Check if live preview is enabled
 */
export function isLivePreviewEnabled(view: EditorView): boolean {
  return view.state.field(livePreviewState);
}
