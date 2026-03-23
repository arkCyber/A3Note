import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { log } from "../utils/logger";

/**
 * Table enhancement extension
 * Provides advanced table editing features
 */

/**
 * Detect if cursor is in a table
 */
function isInTable(view: EditorView): { inTable: boolean; line: number; col: number } {
  const cursor = view.state.selection.main.head;
  const line = view.state.doc.lineAt(cursor);
  const text = line.text;

  // Check if line contains table syntax
  if (text.includes("|")) {
    const beforeCursor = text.slice(0, cursor - line.from);
    const col = beforeCursor.split("|").length - 1;
    return { inTable: true, line: line.number, col };
  }

  return { inTable: false, line: 0, col: 0 };
}

/**
 * Parse table structure
 */
function parseTable(view: EditorView, lineNum: number): {
  startLine: number;
  endLine: number;
  rows: string[][];
  alignments: string[];
} | null {
  const doc = view.state.doc;
  let startLine = lineNum;
  let endLine = lineNum;

  // Find table start
  for (let i = lineNum; i >= 1; i--) {
    const line = doc.line(i);
    if (!line.text.includes("|")) {
      startLine = i + 1;
      break;
    }
    if (i === 1) startLine = 1;
  }

  // Find table end
  for (let i = lineNum; i <= doc.lines; i++) {
    const line = doc.line(i);
    if (!line.text.includes("|")) {
      endLine = i - 1;
      break;
    }
    if (i === doc.lines) endLine = i;
  }

  // Parse rows
  const rows: string[][] = [];
  const alignments: string[] = [];

  for (let i = startLine; i <= endLine; i++) {
    const line = doc.line(i);
    const text = line.text.trim();
    
    // Check if it's a separator line
    if (text.match(/^\|?[\s:-]+\|/)) {
      // Parse alignments
      const parts = text.split("|").filter(p => p.trim());
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.startsWith(":") && trimmed.endsWith(":")) {
          alignments.push("center");
        } else if (trimmed.endsWith(":")) {
          alignments.push("right");
        } else {
          alignments.push("left");
        }
      });
    } else {
      // Parse data row
      const cells = text.split("|").map(c => c.trim()).filter(c => c !== "");
      rows.push(cells);
    }
  }

  return { startLine, endLine, rows, alignments };
}

/**
 * Format table with proper alignment
 */
function formatTable(rows: string[][], alignments: string[]): string {
  if (rows.length === 0) return "";

  // Calculate column widths
  const colWidths: number[] = [];
  const numCols = Math.max(...rows.map(r => r.length));

  for (let col = 0; col < numCols; col++) {
    let maxWidth = 3; // Minimum width
    for (const row of rows) {
      if (row[col]) {
        maxWidth = Math.max(maxWidth, row[col].length);
      }
    }
    colWidths.push(maxWidth);
  }

  // Format rows
  const formatted: string[] = [];

  rows.forEach((row, idx) => {
    const cells = row.map((cell, col) => {
      const width = colWidths[col] || 3;
      const align = alignments[col] || "left";
      
      if (align === "center") {
        const padding = width - cell.length;
        const left = Math.floor(padding / 2);
        const right = padding - left;
        return " ".repeat(left) + cell + " ".repeat(right);
      } else if (align === "right") {
        return cell.padStart(width);
      } else {
        return cell.padEnd(width);
      }
    });

    formatted.push("| " + cells.join(" | ") + " |");

    // Add separator after header
    if (idx === 0) {
      const separator = colWidths.map((width, col) => {
        const align = alignments[col] || "left";
        if (align === "center") {
          return ":" + "-".repeat(width - 2) + ":";
        } else if (align === "right") {
          return "-".repeat(width - 1) + ":";
        } else {
          return "-".repeat(width);
        }
      });
      formatted.push("| " + separator.join(" | ") + " |");
    }
  });

  return formatted.join("\n");
}

/**
 * Navigate to next cell (Tab)
 */
