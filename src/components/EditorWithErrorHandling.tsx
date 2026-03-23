/**
 * Enhanced Editor Component with Aerospace-Grade Error Handling
 * Includes comprehensive logging, validation, and error recovery
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState, Range } from "@codemirror/state";
import { syntaxHighlighting, defaultHighlightStyle, syntaxTree } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import { FileItem } from "../types";
import MarkdownToolbar from "./MarkdownToolbar";
import { log } from "../utils/logger";
import { ErrorHandler, ErrorSeverity } from "../utils/errorHandler";

interface EditorProps {
  currentFile: FileItem | null;
  content: string;
  onContentChange: (content: string) => void;
  showToolbar?: boolean;
}

/**
 * Safe decoration builder with comprehensive error handling
 */
function buildMarkdownDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const endTimer = log.timer('MarkdownDecorations', 'buildDecorations');
  
  try {
    const tree = syntaxTree(view.state);
    
    if (!tree) {
      log.warn('MarkdownDecorations', 'Syntax tree is null');
      return Decoration.none;
    }

    const docLength = view.state.doc.length;
    let decorationCount = 0;
    const MAX_DECORATIONS = 10000; // Safety limit

    for (const { from, to } of view.visibleRanges) {
      // Validate range
      if (from < 0 || to > docLength || from > to) {
        log.warn('MarkdownDecorations', 'Invalid visible range', { from, to, docLength });
        continue;
      }

      tree.iterate({
        from,
        to,
        enter: (node) => {
          try {
            // Safety check for decoration limit
            if (decorationCount >= MAX_DECORATIONS) {
              log.warn('MarkdownDecorations', 'Max decorations reached', { count: decorationCount });
              return false; // Stop iteration
            }

            // Validate node position
            if (node.from < 0 || node.to > docLength || node.from > node.to) {
              log.warn('MarkdownDecorations', 'Invalid node position', { 
                name: node.name, 
                from: node.from, 
                to: node.to 
              });
              return;
            }

            // Headings (H1-H6)
            if (node.name.startsWith("ATXHeading")) {
              const level = node.name.charAt(node.name.length - 1);
              const line = view.state.doc.lineAt(node.from);
              decorations.push(
                Decoration.line({ class: `cm-heading-line cm-heading-line-${level}` }).range(line.from)
              );
              decorationCount++;
            }
            
            // Bold text
            else if (node.name === "StrongEmphasis") {
              const text = view.state.doc.sliceString(node.from, node.to);
              let contentStart = node.from;
              let contentEnd = node.to;
              
              if (text.startsWith("**") || text.startsWith("__")) {
                contentStart += 2;
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.from + 2)
                );
                decorationCount++;
              }
              
              if (text.endsWith("**") || text.endsWith("__")) {
                contentEnd -= 2;
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.to - 2, node.to)
                );
                decorationCount++;
              }
              
              if (contentStart < contentEnd) {
                decorations.push(
                  Decoration.mark({ class: "cm-strong-content" }).range(contentStart, contentEnd)
                );
                decorationCount++;
              }
            }
            
            // Italic text
            else if (node.name === "Emphasis") {
              const text = view.state.doc.sliceString(node.from, node.to);
              let contentStart = node.from;
              let contentEnd = node.to;
              
              if (text.startsWith("*") || text.startsWith("_")) {
                contentStart += 1;
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.from + 1)
                );
                decorationCount++;
              }
              
              if (text.endsWith("*") || text.endsWith("_")) {
                contentEnd -= 1;
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.to - 1, node.to)
                );
                decorationCount++;
              }
              
              if (contentStart < contentEnd) {
                decorations.push(
                  Decoration.mark({ class: "cm-em-content" }).range(contentStart, contentEnd)
                );
                decorationCount++;
              }
            }
            
            // Inline code
            else if (node.name === "InlineCode") {
              const text = view.state.doc.sliceString(node.from, node.to);
              let contentStart = node.from;
              let contentEnd = node.to;
              
              if (text.startsWith("`")) {
                contentStart += 1;
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.from + 1)
                );
                decorationCount++;
              }
              
              if (text.endsWith("`")) {
                contentEnd -= 1;
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.to - 1, node.to)
                );
                decorationCount++;
              }
              
              if (contentStart < contentEnd) {
                decorations.push(
                  Decoration.mark({ class: "cm-code-content" }).range(contentStart, contentEnd)
                );
                decorationCount++;
              }
            }
            
            // Links
            else if (node.name === "Link") {
              decorations.push(
                Decoration.mark({ class: "cm-link-text" }).range(node.from, node.to)
              );
              decorationCount++;
            }
            else if (node.name === "URL") {
              decorations.push(
                Decoration.mark({ class: "cm-url-text" }).range(node.from, node.to)
              );
              decorationCount++;
            }
            
            // Blockquotes
            else if (node.name === "Blockquote") {
              const line = view.state.doc.lineAt(node.from);
              decorations.push(
                Decoration.line({ class: "cm-blockquote-line" }).range(line.from)
              );
              decorationCount++;
            }
            else if (node.name === "QuoteMark") {
              decorations.push(
                Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.to)
              );
              decorationCount++;
            }
            
            // Lists
            else if (node.name === "ListItem") {
              const line = view.state.doc.lineAt(node.from);
              decorations.push(
                Decoration.line({ class: "cm-list-line" }).range(line.from)
              );
              decorationCount++;
            }
            else if (node.name === "ListMark") {
              decorations.push(
                Decoration.mark({ class: "cm-list-mark" }).range(node.from, node.to)
              );
              decorationCount++;
            }
            
            // Strikethrough
            else if (node.name === "Strikethrough") {
              const text = view.state.doc.sliceString(node.from, node.to);
              let contentStart = node.from;
              let contentEnd = node.to;
              
              if (text.startsWith("~~")) {
                contentStart += 2;
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.from + 2)
                );
                decorationCount++;
              }
              
              if (text.endsWith("~~")) {
                contentEnd -= 2;
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.to - 2, node.to)
                );
                decorationCount++;
              }
              
              if (contentStart < contentEnd) {
                decorations.push(
                  Decoration.mark({ class: "cm-strikethrough-content" }).range(contentStart, contentEnd)
                );
                decorationCount++;
              }
            }
            
            // Horizontal rule
            else if (node.name === "HorizontalRule") {
              const line = view.state.doc.lineAt(node.from);
              decorations.push(
                Decoration.line({ class: "cm-hr-line" }).range(line.from)
              );
              decorationCount++;
            }
            
            // Code blocks
            else if (node.name === "FencedCode" || node.name === "CodeBlock") {
              const line = view.state.doc.lineAt(node.from);
              decorations.push(
                Decoration.line({ class: "cm-code-block-line" }).range(line.from)
              );
              decorationCount++;
            }
            else if (node.name === "CodeMark") {
              decorations.push(
                Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.to)
              );
              decorationCount++;
            }
            
          } catch (error) {
            log.error('MarkdownDecorations', 'Error processing node', error as Error, {
              nodeName: node.name,
              from: node.from,
              to: node.to
            });
          }
        },
      });
    }

    log.debug('MarkdownDecorations', 'Built decorations', { count: decorationCount });
    return Decoration.set(decorations, true);
    
  } catch (error) {
    log.error('MarkdownDecorations', 'Failed to build decorations', error as Error);
    return Decoration.none;
  } finally {
    endTimer();
  }
}

