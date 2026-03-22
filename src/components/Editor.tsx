import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { FileItem } from "../types";

interface EditorProps {
  currentFile: FileItem | null;
  content: string;
  onContentChange: (content: string) => void;
}

export default function Editor({ currentFile, content, onContentChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    // Initialize CodeMirror editor
    const startState = EditorState.create({
      doc: content || "# Welcome to A3Note\n\nStart writing your notes here...",
      extensions: [
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        EditorView.theme({
          "&": { backgroundColor: "#1e1e1e", color: "#d4d4d4", height: "100%" },
          ".cm-content": { caretColor: "#d4d4d4" },
          ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#d4d4d4" },
          "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
            backgroundColor: "#264f78"
          },
          ".cm-gutters": { backgroundColor: "#1e1e1e", color: "#858585", border: "none" },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            onContentChange(newContent);
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
    };
  }, [onContentChange]);

  useEffect(() => {
    if (viewRef.current && currentFile) {
      // Update editor content when file changes
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== content) {
        const transaction = viewRef.current.state.update({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: content,
          },
        });
        viewRef.current.dispatch(transaction);
      }
    }
  }, [currentFile, content]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {currentFile === null ? (
        <div className="flex-1 flex items-center justify-center text-foreground/50">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Welcome to A3Note</h2>
            <p className="text-sm">Select a file or create a new one to start editing</p>
          </div>
        </div>
      ) : (
        <div ref={editorRef} className="flex-1 overflow-auto" />
      )}
    </div>
  );
}
