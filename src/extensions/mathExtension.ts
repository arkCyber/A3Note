import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { Range } from "@codemirror/state";
import katex from "katex";
import { log } from "../utils/logger";

/**
 * Math widget for rendering LaTeX
 */
class MathWidget extends WidgetType {
  constructor(private latex: string, private display: boolean) {
    super();
  }

  eq(other: MathWidget) {
    return other.latex === this.latex && other.display === this.display;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = this.display ? "cm-math-display" : "cm-math-inline";
    
    try {
      katex.render(this.latex, span, {
        displayMode: this.display,
        throwOnError: false,
        errorColor: "#f44336",
        strict: false,
        trust: false,
      });
    } catch (error) {
      span.textContent = `[Math Error: ${this.latex}]`;
      span.style.color = "#f44336";
      log.error("MathExtension", "Failed to render LaTeX:", error as Error);
    }

    return span;
  }

  ignoreEvent() {
    return false;
  }
}

/**
 * Math extension for LaTeX rendering
 */
export const mathExtension = ViewPlugin.fromClass(
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
        const visibleText = doc.sliceString(from, to);
        const offset = from;

        // Match inline math: $...$
        const inlineRegex = /\$([^\$\n]+)\$/g;
        let match;

        while ((match = inlineRegex.exec(visibleText)) !== null) {
          const matchStart = offset + match.index;
          const matchEnd = matchStart + match[0].length;
          const latex = match[1];

          // Add widget
          decorations.push(
            Decoration.widget({
              widget: new MathWidget(latex, false),
              side: 1,
            }).range(matchEnd)
          );

          // Dim the original syntax
          decorations.push(
            Decoration.mark({
              class: "cm-math-marker"
            }).range(matchStart, matchEnd)
          );
        }

        // Match display math: $$...$$
        const displayRegex = /\$\$([\s\S]+?)\$\$/g;
        
        while ((match = displayRegex.exec(visibleText)) !== null) {
          const matchStart = offset + match.index;
          const matchEnd = matchStart + match[0].length;
          const latex = match[1].trim();

          // Add widget
          decorations.push(
            Decoration.widget({
              widget: new MathWidget(latex, true),
              side: 1,
              block: true,
            }).range(matchEnd)
          );

          // Dim the original syntax
          decorations.push(
            Decoration.mark({
              class: "cm-math-marker"
            }).range(matchStart, matchEnd)
          );
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
 * Math theme
 */
export const mathTheme = EditorView.baseTheme({
  ".cm-math-inline": {
    display: "inline-block",
    padding: "2px 4px",
    margin: "0 2px",
    backgroundColor: "rgba(79, 195, 247, 0.1)",
    borderRadius: "3px",
    verticalAlign: "middle",
  },
  ".cm-math-display": {
    display: "block",
    padding: "1em",
    margin: "1em 0",
    backgroundColor: "rgba(79, 195, 247, 0.05)",
    borderLeft: "3px solid #4fc3f7",
    borderRadius: "4px",
    overflow: "auto",
  },
  ".cm-math-marker": {
    opacity: "0.3",
  },
});

/**
 * Insert inline math at cursor
 */
export function insertInlineMath(view: EditorView): void {
  const cursor = view.state.selection.main.head;
  view.dispatch({
    changes: { from: cursor, insert: "$$" },
    selection: { anchor: cursor + 1 }
  });
  log.info("MathExtension", "Inserted inline math");
}

/**
 * Insert display math at cursor
 */
export function insertDisplayMath(view: EditorView): void {
  const cursor = view.state.selection.main.head;
  const insert = "\n$$\n\n$$\n";
  view.dispatch({
    changes: { from: cursor, insert },
    selection: { anchor: cursor + 4 }
  });
  log.info("MathExtension", "Inserted display math");
}
