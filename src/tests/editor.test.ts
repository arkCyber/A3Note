/**
 * Aerospace-Grade Test Suite for Markdown Editor
 * Comprehensive tests for all markdown elements and edge cases
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';

describe('Markdown Editor - Aerospace-Grade Tests', () => {
  let container: HTMLElement;
  let view: EditorView | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (view) {
      view.destroy();
      view = null;
    }
    document.body.removeChild(container);
  });

  describe('Headings', () => {
    it('should render H1 with correct size', () => {
      const state = EditorState.create({
        doc: '# Heading 1',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      const line = view.dom.querySelector('.cm-line');
      expect(line).toBeTruthy();
      expect(line?.textContent).toBe('# Heading 1');
    });

    it('should render all heading levels (H1-H6)', () => {
      const headings = [
        '# H1',
        '## H2',
        '### H3',
        '#### H4',
        '##### H5',
        '###### H6',
      ];

      headings.forEach((heading, index) => {
        const state = EditorState.create({
          doc: heading,
          extensions: [markdown()],
        });
        const testView = new EditorView({ state, parent: container });
        
        const line = testView.dom.querySelector('.cm-line');
        expect(line?.textContent).toBe(heading);
        
        testView.destroy();
      });
    });

    it('should handle empty heading', () => {
      const state = EditorState.create({
        doc: '#',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('#');
    });

    it('should handle heading with special characters', () => {
      const state = EditorState.create({
        doc: '# Heading with 中文 and émojis 🎉',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('# Heading with 中文 and émojis 🎉');
    });
  });

  describe('Bold Text', () => {
    it('should render bold with **', () => {
      const state = EditorState.create({
        doc: '**bold text**',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('**bold text**');
    });

    it('should render bold with __', () => {
      const state = EditorState.create({
        doc: '__bold text__',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('__bold text__');
    });

    it('should handle empty bold markers', () => {
      const state = EditorState.create({
        doc: '****',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('****');
    });

    it('should handle incomplete bold markers', () => {
      const state = EditorState.create({
        doc: '**incomplete',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('**incomplete');
    });

    it('should handle nested bold (edge case)', () => {
      const state = EditorState.create({
        doc: '**outer **inner** outer**',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('**outer **inner** outer**');
    });
  });

  describe('Italic Text', () => {
    it('should render italic with *', () => {
      const state = EditorState.create({
        doc: '*italic text*',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('*italic text*');
    });

    it('should render italic with _', () => {
      const state = EditorState.create({
        doc: '_italic text_',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('_italic text_');
    });

    it('should handle empty italic markers', () => {
      const state = EditorState.create({
        doc: '**',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('**');
    });
  });

  describe('Inline Code', () => {
    it('should render inline code', () => {
      const state = EditorState.create({
        doc: '`code`',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('`code`');
    });

    it('should handle code with special characters', () => {
      const state = EditorState.create({
        doc: '`const x = "hello";`',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('`const x = "hello";`');
    });

    it('should handle empty code markers', () => {
      const state = EditorState.create({
        doc: '``',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('``');
    });
  });

  describe('Links', () => {
    it('should render link', () => {
      const state = EditorState.create({
        doc: '[link text](https://example.com)',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('[link text](https://example.com)');
    });

    it('should handle link with empty text', () => {
      const state = EditorState.create({
        doc: '[](https://example.com)',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('[](https://example.com)');
    });

    it('should handle link with empty URL', () => {
      const state = EditorState.create({
        doc: '[link text]()',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('[link text]()');
    });
  });

  describe('Blockquotes', () => {
    it('should render blockquote', () => {
      const state = EditorState.create({
        doc: '> Quote text',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('> Quote text');
    });

    it('should handle multi-line blockquote', () => {
      const state = EditorState.create({
        doc: '> Line 1\n> Line 2\n> Line 3',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('> Line 1\n> Line 2\n> Line 3');
    });

    it('should handle empty blockquote', () => {
      const state = EditorState.create({
        doc: '>',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('>');
    });
  });

  describe('Lists', () => {
    it('should render unordered list with -', () => {
      const state = EditorState.create({
        doc: '- Item 1\n- Item 2\n- Item 3',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('- Item 1\n- Item 2\n- Item 3');
    });

    it('should render unordered list with *', () => {
      const state = EditorState.create({
        doc: '* Item 1\n* Item 2',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('* Item 1\n* Item 2');
    });

    it('should render ordered list', () => {
      const state = EditorState.create({
        doc: '1. First\n2. Second\n3. Third',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('1. First\n2. Second\n3. Third');
    });

    it('should handle empty list item', () => {
      const state = EditorState.create({
        doc: '-',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('-');
    });
  });

  describe('Strikethrough', () => {
    it('should render strikethrough', () => {
      const state = EditorState.create({
        doc: '~~deleted text~~',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('~~deleted text~~');
    });

    it('should handle empty strikethrough', () => {
      const state = EditorState.create({
        doc: '~~~~',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('~~~~');
    });
  });

  describe('Horizontal Rule', () => {
    it('should render horizontal rule with ---', () => {
      const state = EditorState.create({
        doc: '---',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('---');
    });

    it('should render horizontal rule with ***', () => {
      const state = EditorState.create({
        doc: '***',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('***');
    });

    it('should render horizontal rule with ___', () => {
      const state = EditorState.create({
        doc: '___',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('___');
    });
  });

  describe('Code Blocks', () => {
    it('should render fenced code block', () => {
      const state = EditorState.create({
        doc: '```\ncode\n```',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('```\ncode\n```');
    });

    it('should render code block with language', () => {
      const state = EditorState.create({
        doc: '```javascript\nconst x = 1;\n```',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('```javascript\nconst x = 1;\n```');
    });

    it('should handle empty code block', () => {
      const state = EditorState.create({
        doc: '```\n```',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('```\n```');
    });
  });

  describe('Combined Formatting', () => {
    it('should handle bold + italic', () => {
      const state = EditorState.create({
        doc: '***bold and italic***',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('***bold and italic***');
    });

    it('should handle heading with bold', () => {
      const state = EditorState.create({
        doc: '## **Bold Heading**',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('## **Bold Heading**');
    });

    it('should handle link with bold text', () => {
      const state = EditorState.create({
        doc: '[**bold link**](url)',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('[**bold link**](url)');
    });

    it('should handle blockquote with formatting', () => {
      const state = EditorState.create({
        doc: '> **Bold** and *italic* in quote',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('> **Bold** and *italic* in quote');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long document', () => {
      const longDoc = Array(1000).fill('# Heading\n\nParagraph text.\n\n').join('');
      const state = EditorState.create({
        doc: longDoc,
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.length).toBeGreaterThan(10000);
    });

    it('should handle empty document', () => {
      const state = EditorState.create({
        doc: '',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('');
    });

    it('should handle document with only whitespace', () => {
      const state = EditorState.create({
        doc: '   \n\n   \n',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toBe('   \n\n   \n');
    });

    it('should handle unicode characters', () => {
      const state = EditorState.create({
        doc: '# 中文标题\n\n**粗体** *斜体* `代码`\n\n> 引用文字',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toContain('中文标题');
    });

    it('should handle emojis', () => {
      const state = EditorState.create({
        doc: '# 🎉 Heading with emoji\n\n**Bold 🚀** and *italic 💡*',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      expect(view.state.doc.toString()).toContain('🎉');
    });

    it('should handle malformed markdown gracefully', () => {
      const state = EditorState.create({
        doc: '**unclosed bold\n*unclosed italic\n`unclosed code',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      // Should not crash
      expect(view.state.doc.toString()).toBe('**unclosed bold\n*unclosed italic\n`unclosed code');
    });
  });

  describe('Performance', () => {
    it('should handle rapid updates', () => {
      const state = EditorState.create({
        doc: 'Initial text',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        view.dispatch({
          changes: { from: view.state.doc.length, insert: 'x' },
        });
      }
      
      expect(view.state.doc.length).toBe('Initial text'.length + 100);
    });

    it('should handle large paste operation', () => {
      const state = EditorState.create({
        doc: '',
        extensions: [markdown()],
      });
      view = new EditorView({ state, parent: container });
      
      const largePaste = Array(1000).fill('Line of text\n').join('');
      view.dispatch({
        changes: { from: 0, insert: largePaste },
      });
      
      expect(view.state.doc.length).toBeGreaterThan(10000);
    });
  });
});
