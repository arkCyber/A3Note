import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { mathExtension } from '../mathExtension';

// Mock KaTeX
vi.mock('katex', () => ({
  default: {
    render: vi.fn((latex, element) => {
      element.textContent = `[Math: ${latex}]`;
    }),
  },
}));

describe('mathExtension', () => {
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

  it('should render inline math', () => {
    const doc = 'Text with $x^2$ math';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [mathExtension],
      }),
      parent: container,
    });

    const mathInline = container.querySelector('.cm-math-inline');
    expect(mathInline).toBeTruthy();
  });

  it('should render display math', () => {
    const doc = '$$\nx^2 + y^2 = z^2\n$$';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [mathExtension],
      }),
      parent: container,
    });

    const mathDisplay = container.querySelector('.cm-math-display');
    expect(mathDisplay).toBeTruthy();
  });

  it('should handle multiple inline math expressions', () => {
    const doc = 'Formula $a + b$ and $c - d$ here';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [mathExtension],
      }),
      parent: container,
    });

    const mathElements = container.querySelectorAll('.cm-math-inline');
    expect(mathElements.length).toBe(2);
  });

  it('should not render incomplete math syntax', () => {
    const doc = 'Text with $incomplete math';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [mathExtension],
      }),
      parent: container,
    });

    const mathInline = container.querySelector('.cm-math-inline');
    expect(mathInline).toBeFalsy();
  });
});
