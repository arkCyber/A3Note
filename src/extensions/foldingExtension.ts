import { foldGutter, foldKeymap } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

// Custom folding logic for Markdown
export const markdownFolding = EditorState.foldable.of((state, from, to) => {
  const tree = syntaxTree(state);
  let result: { from: number; to: number } | null = null;

  tree.iterate({
    from,
    to,
    enter: (node) => {
      // Fold headings
      if (node.name.match(/^ATXHeading[1-6]$/)) {
        const line = state.doc.lineAt(node.from);
        const level = parseInt(node.name.charAt(node.name.length - 1));
        
        // Find the end of this section (next heading of same or higher level)
        let endPos = state.doc.length;
        for (let pos = line.to + 1; pos < state.doc.length;) {
          const nextLine = state.doc.lineAt(pos);
          const nextText = nextLine.text;
          
          // Check if it's a heading
          const headingMatch = nextText.match(/^#{1,6}\s/);
          if (headingMatch) {
            const nextLevel = headingMatch[0].trim().length;
            if (nextLevel <= level) {
              endPos = nextLine.from - 1;
              break;
            }
          }
          
          pos = nextLine.to + 1;
        }

        if (endPos > line.to) {
          result = { from: line.to, to: endPos };
          return false;
        }
      }

      // Fold code blocks
      if (node.name === "FencedCode" || node.name === "CodeBlock") {
        const startLine = state.doc.lineAt(node.from);
        const endLine = state.doc.lineAt(node.to);
        
        if (endLine.number > startLine.number) {
          result = { from: startLine.to, to: node.to };
          return false;
        }
      }

      // Fold lists
      if (node.name === "BulletList" || node.name === "OrderedList") {
        const startLine = state.doc.lineAt(node.from);
        const endLine = state.doc.lineAt(node.to);
        
        if (endLine.number > startLine.number) {
          result = { from: startLine.to, to: node.to };
          return false;
        }
      }

      // Fold blockquotes
      if (node.name === "Blockquote") {
        const startLine = state.doc.lineAt(node.from);
        const endLine = state.doc.lineAt(node.to);
        
        if (endLine.number > startLine.number) {
          result = { from: startLine.to, to: node.to };
          return false;
        }
      }
    },
  });

  return result;
});

// Export the complete folding extension
export const foldingExtension = [
  foldGutter({
    openText: "▼",
    closedText: "▶",
  }),
  markdownFolding,
];

export const foldingKeymap = foldKeymap;
