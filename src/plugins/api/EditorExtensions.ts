/**
 * Editor Extensions - Additional Obsidian-compatible methods
 * Aerospace-grade editor enhancements
 */

import { Editor, EditorPosition } from './Editor';

/**
 * Extended Editor functionality
 */
export class EditorExtensions {
  /**
   * Get selections (multiple cursors)
   */
  static listSelections(editor: Editor): Array<{ anchor: EditorPosition; head: EditorPosition }> {
    const view = editor.getView();
    const selections = view.state.selection.ranges;
    
    return selections.map(range => ({
      anchor: editor.offsetToPos(range.anchor),
      head: editor.offsetToPos(range.head),
    }));
  }

  /**
   * Set selections (multiple cursors)
   */
  static setSelections(
    editor: Editor,
    selections: Array<{ anchor: EditorPosition; head?: EditorPosition }>
  ): void {
    const view = editor.getView();
    const { EditorSelection } = require('@codemirror/state');
    
    const ranges = selections.map(sel => {
      const anchor = editor.posToOffset(sel.anchor);
      const head = sel.head ? editor.posToOffset(sel.head) : anchor;
      return EditorSelection.range(anchor, head);
    });

    view.dispatch({
      selection: EditorSelection.create(ranges),
    });
  }

  /**
   * Get line length
   */
  static getLineLength(editor: Editor, line: number): number {
    return editor.getLine(line).length;
  }

  /**
   * Insert text at cursor
   */
  static insert(editor: Editor, text: string): void {
    editor.replaceSelection(text);
  }

  /**
   * Get text before cursor
   */
  static getTextBefore(editor: Editor, pos: EditorPosition, length: number): string {
    const offset = editor.posToOffset(pos);
    const start = Math.max(0, offset - length);
    const view = editor.getView();
    return view.state.sliceDoc(start, offset);
  }

  /**
   * Get text after cursor
   */
  static getTextAfter(editor: Editor, pos: EditorPosition, length: number): string {
    const offset = editor.posToOffset(pos);
    const view = editor.getView();
    const end = Math.min(view.state.doc.length, offset + length);
    return view.state.sliceDoc(offset, end);
  }

  /**
   * Get current line
   */
  static getCurrentLine(editor: Editor): string {
    const cursor = editor.getCursor();
    return editor.getLine(cursor.line);
  }

  /**
   * Replace current line
   */
  static replaceCurrentLine(editor: Editor, text: string): void {
    const cursor = editor.getCursor();
    editor.setLine(cursor.line, text);
  }

  /**
   * Insert line before
   */
  static insertLineBefore(editor: Editor, line: number, text: string): void {
    const view = editor.getView();
    const doc = view.state.doc;
    
    if (line < 0 || line >= doc.lines) {
      return;
    }

    const lineObj = doc.line(line + 1);
    view.dispatch({
      changes: {
        from: lineObj.from,
        to: lineObj.from,
        insert: text + '\n',
      },
    });
  }

  /**
   * Insert line after
   */
  static insertLineAfter(editor: Editor, line: number, text: string): void {
    const view = editor.getView();
    const doc = view.state.doc;
    
    if (line < 0 || line >= doc.lines) {
      return;
    }

    const lineObj = doc.line(line + 1);
    view.dispatch({
      changes: {
        from: lineObj.to,
        to: lineObj.to,
        insert: '\n' + text,
      },
    });
  }

  /**
   * Delete line
   */
  static deleteLine(editor: Editor, line: number): void {
    const view = editor.getView();
    const doc = view.state.doc;
    
    if (line < 0 || line >= doc.lines) {
      return;
    }

    const lineObj = doc.line(line + 1);
    const from = line === 0 ? lineObj.from : lineObj.from - 1;
    const to = lineObj.to;

    view.dispatch({
      changes: {
        from,
        to,
        insert: '',
      },
    });
  }

  /**
   * Indent line
   */
  static indentLine(editor: Editor, line: number, indent: string = '\t'): void {
    const currentLine = editor.getLine(line);
    editor.setLine(line, indent + currentLine);
  }

  /**
   * Unindent line
   */
  static unindentLine(editor: Editor, line: number, indent: string = '\t'): void {
    const currentLine = editor.getLine(line);
    if (currentLine.startsWith(indent)) {
      editor.setLine(line, currentLine.substring(indent.length));
    }
  }

  /**
   * Toggle comment
   */
  static toggleComment(editor: Editor, line: number): void {
    const currentLine = editor.getLine(line);
    const commentPrefix = '<!-- ';
    const commentSuffix = ' -->';

    if (currentLine.trim().startsWith(commentPrefix)) {
      // Remove comment
      const trimmed = currentLine.trim();
      const content = trimmed.substring(
        commentPrefix.length,
        trimmed.length - commentSuffix.length
      );
      editor.setLine(line, content);
    } else {
      // Add comment
      editor.setLine(line, `${commentPrefix}${currentLine}${commentSuffix}`);
    }
  }

  /**
   * Wrap selection with text
   */
  static wrapSelection(editor: Editor, before: string, after: string): void {
    const selection = editor.getSelection();
    if (selection) {
      editor.replaceSelection(before + selection + after);
    }
  }

  /**
   * Toggle bold
   */
  static toggleBold(editor: Editor): void {
    EditorExtensions.wrapSelection(editor, '**', '**');
  }

  /**
   * Toggle italic
   */
  static toggleItalic(editor: Editor): void {
    EditorExtensions.wrapSelection(editor, '*', '*');
  }

  /**
   * Toggle code
   */
  static toggleCode(editor: Editor): void {
    EditorExtensions.wrapSelection(editor, '`', '`');
  }

