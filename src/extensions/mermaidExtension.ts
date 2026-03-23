import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { Range } from "@codemirror/state";
import mermaid from "mermaid";
import { log } from "../utils/logger";

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "strict",
  fontFamily: "Inter, sans-serif",
});

/**
 * Mermaid diagram widget
 */
class MermaidWidget extends WidgetType {
  private static counter = 0;
  private id: string;

  constructor(private code: string) {
    super();
    this.id = `mermaid-${MermaidWidget.counter++}`;
  }

  eq(other: MermaidWidget) {
    return other.code === this.code;
  }

  toDOM() {
    const container = document.createElement("div");
    container.className = "cm-mermaid-container";
    
    const pre = document.createElement("pre");
    pre.className = "mermaid";
    pre.textContent = this.code;
    pre.id = this.id;
    
    container.appendChild(pre);

    // Render the diagram
    setTimeout(() => {
      try {
        mermaid.run({ nodes: [pre] }).catch((error) => {
          log.error("MermaidExtension", "Failed to render diagram:", error);
          pre.textContent = `[Mermaid Error]\n${this.code}`;
          pre.style.color = "#f44336";
        });
      } catch (error) {
        log.error("MermaidExtension", "Failed to render diagram:", error as Error);
        pre.textContent = `[Mermaid Error]\n${this.code}`;
        pre.style.color = "#f44336";
      }
    }, 100);

    return container;
  }

  ignoreEvent() {
    return false;
  }
}

/**
 * Mermaid extension
 */
export const mermaidExtension = ViewPlugin.fromClass(
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

      // Match mermaid code blocks: ```mermaid\n...\n```
      const mermaidRegex = /```mermaid\n([\s\S]+?)\n```/g;
      let match;

      while ((match = mermaidRegex.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        const code = match[1];

        // Check if in visible range
        let inRange = false;
        for (const { from, to } of view.visibleRanges) {
          if (matchStart >= from && matchEnd <= to) {
            inRange = true;
            break;
          }
        }

        if (inRange) {
          // Add widget
          decorations.push(
            Decoration.widget({
              widget: new MermaidWidget(code),
              side: 1,
              block: true,
            }).range(matchEnd)
          );

          // Dim the code block markers
          const startLine = doc.lineAt(matchStart);
          const endLine = doc.lineAt(matchEnd);
          
          decorations.push(
            Decoration.mark({
              class: "cm-mermaid-marker"
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
 * Mermaid theme
 */
export const mermaidTheme = EditorView.baseTheme({
  ".cm-mermaid-container": {
    margin: "1em 0",
    padding: "1em",
    backgroundColor: "rgba(45, 45, 45, 0.5)",
    borderRadius: "8px",
    border: "1px solid #3a3a3a",
  },
  ".cm-mermaid-container .mermaid": {
    backgroundColor: "transparent",
    textAlign: "center",
  },
  ".cm-mermaid-container svg": {
    maxWidth: "100%",
    height: "auto",
  },
  ".cm-mermaid-marker": {
    opacity: "0.3",
  },
});

/**
 * Insert Mermaid diagram template
 */
export function insertMermaidDiagram(view: EditorView, type: string = "flowchart"): void {
  const cursor = view.state.selection.main.head;
  
  const templates: Record<string, string> = {
    flowchart: `\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\``,
    sequence: `\`\`\`mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B->>A: Hello Alice!
\`\`\``,
    gantt: `\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Task 1           :a1, 2024-01-01, 30d
    Task 2           :after a1, 20d
\`\`\``,
    pie: `\`\`\`mermaid
pie title Distribution
    "Category A" : 45
    "Category B" : 30
    "Category C" : 25
\`\`\``,
  };

  const template = templates[type] || templates.flowchart;

  view.dispatch({
    changes: { from: cursor, insert: `\n${template}\n` },
    selection: { anchor: cursor + template.length + 2 }
  });

  log.info("MermaidExtension", `Inserted ${type} diagram`);
}
