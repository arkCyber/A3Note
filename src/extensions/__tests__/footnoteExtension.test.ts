import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { footnoteExtension } from '../footnoteExtension';

describe('footnoteExtension', () => {
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

  it('should render footnote references', () => {
    const doc = 'Text with footnote[^1]\n\n[^1]: Footnote content';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [footnoteExtension],
      }),
      parent: container,
    });

    const footnoteRef = container.querySelector('.cm-footnote-ref');
    expect(footnoteRef).toBeTruthy();
    expect(footnoteRef?.textContent).toBe('[1]');
  });

  it('should style footnote definitions', () => {
    const doc = '[^1]: This is a footnote';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [footnoteExtension],
      }),
      parent: container,
    });

    const footnoteDef = container.querySelector('.cm-footnote-def');
    expect(footnoteDef).toBeTruthy();
  });

  it('should handle multiple footnotes', () => {
    const doc = `Text[^1] and more[^2]

[^1]: First footnote
[^2]: Second footnote`;
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [footnoteExtension],
      }),
      parent: container,
    });

    const footnoteRefs = container.querySelectorAll('.cm-footnote-ref');
    expect(footnoteRefs.length).toBe(2);
    expect(footnoteRefs[0].textContent).toBe('[1]');
    expect(footnoteRefs[1].textContent).toBe('[2]');
  });

  it('should number footnotes sequentially', () => {
    const doc = `A[^note1] B[^note2] C[^note3]

[^note1]: First
[^note2]: Second
[^note3]: Third`;
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [footnoteExtension],
      }),
      parent: container,
    });

    const footnoteRefs = container.querySelectorAll('.cm-footnote-ref');
    expect(footnoteRefs[0].textContent).toBe('[1]');
    expect(footnoteRefs[1].textContent).toBe('[2]');
    expect(footnoteRefs[2].textContent).toBe('[3]');
  });

  it('should not render references without definitions', () => {
    const doc = 'Text with undefined footnote[^missing]';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [footnoteExtension],
      }),
      parent: container,
    });

    const footnoteRef = container.querySelector('.cm-footnote-ref');
    expect(footnoteRef).toBeFalsy();
  });
});
