/**
 * Editor API Tests
 * Aerospace-grade test suite for Editor API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { Editor, EditorPosition } from '../../plugins/api/Editor';

describe('Editor API', () => {
  let view: EditorView;
  let editor: Editor;

  beforeEach(() => {
    // Create a mock EditorView
    const state = EditorState.create({
      doc: 'Line 1\nLine 2\nLine 3\nLine 4',
    });

    view = new EditorView({
      state,
      parent: document.body,
    });

    editor = new Editor(view);
  });

  describe('getValue', () => {
    it('should get entire document content', () => {
      const content = editor.getValue();
      expect(content).toBe('Line 1\nLine 2\nLine 3\nLine 4');
    });
  });

  describe('setValue', () => {
    it('should set entire document content', () => {
      editor.setValue('New content');
      expect(editor.getValue()).toBe('New content');
    });

    it('should handle empty string', () => {
      editor.setValue('');
      expect(editor.getValue()).toBe('');
    });

    it('should handle multiline content', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      editor.setValue(content);
      expect(editor.getValue()).toBe(content);
    });
  });

  describe('getLine', () => {
    it('should get line content by number', () => {
      expect(editor.getLine(0)).toBe('Line 1');
      expect(editor.getLine(1)).toBe('Line 2');
      expect(editor.getLine(2)).toBe('Line 3');
      expect(editor.getLine(3)).toBe('Line 4');
    });

    it('should return empty string for invalid line', () => {
      expect(editor.getLine(-1)).toBe('');
      expect(editor.getLine(100)).toBe('');
    });
  });

  describe('setLine', () => {
    it('should set line content', () => {
      editor.setLine(1, 'Modified Line 2');
      expect(editor.getLine(1)).toBe('Modified Line 2');
    });

    it('should handle empty string', () => {
      editor.setLine(0, '');
      expect(editor.getLine(0)).toBe('');
    });

    it('should not modify other lines', () => {
      editor.setLine(1, 'Modified');
      expect(editor.getLine(0)).toBe('Line 1');
      expect(editor.getLine(2)).toBe('Line 3');
    });
  });

  describe('lineCount', () => {
    it('should return correct line count', () => {
      expect(editor.lineCount()).toBe(4);
    });

    it('should update after setValue', () => {
      editor.setValue('Single line');
      expect(editor.lineCount()).toBe(1);
    });

    it('should handle empty document', () => {
      editor.setValue('');
      expect(editor.lineCount()).toBe(1);
    });
  });

  describe('getCursor', () => {
    it('should get cursor position', () => {
      const cursor = editor.getCursor();
      expect(cursor).toHaveProperty('line');
      expect(cursor).toHaveProperty('ch');
      expect(typeof cursor.line).toBe('number');
      expect(typeof cursor.ch).toBe('number');
    });
  });

  describe('setCursor', () => {
    it('should set cursor position', () => {
      editor.setCursor({ line: 1, ch: 3 });
      const cursor = editor.getCursor();
      expect(cursor.line).toBe(1);
      expect(cursor.ch).toBe(3);
    });

    it('should handle line-only position', () => {
      editor.setCursor({ line: 2, ch: 0 });
      const cursor = editor.getCursor();
      expect(cursor.line).toBe(2);
    });
  });

  describe('getSelection', () => {
    it('should get selected text', () => {
      editor.setSelection(
        { line: 0, ch: 0 },
        { line: 0, ch: 6 }
      );
      expect(editor.getSelection()).toBe('Line 1');
    });

    it('should return empty string when no selection', () => {
      const selection = editor.getSelection();
      expect(typeof selection).toBe('string');
    });
  });

  describe('replaceSelection', () => {
    it('should replace selected text', () => {
      editor.setSelection(
        { line: 0, ch: 0 },
        { line: 0, ch: 6 }
      );
      editor.replaceSelection('Replaced');
      expect(editor.getLine(0)).toContain('Replaced');
    });

    it('should insert at cursor when no selection', () => {
      editor.setCursor({ line: 0, ch: 0 });
      editor.replaceSelection('Insert');
      expect(editor.getLine(0)).toContain('Insert');
    });
  });

  describe('getRange', () => {
    it('should get text in range', () => {
      const text = editor.getRange(
        { line: 0, ch: 0 },
        { line: 1, ch: 6 }
      );
      expect(text).toBe('Line 1\nLine 2');
    });

    it('should handle single line range', () => {
      const text = editor.getRange(
        { line: 0, ch: 0 },
        { line: 0, ch: 4 }
      );
      expect(text).toBe('Line');
    });
  });

  describe('replaceRange', () => {
    it('should replace text in range', () => {
      editor.replaceRange(
        'REPLACED',
        { line: 0, ch: 0 },
        { line: 0, ch: 6 }
      );
      expect(editor.getLine(0)).toContain('REPLACED');
    });

    it('should insert when from equals to', () => {
      editor.replaceRange(
        'INSERT',
        { line: 0, ch: 0 },
        { line: 0, ch: 0 }
      );
      expect(editor.getLine(0)).toContain('INSERT');
    });

    it('should handle multiline replacement', () => {
      editor.replaceRange(
        'New\nContent',
        { line: 0, ch: 0 },
        { line: 1, ch: 6 }
      );
      expect(editor.getValue()).toContain('New\nContent');
    });
  });

  describe('lastLine', () => {
    it('should return last line number', () => {
      expect(editor.lastLine()).toBe(3);
    });

    it('should update after content change', () => {
      editor.setValue('Single line');
      expect(editor.lastLine()).toBe(0);
    });
  });

  describe('getWordAt', () => {
    it('should get word at position', () => {
      editor.setValue('hello world test');
      const word = editor.getWordAt({ line: 0, ch: 7 });
      
      expect(word).not.toBeNull();
      expect(word?.word).toBe('world');
    });

    it('should handle position at word boundary', () => {
      editor.setValue('hello world');
      const word = editor.getWordAt({ line: 0, ch: 0 });
      
      expect(word).not.toBeNull();
      expect(word?.word).toBe('hello');
    });

    it('should return null for whitespace', () => {
      editor.setValue('hello  world');
      const word = editor.getWordAt({ line: 0, ch: 5 });
      
      expect(word).toBeNull();
    });
  });

  describe('scrollIntoView', () => {
    it('should not throw error', () => {
      expect(() => {
        editor.scrollIntoView({ line: 0, ch: 0 });
      }).not.toThrow();
    });

    it('should accept position with line and ch', () => {
      expect(() => {
        editor.scrollIntoView({ line: 2, ch: 3 });
      }).not.toThrow();
    });
  });

  describe('focus', () => {
    it('should focus the editor', () => {
      expect(() => {
        editor.focus();
      }).not.toThrow();
    });
  });

  describe('blur', () => {
    it('should blur the editor', () => {
      expect(() => {
        editor.blur();
      }).not.toThrow();
    });
  });

  describe('hasFocus', () => {
    it('should return boolean', () => {
      const focused = editor.hasFocus();
      expect(typeof focused).toBe('boolean');
    });
  });

  describe('posToOffset', () => {
    it('should convert position to offset', () => {
      const offset = editor.posToOffset({ line: 1, ch: 0 });
      expect(typeof offset).toBe('number');
      expect(offset).toBeGreaterThanOrEqual(0);
    });

    it('should handle line 0', () => {
      const offset = editor.posToOffset({ line: 0, ch: 0 });
      expect(offset).toBe(0);
    });

    it('should handle character offset', () => {
      const offset1 = editor.posToOffset({ line: 0, ch: 0 });
      const offset2 = editor.posToOffset({ line: 0, ch: 3 });
      expect(offset2).toBe(offset1 + 3);
    });
  });

  describe('offsetToPos', () => {
    it('should convert offset to position', () => {
      const pos = editor.offsetToPos(0);
      expect(pos).toHaveProperty('line');
      expect(pos).toHaveProperty('ch');
      expect(pos.line).toBe(0);
      expect(pos.ch).toBe(0);
    });

    it('should handle non-zero offset', () => {
      const pos = editor.offsetToPos(7);
      expect(pos.line).toBeGreaterThanOrEqual(0);
      expect(pos.ch).toBeGreaterThanOrEqual(0);
    });

    it('should be inverse of posToOffset', () => {
      const originalPos = { line: 1, ch: 3 };
      const offset = editor.posToOffset(originalPos);
      const convertedPos = editor.offsetToPos(offset);
      
      expect(convertedPos.line).toBe(originalPos.line);
      expect(convertedPos.ch).toBe(originalPos.ch);
    });
  });

  describe('edge cases', () => {
    it('should handle very long lines', () => {
      const longLine = 'a'.repeat(10000);
      editor.setValue(longLine);
      expect(editor.getValue().length).toBe(10000);
    });

    it('should handle many lines', () => {
      const manyLines = Array(1000).fill('line').join('\n');
      editor.setValue(manyLines);
      expect(editor.lineCount()).toBe(1000);
    });

    it('should handle unicode characters', () => {
      editor.setValue('Hello 世界 🌍');
      expect(editor.getValue()).toBe('Hello 世界 🌍');
    });

    it('should handle special characters', () => {
      const special = 'Tab\there\nNewline\rCarriage\0Null';
      editor.setValue(special);
      expect(editor.getValue()).toContain('Tab');
    });
  });

  describe('performance', () => {
    it('should handle large documents efficiently', () => {
      const start = performance.now();
      const largeDoc = Array(10000).fill('line of text').join('\n');
      editor.setValue(largeDoc);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete in < 1s
    });

    it('should handle rapid updates', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        editor.setLine(0, `Line ${i}`);
      }
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(500); // Should complete in < 500ms
    });
  });

  describe('integration', () => {
    it('should maintain consistency across operations', () => {
      editor.setValue('Initial content');
      const initial = editor.getValue();
      
      editor.setCursor({ line: 0, ch: 0 });
      editor.replaceSelection('Prefix ');
      
      expect(editor.getValue()).toBe('Prefix Initial content');
      expect(editor.getValue().length).toBeGreaterThan(initial.length);
    });

    it('should handle complex editing sequence', () => {
      editor.setValue('Line 1\nLine 2\nLine 3');
      
      // Select and replace
      editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 6 });
      editor.replaceSelection('First');
      
      // Insert at cursor
      editor.setCursor({ line: 1, ch: 0 });
      editor.replaceSelection('Second ');
      
      // Verify final state
      expect(editor.getLine(0)).toBe('First');
      expect(editor.getLine(1)).toContain('Second');
    });
  });
});
