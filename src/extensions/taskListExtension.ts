import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import { log } from "../utils/logger";

class TaskCheckboxWidget extends WidgetType {
  constructor(private checked: boolean, private pos: number) {
    super();
  }

  eq(other: TaskCheckboxWidget) {
    return other.checked === this.checked && other.pos === this.pos;
  }

  toDOM(view: EditorView) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = this.checked;
    checkbox.className = "cm-task-checkbox";
    
    checkbox.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleTask(view);
    });

    return checkbox;
  }

  private toggleTask(view: EditorView) {
    const line = view.state.doc.lineAt(this.pos);
    const text = line.text;
    
    let newText: string;
    if (text.includes("- [ ]")) {
      newText = text.replace("- [ ]", "- [x]");
      log.info("TaskList", "Task marked as complete");
    } else if (text.includes("- [x]") || text.includes("- [X]")) {
      newText = text.replace(/- \[[xX]\]/, "- [ ]");
      log.info("TaskList", "Task marked as incomplete");
    } else {
      return;
    }

    view.dispatch({
      changes: { from: line.from, to: line.to, insert: newText }
    });
  }

  ignoreEvent() {
    return false;
  }
}

export const taskListExtension = ViewPlugin.fromClass(
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
        for (let pos = from; pos <= to;) {
          const line = doc.lineAt(pos);
          const text = line.text;

          // Match task list items: - [ ] or - [x]
          const taskMatch = text.match(/^(\s*)- \[([ xX])\]\s/);
          
          if (taskMatch) {
            const checked = taskMatch[2].toLowerCase() === 'x';
            const checkboxPos = line.from + taskMatch[1].length + 2; // Position of the checkbox

            // Add checkbox widget
            decorations.push(
              Decoration.widget({
                widget: new TaskCheckboxWidget(checked, line.from),
                side: 1,
              }).range(checkboxPos)
            );

            // Style the task text
            const textStart = line.from + taskMatch[0].length;
            if (checked && textStart < line.to) {
              decorations.push(
                Decoration.mark({
                  class: "cm-task-completed"
                }).range(textStart, line.to)
              );
            }

            // Dim the checkbox syntax
            decorations.push(
              Decoration.mark({
                class: "cm-task-marker"
              }).range(line.from + taskMatch[1].length, line.from + taskMatch[0].length)
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

// Styles to add to editor theme
export const taskListTheme = EditorView.baseTheme({
  ".cm-task-checkbox": {
    cursor: "pointer",
    marginRight: "0.5em",
    verticalAlign: "middle",
  },
  ".cm-task-completed": {
    textDecoration: "line-through",
    opacity: "0.6",
    color: "#9e9e9e",
  },
  ".cm-task-marker": {
    opacity: "0.3",
  },
});
