import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Range } from "@codemirror/state";
import { log } from "../utils/logger";

// Callout types configuration
const calloutTypes: Record<string, { icon: string; color: string; bgColor: string }> = {
  note: { icon: "📝", color: "#4fc3f7", bgColor: "rgba(79, 195, 247, 0.1)" },
  abstract: { icon: "📋", color: "#00bcd4", bgColor: "rgba(0, 188, 212, 0.1)" },
  summary: { icon: "📋", color: "#00bcd4", bgColor: "rgba(0, 188, 212, 0.1)" },
  tldr: { icon: "📋", color: "#00bcd4", bgColor: "rgba(0, 188, 212, 0.1)" },
  info: { icon: "ℹ️", color: "#2196f3", bgColor: "rgba(33, 150, 243, 0.1)" },
  todo: { icon: "✅", color: "#2196f3", bgColor: "rgba(33, 150, 243, 0.1)" },
  tip: { icon: "💡", color: "#4caf50", bgColor: "rgba(76, 175, 80, 0.1)" },
  hint: { icon: "💡", color: "#4caf50", bgColor: "rgba(76, 175, 80, 0.1)" },
  important: { icon: "🔥", color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" },
  success: { icon: "✔️", color: "#4caf50", bgColor: "rgba(76, 175, 80, 0.1)" },
  check: { icon: "✔️", color: "#4caf50", bgColor: "rgba(76, 175, 80, 0.1)" },
  done: { icon: "✔️", color: "#4caf50", bgColor: "rgba(76, 175, 80, 0.1)" },
  question: { icon: "❓", color: "#ff9800", bgColor: "rgba(255, 152, 0, 0.1)" },
  help: { icon: "❓", color: "#ff9800", bgColor: "rgba(255, 152, 0, 0.1)" },
  faq: { icon: "❓", color: "#ff9800", bgColor: "rgba(255, 152, 0, 0.1)" },
  warning: { icon: "⚠️", color: "#ff9800", bgColor: "rgba(255, 152, 0, 0.1)" },
  caution: { icon: "⚠️", color: "#ff9800", bgColor: "rgba(255, 152, 0, 0.1)" },
  attention: { icon: "⚠️", color: "#ff9800", bgColor: "rgba(255, 152, 0, 0.1)" },
  failure: { icon: "❌", color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" },
  fail: { icon: "❌", color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" },
  missing: { icon: "❌", color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" },
  danger: { icon: "⚡", color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" },
  error: { icon: "⚡", color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" },
  bug: { icon: "🐛", color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" },
  example: { icon: "📌", color: "#9c27b0", bgColor: "rgba(156, 39, 176, 0.1)" },
  quote: { icon: "💬", color: "#9e9e9e", bgColor: "rgba(158, 158, 158, 0.1)" },
  cite: { icon: "💬", color: "#9e9e9e", bgColor: "rgba(158, 158, 158, 0.1)" },
};

interface CalloutInfo {
  type: string;
  title: string;
  startLine: number;
  endLine: number;
  foldable: boolean;
}

function parseCallout(doc: any, lineNum: number): CalloutInfo | null {
  const line = doc.line(lineNum);
  const text = line.text;

  // Match: > [!type] Title or > [!type]+ Title or > [!type]- Title
  const match = text.match(/^>\s*\[!(\w+)\]([+-])?\s*(.*)$/);
  
  if (!match) return null;

  const type = match[1].toLowerCase();
  const foldable = match[2] === '+' || match[2] === '-';
  const title = match[3] || capitalize(type);

  // Find the end of the callout block
  let endLine = lineNum;
  for (let i = lineNum + 1; i <= doc.lines; i++) {
    const nextLine = doc.line(i);
    if (!nextLine.text.startsWith('>')) {
      break;
    }
    endLine = i;
  }

  return {
    type,
    title,
    startLine: lineNum,
    endLine,
    foldable,
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const calloutExtension = ViewPlugin.fromClass(
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
      const processedLines = new Set<number>();

      for (const { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to;) {
          const line = doc.lineAt(pos);
          const lineNum = line.number;

          if (processedLines.has(lineNum)) {
            pos = line.to + 1;
            continue;
          }

          const callout = parseCallout(doc, lineNum);
          
          if (callout) {
            const config = calloutTypes[callout.type] || calloutTypes.note;

            // Mark all lines in the callout
            for (let i = callout.startLine; i <= callout.endLine; i++) {
              const calloutLine = doc.line(i);
              
              if (i === callout.startLine) {
                // First line - add callout header decoration
                decorations.push(
                  Decoration.line({
                    class: `cm-callout-line cm-callout-${callout.type}`,
                    attributes: {
                      "data-callout-type": callout.type,
                      "data-callout-icon": config.icon,
                      "data-callout-title": callout.title,
                      style: `border-left: 4px solid ${config.color}; background-color: ${config.bgColor};`
                    }
                  }).range(calloutLine.from)
                );
              } else {
                // Content lines
                decorations.push(
                  Decoration.line({
                    class: `cm-callout-content cm-callout-${callout.type}`,
                    attributes: {
                      style: `border-left: 4px solid ${config.color}; background-color: ${config.bgColor};`
                    }
                  }).range(calloutLine.from)
                );
              }

              // Dim the > markers
              const markerMatch = calloutLine.text.match(/^>\s*/);
              if (markerMatch) {
                decorations.push(
                  Decoration.mark({
                    class: "cm-callout-marker"
                  }).range(calloutLine.from, calloutLine.from + markerMatch[0].length)
                );
              }

              processedLines.add(i);
            }

            log.debug("Callout", `Rendered ${callout.type} callout from line ${callout.startLine} to ${callout.endLine}`);
            pos = doc.line(callout.endLine).to + 1;
          } else {
            pos = line.to + 1;
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

// Styles for callouts
export const calloutTheme = EditorView.baseTheme({
  ".cm-callout-line": {
    paddingLeft: "1em",
    paddingTop: "0.5em",
    paddingBottom: "0.25em",
    marginLeft: "0.25em",
    fontWeight: "600",
    position: "relative",
  },
  ".cm-callout-line::before": {
    content: "attr(data-callout-icon) ' ' attr(data-callout-title)",
    display: "block",
    marginBottom: "0.25em",
  },
  ".cm-callout-content": {
    paddingLeft: "1em",
    paddingTop: "0.25em",
    paddingBottom: "0.25em",
    marginLeft: "0.25em",
  },
  ".cm-callout-marker": {
    opacity: "0.3",
  },
  // Individual callout type styles
  ".cm-callout-note": {
    borderLeftColor: "#4fc3f7 !important",
  },
  ".cm-callout-warning": {
    borderLeftColor: "#ff9800 !important",
  },
  ".cm-callout-danger": {
    borderLeftColor: "#f44336 !important",
  },
  ".cm-callout-tip": {
    borderLeftColor: "#4caf50 !important",
  },
});
