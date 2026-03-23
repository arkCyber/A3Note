import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorContextMenu } from '../useEditorContextMenu';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

describe('useEditorContextMenu', () => {
  let mockEditorView: EditorView;

  beforeEach(() => {
    // Create a minimal mock EditorView
    const state = EditorState.create({
      doc: 'Hello **bold** world',
      selection: { anchor: 6, head: 14 }, // Select "**bold**"
    });

    mockEditorView = {
      state,
      dispatch: vi.fn(),
      dom: document.createElement('div'),
    } as any;

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue('pasted text'),
      },
    });
  });

  it('should initialize with no context menu', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    expect(result.current.contextMenu).toBeNull();
  });

  it('should open context menu on right-click', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    const mockEvent = new MouseEvent('contextmenu', {
      clientX: 100,
      clientY: 200,
    });

    act(() => {
      result.current.handleContextMenu(mockEvent as any);
    });

    expect(result.current.contextMenu).toEqual({
      show: true,
      x: 100,
      y: 200,
      selectedText: '**bold**',
      hasSelection: true,
    });
  });

  it('should close context menu', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    const mockEvent = new MouseEvent('contextmenu', {
      clientX: 100,
      clientY: 200,
    });

    act(() => {
      result.current.handleContextMenu(mockEvent as any);
    });

    expect(result.current.contextMenu).not.toBeNull();

    act(() => {
      result.current.closeContextMenu();
    });

    expect(result.current.contextMenu).toBeNull();
  });

  it('should handle copy operation', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onCopy();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('**bold**');
  });

  it('should handle cut operation', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onCut();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('**bold**');
    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle paste operation', async () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    await act(async () => {
      await result.current.handlers.onPaste();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle select all', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onSelectAll();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle bold formatting', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onBold();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle italic formatting', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onItalic();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle highlight formatting', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onHighlight();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle strikethrough formatting', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onStrikethrough();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle insert link', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onInsertLink();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle insert image', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onInsertImage();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });

  it('should handle insert code block', () => {
    const { result } = renderHook(() => useEditorContextMenu(mockEditorView));
    
    act(() => {
      result.current.handlers.onInsertCodeBlock();
    });

    expect(mockEditorView.dispatch).toHaveBeenCalled();
  });
});
