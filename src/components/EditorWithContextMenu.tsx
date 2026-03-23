import { useEffect, useRef, useCallback, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";
import { FileItem } from "../types";
import MarkdownToolbar from "./MarkdownToolbar";
import EditorContextMenu from "./EditorContextMenu";
import LinkContextMenu from "./LinkContextMenu";
import { useEditorContextMenu } from "../hooks/useEditorContextMenu";
import { useLinkContextMenu } from "../hooks/useLinkContextMenu";
import { log } from "../utils/logger";

/**
 * Editor component with integrated context menus
 * This is a simplified version demonstrating context menu integration
 */

interface EditorWithContextMenuProps {
  currentFile: FileItem | null;
  content: string;
  onContentChange: (content: string) => void;
  showToolbar?: boolean;
}

export default function EditorWithContextMenu({
  currentFile,
  content,
  onContentChange,
  showToolbar = true
}: EditorWithContextMenuProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Context menu hooks
  const editorContextMenu = useEditorContextMenu(viewRef.current);
  const linkContextMenu = useLinkContextMenu(viewRef.current);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        markdown(),
        syntaxHighlighting(defaultHighlightStyle),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            onContentChange(newContent);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Add context menu listeners
    const editorDom = view.dom;
    
    const handleContextMenu = (e: MouseEvent) => {
      // Check if clicking on a link first
      const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
      if (pos !== null) {
        const linkInfo = linkContextMenu.detectLink(pos);
        if (linkInfo) {
          linkContextMenu.handleContextMenu(e);
          return;
        }
      }
      
      // Otherwise show editor context menu
      editorContextMenu.handleContextMenu(e);
    };

    editorDom.addEventListener('contextmenu', handleContextMenu);

    log.info('[EditorWithContextMenu] Editor initialized with context menus');

    return () => {
      editorDom.removeEventListener('contextmenu', handleContextMenu);
      view.destroy();
    };
  }, []);

  // Update content when file changes
  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return (
    <div className="h-full flex flex-col">
      {showToolbar && (
        <MarkdownToolbar
          onBold={() => editorContextMenu.handlers.onBold()}
          onItalic={() => editorContextMenu.handlers.onItalic()}
          onHeading={() => {}}
          onLink={() => editorContextMenu.handlers.onInsertLink()}
          onImage={() => editorContextMenu.handlers.onInsertImage()}
          onCode={() => editorContextMenu.handlers.onInsertCodeBlock()}
          onQuote={() => {}}
          onList={() => {}}
          onCheckbox={() => {}}
        />
      )}

      <div ref={editorRef} className="flex-1 overflow-auto" />

      {/* Editor Context Menu */}
      {editorContextMenu.contextMenu && (
        <EditorContextMenu
          x={editorContextMenu.contextMenu.x}
          y={editorContextMenu.contextMenu.y}
          selectedText={editorContextMenu.contextMenu.selectedText}
          hasSelection={editorContextMenu.contextMenu.hasSelection}
          {...editorContextMenu.handlers}
          onClose={editorContextMenu.closeContextMenu}
        />
      )}

      {/* Link Context Menu */}
      {linkContextMenu.contextMenu && (
        <LinkContextMenu
          x={linkContextMenu.contextMenu.x}
          y={linkContextMenu.contextMenu.y}
          link={linkContextMenu.contextMenu.link}
          linkText={linkContextMenu.contextMenu.linkText}
          onOpenLink={() => linkContextMenu.handlers.onOpenLink(
            linkContextMenu.contextMenu!.link,
            linkContextMenu.contextMenu!.linkType
          )}
          onOpenInNewTab={() => linkContextMenu.handlers.onOpenInNewTab(
            linkContextMenu.contextMenu!.link,
            linkContextMenu.contextMenu!.linkType
          )}
          onCopyLink={() => linkContextMenu.handlers.onCopyLink(linkContextMenu.contextMenu!.link)}
          onEditLink={() => linkContextMenu.handlers.onEditLink(linkContextMenu.contextMenu!.link)}
          onClose={linkContextMenu.closeContextMenu}
        />
      )}
    </div>
  );
}
