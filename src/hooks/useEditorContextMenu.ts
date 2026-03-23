import { useState, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { log } from '../utils/logger';

/**
 * Hook for managing editor context menu
 */

export interface EditorContextMenuState {
  show: boolean;
  x: number;
  y: number;
  selectedText: string;
  hasSelection: boolean;
}

export function useEditorContextMenu(editorView: EditorView | null) {
  const [contextMenu, setContextMenu] = useState<EditorContextMenuState | null>(null);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    
    if (!editorView) return;

    const selection = editorView.state.selection.main;
    const selectedText = editorView.state.doc.sliceString(selection.from, selection.to);
    const hasSelection = !selection.empty;

    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      selectedText,
      hasSelection,
    });

    log.info('[useEditorContextMenu] Context menu opened', { hasSelection, textLength: selectedText.length });
  }, [editorView]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Text operations
  const handleCut = useCallback(() => {
    if (!editorView) return;
    
    const selection = editorView.state.selection.main;
    const text = editorView.state.doc.sliceString(selection.from, selection.to);
    
    navigator.clipboard.writeText(text);
    editorView.dispatch({
      changes: { from: selection.from, to: selection.to, insert: '' }
    });
    
    log.info('[useEditorContextMenu] Cut text', { length: text.length });
  }, [editorView]);

  const handleCopy = useCallback(() => {
    if (!editorView) return;
    
    const selection = editorView.state.selection.main;
    const text = editorView.state.doc.sliceString(selection.from, selection.to);
    
    navigator.clipboard.writeText(text);
    log.info('[useEditorContextMenu] Copied text', { length: text.length });
  }, [editorView]);

  const handlePaste = useCallback(async () => {
    if (!editorView) return;
    
    try {
      const text = await navigator.clipboard.readText();
      const selection = editorView.state.selection.main;
      
      editorView.dispatch({
        changes: { from: selection.from, to: selection.to, insert: text }
      });
      
      log.info('[useEditorContextMenu] Pasted text', { length: text.length });
    } catch (error) {
      log.error('[useEditorContextMenu] Failed to paste', error as Error);
    }
  }, [editorView]);

  const handleSelectAll = useCallback(() => {
    if (!editorView) return;
    
    editorView.dispatch({
      selection: { anchor: 0, head: editorView.state.doc.length }
    });
    
    log.info('[useEditorContextMenu] Selected all text');
  }, [editorView]);

  // Formatting operations
  const wrapSelection = useCallback((before: string, after: string) => {
    if (!editorView) return;
    
    const selection = editorView.state.selection.main;
    const text = editorView.state.doc.sliceString(selection.from, selection.to);
    
    editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: `${before}${text}${after}`
      },
      selection: {
        anchor: selection.from + before.length,
        head: selection.to + before.length
      }
    });
  }, [editorView]);

  const handleBold = useCallback(() => {
    wrapSelection('**', '**');
    log.info('[useEditorContextMenu] Applied bold');
  }, [wrapSelection]);

  const handleItalic = useCallback(() => {
    wrapSelection('*', '*');
    log.info('[useEditorContextMenu] Applied italic');
  }, [wrapSelection]);

  const handleHighlight = useCallback(() => {
    wrapSelection('==', '==');
    log.info('[useEditorContextMenu] Applied highlight');
  }, [wrapSelection]);

  const handleStrikethrough = useCallback(() => {
    wrapSelection('~~', '~~');
    log.info('[useEditorContextMenu] Applied strikethrough');
  }, [wrapSelection]);

  // Insert operations
  const handleInsertLink = useCallback(() => {
    if (!editorView) return;
    
    const selection = editorView.state.selection.main;
    const text = editorView.state.doc.sliceString(selection.from, selection.to);
    const linkText = text || 'link text';
    
    editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: `[${linkText}](url)`
      }
    });
    
    log.info('[useEditorContextMenu] Inserted link');
  }, [editorView]);

  const handleInsertImage = useCallback(() => {
    if (!editorView) return;
    
    const selection = editorView.state.selection.main;
    
    editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: '![image](url)'
      }
    });
    
    log.info('[useEditorContextMenu] Inserted image');
  }, [editorView]);

  const handleInsertCodeBlock = useCallback(() => {
    if (!editorView) return;
    
    const selection = editorView.state.selection.main;
    
    editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: '```\ncode\n```'
      }
    });
    
    log.info('[useEditorContextMenu] Inserted code block');
  }, [editorView]);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
    handlers: {
      onCut: handleCut,
      onCopy: handleCopy,
      onPaste: handlePaste,
      onSelectAll: handleSelectAll,
      onBold: handleBold,
      onItalic: handleItalic,
      onHighlight: handleHighlight,
      onStrikethrough: handleStrikethrough,
      onInsertLink: handleInsertLink,
      onInsertImage: handleInsertImage,
      onInsertCodeBlock: handleInsertCodeBlock,
    }
  };
}
