/**
 * Editor API - Obsidian Compatible
 * Provides programmatic access to the editor
 */

import { EditorView } from '@codemirror/view';
import { EditorSelection, Text } from '@codemirror/state';

export interface EditorPosition {
  line: number;
  ch: number;
}

export interface EditorRange {
  from: EditorPosition;
  to: EditorPosition;
}

export interface EditorTransaction {
  changes?: any;
  selection?: EditorSelection;
  effects?: any[];
}

/**
 * Editor class compatible with Obsidian's Editor API
 */
export class Editor {
  constructor(private view: EditorView) {}

  /**
   * Get the current editor view
   */
  getView(): EditorView {
    return this.view;
  }

  /**
   * Get the entire content of the editor
   */
  getValue(): string {
    return this.view.state.doc.toString();
  }

  /**
   * Set the entire content of the editor
   */
  setValue(content: string): void {
    this.view.dispatch({
      changes: {
        from: 0,
        to: this.view.state.doc.length,
        insert: content,
      },
    });
  }

  /**
   * Get the currently selected text
   */
  getSelection(): string {
    const selection = this.view.state.selection.main;
    return this.view.state.sliceDoc(selection.from, selection.to);
  }

  /**
   * Replace the current selection with new text
   */
  replaceSelection(replacement: string): void {
    const selection = this.view.state.selection.main;
    this.view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: replacement,
      },
      selection: {
        anchor: selection.from + replacement.length,
      },
    });
  }

  /**
   * Get the cursor position
   */
  getCursor(type: 'from' | 'to' | 'head' | 'anchor' = 'head'): EditorPosition {
    const selection = this.view.state.selection.main;
    let pos: number;

    switch (type) {
      case 'from':
        pos = selection.from;
        break;
      case 'to':
        pos = selection.to;
        break;
      case 'anchor':
        pos = selection.anchor;
        break;
      case 'head':
      default:
        pos = selection.head;
        break;
    }

    return this.offsetToPos(pos);
  }

  /**
   * Set the cursor position
   */
  setCursor(pos: EditorPosition | number, ch?: number): void {
    let offset: number;

    if (typeof pos === 'number') {
      offset = this.posToOffset({ line: pos, ch: ch || 0 });
    } else {
      offset = this.posToOffset(pos);
    }

    this.view.dispatch({
      selection: { anchor: offset },
    });
  }

  /**
   * Get a specific line's content
   */
  getLine(line: number): string {
    const doc = this.view.state.doc;
    if (line < 0 || line >= doc.lines) {
      return '';
    }
    return doc.line(line + 1).text;
  }

  /**
   * Set a specific line's content
   */
  setLine(line: number, text: string): void {
    const doc = this.view.state.doc;
    if (line < 0 || line >= doc.lines) {
      return;
    }

    const lineObj = doc.line(line + 1);
    this.view.dispatch({
      changes: {
        from: lineObj.from,
        to: lineObj.to,
        insert: text,
      },
    });
  }

  /**
   * Get the number of lines in the document
   */
  lineCount(): number {
    return this.view.state.doc.lines;
  }

  /**
   * Get the last line number
   */
  lastLine(): number {
    return this.view.state.doc.lines - 1;
  }

  /**
   * Get text in a range
   */
  getRange(from: EditorPosition, to: EditorPosition): string {
    const fromOffset = this.posToOffset(from);
    const toOffset = this.posToOffset(to);
    return this.view.state.sliceDoc(fromOffset, toOffset);
  }

  /**
   * Replace text in a range
   */
  replaceRange(
    replacement: string,
    from: EditorPosition,
    to?: EditorPosition
  ): void {
    const fromOffset = this.posToOffset(from);
    const toOffset = to ? this.posToOffset(to) : fromOffset;

    this.view.dispatch({
      changes: {
        from: fromOffset,
        to: toOffset,
        insert: replacement,
      },
    });
  }

  /**
   * Get the word at a specific position
   */
  getWordAt(pos: EditorPosition): { from: EditorPosition; to: EditorPosition; word: string } | null {
    const offset = this.posToOffset(pos);
    const line = this.view.state.doc.lineAt(offset);
    const text = line.text;
    const ch = offset - line.from;

    // Find word boundaries
    let start = ch;
    let end = ch;

    const wordChars = /[\w\u4e00-\u9fa5]/;

    while (start > 0 && wordChars.test(text[start - 1])) {
      start--;
    }

    while (end < text.length && wordChars.test(text[end])) {
      end++;
    }

    if (start === end) {
      return null;
    }

    return {
      from: this.offsetToPos(line.from + start),
      to: this.offsetToPos(line.from + end),
      word: text.substring(start, end),
    };
  }

  /**
   * Get text from the start of the document to a position
   */
  getDoc(): Text {
    return this.view.state.doc;
  }

  /**
   * Focus the editor
   */
  focus(): void {
    this.view.focus();
  }

  /**
   * Blur the editor
   */
  blur(): void {
    (this.view.dom as HTMLElement).blur();
  }

  /**
   * Check if editor has focus
   */
  hasFocus(): boolean {
    return this.view.hasFocus;
  }

  /**
   * Scroll to a specific position
   */
  scrollIntoView(pos: EditorPosition, margin?: number): void {
    const offset = this.posToOffset(pos);
    this.view.dispatch({
      effects: EditorView.scrollIntoView(offset, {
        y: 'center',
        yMargin: margin || 0,
      }),
    });
  }

  /**
   * Execute a transaction
   */
  transaction(tx: EditorTransaction): void {
    this.view.dispatch(tx);
  }

  /**
   * Undo
   */
  undo(): void {
    // Note: Requires history extension to be loaded
    // This would need to dispatch an undo command from the history extension
    // Implementation depends on the history extension being configured
  }

  /**
   * Redo
   */
  redo(): void {
    // Note: Requires history extension to be loaded
    // This would need to dispatch a redo command from the history extension
    // Implementation depends on the history extension being configured
  }

  /**
   * Get scroll information
   */
  getScrollInfo(): { top: number; left: number; height: number; width: number } {
    const dom = this.view.scrollDOM;
    return {
      top: dom.scrollTop,
      left: dom.scrollLeft,
      height: dom.scrollHeight,
      width: dom.scrollWidth,
    };
  }

  /**
   * Scroll to specific coordinates
   */
  scrollTo(x?: number, y?: number): void {
    if (x !== undefined) {
      this.view.scrollDOM.scrollLeft = x;
    }
    if (y !== undefined) {
      this.view.scrollDOM.scrollTop = y;
    }
  }

  /**
   * Convert EditorPosition to document offset
   */
  posToOffset(pos: EditorPosition): number {
    const doc = this.view.state.doc;
    if (pos.line < 0 || pos.line >= doc.lines) {
      return 0;
    }

    const line = doc.line(pos.line + 1);
    return Math.min(line.from + pos.ch, line.to);
  }

  /**
   * Convert document offset to EditorPosition
   */
  offsetToPos(offset: number): EditorPosition {
    const doc = this.view.state.doc;
    const line = doc.lineAt(offset);
    return {
      line: line.number - 1,
      ch: offset - line.from,
    };
  }

  /**
   * List selections (for multi-cursor support)
   */
  listSelections(): EditorRange[] {
    return this.view.state.selection.ranges.map((range) => ({
      from: this.offsetToPos(range.from),
      to: this.offsetToPos(range.to),
    }));
  }

  /**
   * Set selections (for multi-cursor support)
   */
  setSelections(ranges: EditorRange[]): void {
    const selections = ranges.map((range) =>
      EditorSelection.range(
        this.posToOffset(range.from),
        this.posToOffset(range.to)
      )
    );

    this.view.dispatch({
      selection: EditorSelection.create(selections),
    });
  }

  /**
   * Get the current mode (source/preview)
   */
  getMode(): 'source' | 'preview' {
    // This would need to be tracked externally
    return 'source';
  }

  /**
   * Execute a command
   */
  exec(command: string): void {
    // Execute editor commands
    switch (command) {
      case 'goDocStart':
        this.setCursor({ line: 0, ch: 0 });
        break;
      case 'goDocEnd':
        const lastLine = this.lastLine();
        const lastLineText = this.getLine(lastLine);
        this.setCursor({ line: lastLine, ch: lastLineText.length });
        break;
      // Add more commands as needed
    }
  }
}
