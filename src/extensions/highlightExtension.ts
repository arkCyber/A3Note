import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Range } from "@codemirror/state";

export const highlightExtension = ViewPlugin.fromClass(
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
      const text = doc.toString();

      // Match ==highlighted text==
      const highlightRegex = /==([^=]+)==/g;
      let match;

      for (const { from, to } of view.visibleRanges) {
        const visibleText = doc.sliceString(from, to);
        const offset = from;

        highlightRegex.lastIndex = 0;
        while ((match = highlightRegex.exec(visibleText)) !== null) {
          const matchStart = offset + match.index;
          const matchEnd = matchStart + match[0].length;
          const contentStart = matchStart + 2; // Skip ==
          const contentEnd = matchEnd - 2; // Skip ==

          // Highlight the content
          decorations.push(
            Decoration.mark({
              class: "cm-highlight-content"
            }).range(contentStart, contentEnd)
          );

          // Dim the markers
          decorations.push(
            Decoration.mark({
              class: "cm-highlight-marker"
            }).range(matchStart, contentStart)
          );
          decorations.push(
            Decoration.mark({
              class: "cm-highlight-marker"
            }).range(contentEnd, matchEnd)
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

export const highlightTheme = EditorView.baseTheme({
  ".cm-highlight-content": {
    backgroundColor: "rgba(255, 235, 59, 0.3)",
    color: "#fff",
    padding: "0 2px",
    borderRadius: "2px",
  },
  ".cm-highlight-marker": {
    opacity: "0.3",
  },
});