function navigateNextCell(view: EditorView): boolean {
  const { inTable, line, col } = isInTable(view);
  if (!inTable) return false;

  const lineText = view.state.doc.line(line).text;
  const pipes = [...lineText.matchAll(/\|/g)];
  
  if (col < pipes.length - 1) {
    // Move to next cell in same row
    const nextPipe = pipes[col + 1];
    if (nextPipe && nextPipe.index !== undefined) {
      const newPos = view.state.doc.line(line).from + nextPipe.index + 2;
      view.dispatch({ selection: { anchor: newPos } });
      return true;
    }
  } else {
    // Move to first cell of next row
    if (line < view.state.doc.lines) {
      const nextLine = view.state.doc.line(line + 1);
      if (nextLine.text.includes("|")) {
        const firstPipe = nextLine.text.indexOf("|");
        const newPos = nextLine.from + firstPipe + 2;
        view.dispatch({ selection: { anchor: newPos } });
        return true;
      }
    }
  }

  return false;
}

/**
 * Navigate to previous cell (Shift+Tab)
 */
function navigatePrevCell(view: EditorView): boolean {
  const { inTable, line, col } = isInTable(view);
  if (!inTable) return false;

  const lineText = view.state.doc.line(line).text;
  const pipes = [...lineText.matchAll(/\|/g)];
  
  if (col > 1) {
    // Move to previous cell in same row
    const prevPipe = pipes[col - 1];
    if (prevPipe && prevPipe.index !== undefined) {
      const newPos = view.state.doc.line(line).from + prevPipe.index + 2;
      view.dispatch({ selection: { anchor: newPos } });
      return true;
    }
  } else {
    // Move to last cell of previous row
    if (line > 1) {
      const prevLine = view.state.doc.line(line - 1);
      if (prevLine.text.includes("|")) {
        const lastPipe = prevLine.text.lastIndexOf("|");
        const newPos = prevLine.from + lastPipe - 1;
        view.dispatch({ selection: { anchor: newPos } });
        return true;
      }
    }
  }

  return false;
}

/**
 * Format current table
 */
export function formatCurrentTable(view: EditorView): boolean {
  const cursor = view.state.selection.main.head;
  const line = view.state.doc.lineAt(cursor);
  
  const table = parseTable(view, line.number);
  if (!table) return false;

  const formatted = formatTable(table.rows, table.alignments);
  const startLine = view.state.doc.line(table.startLine);
  const endLine = view.state.doc.line(table.endLine);

  view.dispatch({
    changes: {
      from: startLine.from,
      to: endLine.to,
      insert: formatted,
    },
  });

  log.info("TableExtension", "Table formatted");
  return true;
}

/**
 * Insert table template
 */
export function insertTable(view: EditorView, rows: number = 3, cols: number = 3): void {
  const header = "| " + Array(cols).fill("Header").join(" | ") + " |";
  const separator = "| " + Array(cols).fill("---").join(" | ") + " |";
  const dataRow = "| " + Array(cols).fill("Cell").join(" | ") + " |";
  const dataRows = Array(rows - 1).fill(dataRow).join("\n");

  const table = `${header}\n${separator}\n${dataRows}`;
  
  const cursor = view.state.selection.main.head;
  view.dispatch({
    changes: { from: cursor, insert: `\n${table}\n` },
    selection: { anchor: cursor + table.length + 2 },
  });

  log.info("TableExtension", `Inserted ${rows}x${cols} table`);
}

/**
 * Table extension with keybindings
 */
export const tableExtension = keymap.of([
  {
    key: "Tab",
    run: navigateNextCell,
  },
  {
    key: "Shift-Tab",
    run: navigatePrevCell,
  },
  {
    key: "Mod-Shift-f",
    run: formatCurrentTable,
  },
]);

/**
 * Table theme
 */
export const tableTheme = EditorView.baseTheme({
  ".cm-line:has(> span:contains('|'))": {
    fontFamily: "'Fira Code', 'Consolas', monospace",
  },
});