/**
 * Create markdown plugin with error handling
 */
function createMarkdownPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        log.info('MarkdownPlugin', 'Initializing plugin');
        try {
          this.decorations = buildMarkdownDecorations(view);
          log.info('MarkdownPlugin', 'Plugin initialized successfully');
        } catch (error) {
          log.critical('MarkdownPlugin', 'Failed to initialize plugin', error as Error);
          this.decorations = Decoration.none;
        }
      }

      update(update: ViewUpdate) {
        try {
          if (update.docChanged || update.viewportChanged) {
            this.decorations = buildMarkdownDecorations(update.view);
          }
        } catch (error) {
          log.error('MarkdownPlugin', 'Failed to update decorations', error as Error);
          this.decorations = Decoration.none;
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

export default function Editor({ currentFile, content, onContentChange, showToolbar = true }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef<string>(content);
  const initializedRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  log.debug('Editor', 'Rendering', { 
    hasFile: !!currentFile, 
    contentLength: content.length,
    showToolbar 
  });

  // Insert markdown syntax at cursor with error handling
  const handleInsert = useCallback((before: string, after: string = "") => {
    const endTimer = log.timer('Editor', 'handleInsert');
    
    try {
      if (!viewRef.current) {
        log.warn('Editor', 'handleInsert called but view is null');
        return;
      }

      const view = viewRef.current;
      const selection = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(selection.from, selection.to);

      const newText = before + selectedText + after;
      const transaction = view.state.update({
        changes: { from: selection.from, to: selection.to, insert: newText },
        selection: { anchor: selection.from + before.length + selectedText.length },
      });

      view.dispatch(transaction);
      view.focus();
      
      log.debug('Editor', 'Text inserted', { before, after, selectedLength: selectedText.length });
    } catch (error) {
      log.error('Editor', 'Failed to insert text', error as Error, { before, after });
      ErrorHandler.handle(error as Error, {
        component: 'Editor',
        operation: 'handleInsert',
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
      });
    } finally {
      endTimer();
    }
  }, []);

  // Initialize editor once with comprehensive error handling
  useEffect(() => {
    if (!editorRef.current || initializedRef.current) {
      return;
    }

    const endTimer = log.timer('Editor', 'initialization');
    log.info('Editor', 'Initializing CodeMirror editor');

    try {
      // Validate content
      if (typeof content !== 'string') {
        throw new Error(`Invalid content type: ${typeof content}`);
      }

      const markdownPlugin = createMarkdownPlugin();

      // Initialize CodeMirror editor
      const startState = EditorState.create({
        doc: content || "# Welcome to A3Note\n\nStart writing your notes here...",
        extensions: [
          basicSetup,
          markdown(),
          syntaxHighlighting(defaultHighlightStyle),
          EditorView.lineWrapping,
          markdownPlugin,
          keymap.of([
            {
              key: "Mod-b",
              run: () => { handleInsert("**", "**"); return true; },
            },
            {
              key: "Mod-i",
              run: () => { handleInsert("*", "*"); return true; },
            },
            {
              key: "Mod-k",
              run: () => { handleInsert("[", "](url)"); return true; },
            },
            {
              key: "Mod-`",
              run: () => { handleInsert("`", "`"); return true; },
            },
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newContent = update.state.doc.toString();
              contentRef.current = newContent;
              
              try {
                onContentChange(newContent);
              } catch (error) {
                log.error('Editor', 'onContentChange callback failed', error as Error);
              }
            }
          }),
          // ... (rest of baseTheme configuration remains the same)
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      viewRef.current = view;
      initializedRef.current = true;
      
      log.info('Editor', 'Editor initialized successfully', {
        docLength: view.state.doc.length,
        lineCount: view.state.doc.lines
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.critical('Editor', 'Failed to initialize editor', error as Error);
      setError(`Failed to initialize editor: ${errorMessage}`);
      
      ErrorHandler.handle(error as Error, {
        component: 'Editor',
        operation: 'initialization',
        severity: ErrorSeverity.CRITICAL,
        recoverable: false,
      });
    } finally {
      endTimer();
    }

    return () => {
      log.info('Editor', 'Cleaning up editor');
      if (viewRef.current) {
        try {
          viewRef.current.destroy();
          viewRef.current = null;
        } catch (error) {
          log.error('Editor', 'Error during cleanup', error as Error);
        }
      }
    };
  }, [handleInsert, onContentChange]);

  // Update content when prop changes
  useEffect(() => {
    if (!viewRef.current || contentRef.current === content) {
      return;
    }

    const endTimer = log.timer('Editor', 'contentUpdate');
    
    try {
      const view = viewRef.current;
      const currentContent = view.state.doc.toString();

      if (currentContent !== content) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
        });
        contentRef.current = content;
        log.debug('Editor', 'Content updated', { newLength: content.length });
      }
    } catch (error) {
      log.error('Editor', 'Failed to update content', error as Error);
    } finally {
      endTimer();
    }
  }, [content]);

  // Error display
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-red-900/20 border border-red-500">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Editor Error</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              initializedRef.current = false;
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {showToolbar && currentFile && (
        <MarkdownToolbar onInsert={handleInsert} />
      )}
      {currentFile === null && (
        <div className="absolute inset-0 flex items-center justify-center text-foreground/50 bg-background z-10">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Welcome to A3Note</h2>
            <p className="text-sm">Select a file or create a new one to start editing</p>
          </div>
        </div>
      )}
      <div ref={editorRef} className="flex-1 overflow-auto" />
    </div>
  );
}