  /**
   * Toggle strikethrough
   */
  static toggleStrikethrough(editor: Editor): void {
    EditorExtensions.wrapSelection(editor, '~~', '~~');
  }

  /**
   * Toggle highlight
   */
  static toggleHighlight(editor: Editor): void {
    EditorExtensions.wrapSelection(editor, '==', '==');
  }

  /**
   * Insert link
   */
  static insertLink(editor: Editor, url: string, text?: string): void {
    const linkText = text || url;
    editor.replaceSelection(`[${linkText}](${url})`);
  }

  /**
   * Insert wikilink
   */
  static insertWikilink(editor: Editor, target: string, alias?: string): void {
    if (alias) {
      editor.replaceSelection(`[[${target}|${alias}]]`);
    } else {
      editor.replaceSelection(`[[${target}]]`);
    }
  }

  /**
   * Insert embed
   */
  static insertEmbed(editor: Editor, target: string): void {
    editor.replaceSelection(`![[${target}]]`);
  }

  /**
   * Insert heading
   */
  static insertHeading(editor: Editor, level: number, text: string): void {
    const prefix = '#'.repeat(Math.min(6, Math.max(1, level)));
    editor.replaceSelection(`${prefix} ${text}`);
  }

  /**
   * Insert list item
   */
  static insertListItem(editor: Editor, text: string, ordered: boolean = false): void {
    const prefix = ordered ? '1. ' : '- ';
    editor.replaceSelection(`${prefix}${text}`);
  }

  /**
   * Insert task
   */
  static insertTask(editor: Editor, text: string, checked: boolean = false): void {
    const checkbox = checked ? '[x]' : '[ ]';
    editor.replaceSelection(`- ${checkbox} ${text}`);
  }

  /**
   * Insert code block
   */
  static insertCodeBlock(editor: Editor, code: string, language: string = ''): void {
    editor.replaceSelection(`\`\`\`${language}\n${code}\n\`\`\``);
  }

  /**
   * Insert blockquote
   */
  static insertBlockquote(editor: Editor, text: string): void {
    const lines = text.split('\n');
    const quoted = lines.map(line => `> ${line}`).join('\n');
    editor.replaceSelection(quoted);
  }

  /**
   * Insert horizontal rule
   */
  static insertHorizontalRule(editor: Editor): void {
    editor.replaceSelection('\n---\n');
  }

  /**
   * Insert table
   */
  static insertTable(editor: Editor, rows: number, cols: number): void {
    const header = '| ' + Array(cols).fill('Header').join(' | ') + ' |';
    const separator = '| ' + Array(cols).fill('---').join(' | ') + ' |';
    const row = '| ' + Array(cols).fill('Cell').join(' | ') + ' |';
    
    const table = [
      header,
      separator,
      ...Array(rows - 1).fill(row),
    ].join('\n');

    editor.replaceSelection('\n' + table + '\n');
  }

  /**
   * Find and replace
   */
  static findAndReplace(
    editor: Editor,
    search: string | RegExp,
    replace: string,
    all: boolean = false
  ): number {
    const content = editor.getValue();
    let count = 0;

    if (typeof search === 'string') {
      if (all) {
        const newContent = content.split(search).join(replace);
        count = (content.length - newContent.length) / search.length;
        editor.setValue(newContent);
      } else {
        const index = content.indexOf(search);
        if (index !== -1) {
          const before = content.substring(0, index);
          const after = content.substring(index + search.length);
          editor.setValue(before + replace + after);
          count = 1;
        }
      }
    } else {
      if (all) {
        const newContent = content.replace(search, replace);
        editor.setValue(newContent);
        count = 1; // Approximate
      } else {
        const match = content.match(search);
        if (match && match.index !== undefined) {
          const before = content.substring(0, match.index);
          const after = content.substring(match.index + match[0].length);
          editor.setValue(before + replace + after);
          count = 1;
        }
      }
    }

    return count;
  }

  /**
   * Get selected lines
   */
  static getSelectedLines(editor: Editor): { from: number; to: number } {
    const view = editor.getView();
    const selection = view.state.selection.main;
    const fromLine = view.state.doc.lineAt(selection.from);
    const toLine = view.state.doc.lineAt(selection.to);
    
    return {
      from: fromLine.number - 1,
      to: toLine.number - 1,
    };
  }

  /**
   * Select lines
   */
  static selectLines(editor: Editor, from: number, to: number): void {
    const view = editor.getView();
    const doc = view.state.doc;
    
    const fromLine = doc.line(from + 1);
    const toLine = doc.line(to + 1);
    
    view.dispatch({
      selection: {
        anchor: fromLine.from,
        head: toLine.to,
      },
    });
  }

  /**
   * Duplicate line
   */
  static duplicateLine(editor: Editor, line: number): void {
    const content = editor.getLine(line);
    EditorExtensions.insertLineAfter(editor, line, content);
  }

  /**
   * Move line up
   */
  static moveLineUp(editor: Editor, line: number): void {
    if (line <= 0) return;
    
    const currentLine = editor.getLine(line);
    const previousLine = editor.getLine(line - 1);
    
    editor.setLine(line - 1, currentLine);
    editor.setLine(line, previousLine);
  }

  /**
   * Move line down
   */
  static moveLineDown(editor: Editor, line: number): void {
    if (line >= editor.lastLine()) return;
    
    const currentLine = editor.getLine(line);
    const nextLine = editor.getLine(line + 1);
    
    editor.setLine(line, nextLine);
    editor.setLine(line + 1, currentLine);
  }
}
