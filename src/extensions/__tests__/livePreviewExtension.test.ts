import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { livePreviewExtension, livePreviewState, toggleLivePreview, toggleLivePreviewMode, isLivePreviewEnabled } from '../livePreviewExtension';

describe('livePreviewExtension', () => {
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

  it('should be disabled by default', () => {
    const doc = '# Heading';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
      }),
      parent: container,
    });

    expect(isLivePreviewEnabled(view)).toBe(false);
  });

  it('should toggle live preview mode', () => {
    const doc = '# Heading';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
      }),
      parent: container,
    });

    expect(isLivePreviewEnabled(view)).toBe(false);
    
    toggleLivePreviewMode(view);
    expect(isLivePreviewEnabled(view)).toBe(true);
    
    toggleLivePreviewMode(view);
    expect(isLivePreviewEnabled(view)).toBe(false);
  });

  it('should render headings in preview mode', () => {
    const doc = '# Heading 1\n## Heading 2';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
      }),
      parent: container,
    });

    // Enable live preview
    view.dispatch({
      effects: toggleLivePreview.of(true),
    });

    const previews = container.querySelectorAll('.cm-preview-heading');
    expect(previews.length).toBeGreaterThan(0);
  });

  it('should render bold text in preview mode', () => {
    const doc = 'Text with **bold** content';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
      }),
      parent: container,
    });

    view.dispatch({
      effects: toggleLivePreview.of(true),
    });

    const previews = container.querySelectorAll('.cm-preview-bold');
    expect(previews.length).toBeGreaterThan(0);
  });

  it('should render italic text in preview mode', () => {
    const doc = 'Text with *italic* content';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
      }),
      parent: container,
    });

    view.dispatch({
      effects: toggleLivePreview.of(true),
    });

    const previews = container.querySelectorAll('.cm-preview-italic');
    expect(previews.length).toBeGreaterThan(0);
  });

  it('should render inline code in preview mode', () => {
    const doc = 'Text with `code` content';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
      }),
      parent: container,
    });

    view.dispatch({
      effects: toggleLivePreview.of(true),
    });

    const previews = container.querySelectorAll('.cm-preview-code');
    expect(previews.length).toBeGreaterThan(0);
  });

  it('should render links in preview mode', () => {
    const doc = 'Text with [link](https://example.com) content';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
      }),
      parent: container,
    });

    view.dispatch({
      effects: toggleLivePreview.of(true),
    });

    const previews = container.querySelectorAll('.cm-preview-link');
    expect(previews.length).toBeGreaterThan(0);
  });

  it('should not render preview on cursor line', () => {
    const doc = '# Heading\nOther line';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
        selection: { anchor: 0 }, // Cursor on first line
      }),
      parent: container,
    });

    view.dispatch({
      effects: toggleLivePreview.of(true),
    });

    // The line with cursor should not be hidden
    const hidden = container.querySelectorAll('.cm-preview-hidden');
    // Should have fewer hidden elements because cursor line is excluded
    expect(hidden.length).toBeLessThan(2);
  });

  it('should handle multiple markdown elements', () => {
    const doc = `# Heading
**Bold** and *italic* text
\`code\` and [link](url)
> Blockquote`;
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [livePreviewState, livePreviewExtension],
      }),
      parent: container,
    });

    view.dispatch({
      effects: toggleLivePreview.of(true),
    });

    const previews = container.querySelectorAll('[class*="cm-preview-"]');
    expect(previews.length).toBeGreaterThan(3);
  });
});
