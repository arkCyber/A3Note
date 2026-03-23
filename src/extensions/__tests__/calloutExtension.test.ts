import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { calloutExtension } from '../calloutExtension';

describe('calloutExtension', () => {
  let view: EditorView;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    view?.destroy();
    container.remove();
  });

  it('should render note callout', () => {
    const doc = '> [!note] This is a note\n> Content here';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [calloutExtension],
      }),
      parent: container,
    });

    const calloutLine = container.querySelector('.cm-callout-note');
    expect(calloutLine).toBeTruthy();
  });

  it('should render warning callout', () => {
    const doc = '> [!warning] Warning message\n> Be careful!';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [calloutExtension],
      }),
      parent: container,
    });

    const calloutLine = container.querySelector('.cm-callout-warning');
    expect(calloutLine).toBeTruthy();
  });

  it('should render tip callout', () => {
    const doc = '> [!tip] Helpful tip\n> This is useful';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [calloutExtension],
      }),
      parent: container,
    });

    const calloutLine = container.querySelector('.cm-callout-tip');
    expect(calloutLine).toBeTruthy();
  });

  it('should handle callout without title', () => {
    const doc = '> [!note]\n> Content without title';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [calloutExtension],
      }),
      parent: container,
    });

    const calloutLine = container.querySelector('.cm-callout-note');
    expect(calloutLine).toBeTruthy();
  });

  it('should handle multi-line callouts', () => {
    const doc = `> [!important] Important
> Line 1
> Line 2
> Line 3`;
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [calloutExtension],
      }),
      parent: container,
    });

    const calloutLines = container.querySelectorAll('.cm-callout-important, .cm-callout-content');
    expect(calloutLines.length).toBeGreaterThan(0);
  });

  it('should handle multiple callouts in document', () => {
    const doc = `> [!note] First note
> Content 1

Some text

> [!warning] Second warning
> Content 2`;
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [calloutExtension],
      }),
      parent: container,
    });

    const noteCallout = container.querySelector('.cm-callout-note');
    const warningCallout = container.querySelector('.cm-callout-warning');
    
    expect(noteCallout).toBeTruthy();
    expect(warningCallout).toBeTruthy();
  });

  it('should handle all callout types', () => {
    const types = ['note', 'tip', 'warning', 'danger', 'info', 'todo', 'success', 'question', 'example'];
    
    types.forEach(type => {
      const doc = `> [!${type}] Test\n> Content`;
      
      view = new EditorView({
        state: EditorState.create({
          doc,
          extensions: [calloutExtension],
        }),
        parent: container,
      });

      const calloutLine = container.querySelector(`.cm-callout-${type}`);
      expect(calloutLine).toBeTruthy();
      
      view.destroy();
    });
  });

  it('should not render callout for regular blockquotes', () => {
    const doc = '> Regular blockquote\n> Without callout syntax';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [calloutExtension],
      }),
      parent: container,
    });

    const calloutLine = container.querySelector('[class*="cm-callout-"]');
    expect(calloutLine).toBeFalsy();
  });
});
