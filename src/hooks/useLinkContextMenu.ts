import { useState, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { log } from '../utils/logger';

/**
 * Hook for managing link context menu in editor
 */

export interface LinkContextMenuState {
  show: boolean;
  x: number;
  y: number;
  link: string;
  linkText: string;
  linkType: 'internal' | 'external' | 'relative';
}

export function useLinkContextMenu(editorView: EditorView | null) {
  const [contextMenu, setContextMenu] = useState<LinkContextMenuState | null>(null);

  // Detect if cursor is on a link
  const detectLink = useCallback((pos: number): { link: string; linkText: string; linkType: 'internal' | 'external' | 'relative' } | null => {
    if (!editorView) return null;

    const tree = syntaxTree(editorView.state);
    let linkInfo: { link: string; linkText: string; linkType: 'internal' | 'external' | 'relative' } | null = null;

    tree.iterate({
      from: pos,
      to: pos,
      enter: (node) => {
        // Check for markdown link [text](url)
        if (node.name === 'Link') {
          const linkText = editorView.state.doc.sliceString(node.from, node.to);
          const match = linkText.match(/\[([^\]]+)\]\(([^)]+)\)/);
          
          if (match) {
            const text = match[1];
            const url = match[2];
            
            let linkType: 'internal' | 'external' | 'relative' = 'relative';
            if (url.startsWith('http://') || url.startsWith('https://')) {
              linkType = 'external';
            } else if (url.startsWith('[[') || url.endsWith('.md')) {
              linkType = 'internal';
            }
            
            linkInfo = { link: url, linkText: text, linkType };
          }
        }
        
        // Check for wiki link [[text]]
        if (node.name === 'WikiLink') {
          const linkText = editorView.state.doc.sliceString(node.from, node.to);
          const match = linkText.match(/\[\[([^\]]+)\]\]/);
          
          if (match) {
            linkInfo = {
              link: match[1],
              linkText: match[1],
              linkType: 'internal'
            };
          }
        }
      }
    });

    return linkInfo;
  }, [editorView]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (!editorView) return;

    const pos = editorView.posAtCoords({ x: e.clientX, y: e.clientY });
    if (pos === null) return;

    const linkInfo = detectLink(pos);
    if (!linkInfo) return;

    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      ...linkInfo
    });

    log.info('[useLinkContextMenu] Link context menu opened', linkInfo);
  }, [editorView, detectLink]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Link operations
  const handleOpenLink = useCallback((link: string, linkType: string) => {
    if (linkType === 'external') {
      window.open(link, '_blank');
      log.info('[useLinkContextMenu] Opened external link', link);
    } else if (linkType === 'internal') {
      // Navigate to internal file
      log.info('[useLinkContextMenu] Navigate to internal file', link);
      // This would trigger file navigation in the app
    } else {
      log.info('[useLinkContextMenu] Open relative link', link);
    }
  }, []);

  const handleOpenInNewTab = useCallback((link: string, linkType: string) => {
    if (linkType === 'external') {
      window.open(link, '_blank');
    } else {
      log.info('[useLinkContextMenu] Open internal link in new tab', link);
      // This would open in a new editor tab
    }
  }, []);

  const handleCopyLink = useCallback((link: string) => {
    navigator.clipboard.writeText(link);
    log.info('[useLinkContextMenu] Copied link', link);
  }, []);

  const handleEditLink = useCallback((link: string) => {
    if (!editorView) return;
    
    const newLink = prompt('Edit link URL:', link);
    if (newLink && newLink !== link) {
      // Find and replace the link in the editor
      const doc = editorView.state.doc.toString();
      const newDoc = doc.replace(link, newLink);
      
      editorView.dispatch({
        changes: { from: 0, to: doc.length, insert: newDoc }
      });
      
      log.info('[useLinkContextMenu] Edited link', { from: link, to: newLink });
    }
  }, [editorView]);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
    detectLink,
    handlers: {
      onOpenLink: handleOpenLink,
      onOpenInNewTab: handleOpenInNewTab,
      onCopyLink: handleCopyLink,
      onEditLink: handleEditLink,
    }
  };
}
