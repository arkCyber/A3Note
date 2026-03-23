import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { Range } from "@codemirror/state";
import { log } from "../utils/logger";

/**
 * Footnote reference widget
 */
class FootnoteRefWidget extends WidgetType {
  constructor(private id: string, private num: number) {
    super();
  }

  eq(other: FootnoteRefWidget) {
    return other.id === this.id && other.num === this.num;
  }

  toDOM() {
    const sup = document.createElement("sup");
    sup.className = "cm-footnote-ref";
    sup.textContent = `[${this.num}]`;
    sup.title = `Footnote ${this.num}`;
    return sup;
  }

  ignoreEvent() {
    return false;
  }
}

/**
 * Parse footnotes from document
 */
function parseFootnotes(doc: any): Map<string, { num: number; content: string; line: number }> {
  const footnotes = new Map();
  let num = 1;

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const text = line.text;

    // Match footnote definition: [^id]: content
    const match = text.match(/^\[\^([^\]]+)\]:\s*(.+)$/);
    if (match) {
      const id = match[1];
      const content = match[2];
      
      if (!footnotes.has(id)) {
        footnotes.set(id, { num, content, line: i });
        num++;
      }
    }
  }

  return footnotes;
}

/**
 * Footnote extension
 */
export const footnoteExtension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    footnotes: Map<string, { num: number; content: string; line: number }>;

    constructor(view: EditorView) {
      this.footnotes = parseFootnotes(view.state.doc);
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.footnotes = parseFootnotes(update.view.state.doc);
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const decorations: Range<Decoration>[] = [];
      const doc = view.state.doc;
      const text = doc.toString();

      // Find footnote references: [^id]
      const refRegex = /\[\^([^\]]+)\]/g;
      let match;

      for (const { from, to } of view.visibleRanges) {
        const visibleText = doc.sliceString(from, to);
        const offset = from;

        refRegex.lastIndex = 0;
        while ((match = refRegex.exec(visibleText)) !== null) {
          const matchStart = offset + match.index;
          const matchEnd = matchStart + match[0].length;
          const id = match[1];

          // Check if this is a reference (not a definition)
          const line = doc.lineAt(matchStart);
          if (!line.text.match(/^\[\^[^\]]+\]:/)) {
            // It's a reference
            const footnote = this.footnotes.get(id);
            
            if (footnote) {
              // Add widget for the reference
              decorations.push(
                Decoration.widget({
                  widget: new FootnoteRefWidget(id, footnote.num),
                  side: 1,
                }).range(matchEnd)
              );

              // Dim the original syntax
              decorations.push(
                Decoration.mark({
                  class: "cm-footnote-marker"
                }).range(matchStart, matchEnd)
              );
            }
          } else {
            // It's a definition - style it
            decorations.push(
              Decoration.line({
                class: "cm-footnote-def"
              }).range(line.from)
            );

            // Dim the [^id]: part
            const defMatch = line.text.match(/^\[\^[^\]]+\]:/);
            if (defMatch) {
              decorations.push(
                Decoration.mark({
                  class: "cm-footnote-def-marker"
                }).range(line.from, line.from + defMatch[0].length)
              );
            }
          }
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
 * Footnote theme
 */
export const footnoteTheme = EditorView.baseTheme({
  ".cm-footnote-ref": {
    color: "#4fc3f7",
    cursor: "pointer",
    fontSize: "0.8em",
    verticalAlign: "super",
    fontWeight: "600",
  },
  ".cm-footnote-ref:hover": {
    textDecoration: "underline",
  },
  ".cm-footnote-marker": {
    opacity: "0.3",
  },
  ".cm-footnote-def": {
    backgroundColor: "rgba(79, 195, 247, 0.05)",
    borderLeft: "3px solid #4fc3f7",
    paddingLeft: "0.5em",
    marginLeft: "0.25em",
  },
  ".cm-footnote-def-marker": {
    color: "#4fc3f7",
    fontWeight: "600",
  },
});

/**
 * Insert footnote at cursor
 */
export function insertFootnote(view: EditorView): void {
  const doc = view.state.doc;
  const footnotes = parseFootnotes(doc);
  const nextNum = footnotes.size + 1;
  const id = nextNum.toString();

  const cursor = view.state.selection.main.head;
  const ref = `[^${id}]`;
  const def = `\n\n[^${id}]: `;

  // Insert reference at cursor
  view.dispatch({
    changes: [
      { from: cursor, insert: ref },
      { from: doc.length, insert: def }
    ],
    selection: { anchor: doc.length + def.length }
  });

  log.info("Footnote", `Inserted footnote ${id}`);
}
