import { useEffect, useRef, useCallback, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState, Range } from "@codemirror/state";
import { syntaxHighlighting, defaultHighlightStyle, syntaxTree } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import { FileItem } from "../types";
import MarkdownToolbar from "./MarkdownToolbar";
import SemanticLinkSuggestion from "./SemanticLinkSuggestion";
import { log } from "../utils/logger";
import { ErrorHandler, ErrorSeverity } from "../utils/errorHandler";

interface EditorProps {
  currentFile: FileItem | null;
  content: string;
  onContentChange: (content: string) => void;
  showToolbar?: boolean;
}

export default function Editor({ currentFile, content, onContentChange, showToolbar = true }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef<string>(content);
  const initializedRef = useRef<boolean>(false);
  
  // Semantic link suggestion state
  const [showLinkSuggestion, setShowLinkSuggestion] = useState(false);
  const [linkTriggerPos, setLinkTriggerPos] = useState(0);

  // Create decorations for markdown headings with error handling
  const headingPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        const endTimer = log.timer('MarkdownPlugin', 'constructor');
        try {
          this.decorations = this.buildDecorations(view);
          log.debug('MarkdownPlugin', 'Plugin initialized successfully');
        } catch (error) {
          log.error('MarkdownPlugin', 'Failed to initialize plugin', error as Error);
          this.decorations = Decoration.none;
        } finally {
          endTimer();
        }
      }

      update(update: ViewUpdate) {
        try {
          if (update.docChanged || update.viewportChanged) {
            const endTimer = log.timer('MarkdownPlugin', 'update');
            this.decorations = this.buildDecorations(update.view);
            endTimer();
          }
        } catch (error) {
          log.error('MarkdownPlugin', 'Failed to update decorations', error as Error);
          this.decorations = Decoration.none;
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const decorations: Range<Decoration>[] = [];
        const tree = syntaxTree(view.state);

        for (const { from, to } of view.visibleRanges) {
          tree.iterate({
            from,
            to,
            enter: (node) => {
                  // Heading line decorations
                  if (node.name === "ATXHeading1") {
                    if (node.from >= 0 && node.from < view.state.doc.length) {
                      const line = view.state.doc.lineAt(node.from);
                      decorations.push(
                        Decoration.line({ class: "cm-heading-line cm-heading-line-1" }).range(line.from)
                      );
                    }
                  } else if (node.name === "ATXHeading2") {
                    if (node.from >= 0 && node.from < view.state.doc.length) {
                      const line = view.state.doc.lineAt(node.from);
                      decorations.push(
                        Decoration.line({ class: "cm-heading-line cm-heading-line-2" }).range(line.from)
                      );
                    }
              } else if (node.name === "ATXHeading3") {
                const line = view.state.doc.lineAt(node.from);
                decorations.push(
                  Decoration.line({ class: "cm-heading-line cm-heading-line-3" }).range(line.from)
                );
              } else if (node.name === "ATXHeading4") {
                const line = view.state.doc.lineAt(node.from);
                decorations.push(
                  Decoration.line({ class: "cm-heading-line cm-heading-line-4" }).range(line.from)
                );
              } else if (node.name === "ATXHeading5") {
                const line = view.state.doc.lineAt(node.from);
                decorations.push(
                  Decoration.line({ class: "cm-heading-line cm-heading-line-5" }).range(line.from)
                );
              } else if (node.name === "ATXHeading6") {
                const line = view.state.doc.lineAt(node.from);
                decorations.push(
                  Decoration.line({ class: "cm-heading-line cm-heading-line-6" }).range(line.from)
                );
              }
              
              // Bold text (StrongEmphasis)
              else if (node.name === "StrongEmphasis") {
                // Find the actual content (skip the ** markers)
                let contentStart = node.from;
                let contentEnd = node.to;
                const text = view.state.doc.sliceString(node.from, node.to);
                
                // Skip opening **
                if (text.startsWith("**") || text.startsWith("__")) {
                  contentStart += 2;
                }
                // Skip closing **
                if (text.endsWith("**") || text.endsWith("__")) {
                  contentEnd -= 2;
                }
                
                // Apply bold style to content
                if (contentStart < contentEnd) {
                  decorations.push(
                    Decoration.mark({ class: "cm-strong-content" }).range(contentStart, contentEnd)
                  );
                }
                
                // Dim the markers
                if (text.startsWith("**")) {
                  decorations.push(
                    Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.from + 2)
                  );
                }
                if (text.endsWith("**")) {
                  decorations.push(
                    Decoration.mark({ class: "cm-formatting-mark" }).range(node.to - 2, node.to)
                  );
                }
              }
              
              // Italic text (Emphasis)
              else if (node.name === "Emphasis") {
                let contentStart = node.from;
                let contentEnd = node.to;
                const text = view.state.doc.sliceString(node.from, node.to);
                
                // Skip opening * or _
                if (text.startsWith("*") || text.startsWith("_")) {
                  contentStart += 1;
                }
                // Skip closing * or _
                if (text.endsWith("*") || text.endsWith("_")) {
                  contentEnd -= 1;
                }
                
                // Apply italic style to content
                if (contentStart < contentEnd) {
                  decorations.push(
                    Decoration.mark({ class: "cm-em-content" }).range(contentStart, contentEnd)
                  );
                }
                
                // Dim the markers
                if (text.startsWith("*") || text.startsWith("_")) {
                  decorations.push(
                    Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.from + 1)
                  );
                }
                if (text.endsWith("*") || text.endsWith("_")) {
                  decorations.push(
                    Decoration.mark({ class: "cm-formatting-mark" }).range(node.to - 1, node.to)
                  );
                }
              }
              
              // Inline code
              else if (node.name === "InlineCode") {
                let contentStart = node.from;
                let contentEnd = node.to;
                const text = view.state.doc.sliceString(node.from, node.to);
                
                // Skip opening `
                if (text.startsWith("`")) {
                  contentStart += 1;
                }
                // Skip closing `
                if (text.endsWith("`")) {
                  contentEnd -= 1;
                }
                
                // Apply code style to content
                if (contentStart < contentEnd) {
                  decorations.push(
                    Decoration.mark({ class: "cm-code-content" }).range(contentStart, contentEnd)
                  );
                }
                
                // Dim the markers
                if (text.startsWith("`")) {
                  decorations.push(
                    Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.from + 1)
                  );
                }
                if (text.endsWith("`")) {
                  decorations.push(
                    Decoration.mark({ class: "cm-formatting-mark" }).range(node.to - 1, node.to)
                  );
                }
              }
              
              // Links
              else if (node.name === "Link") {
                // Style the link text
                decorations.push(
                  Decoration.mark({ class: "cm-link-text" }).range(node.from, node.to)
                );
              }
              else if (node.name === "URL") {
                // Dim the URL
                decorations.push(
                  Decoration.mark({ class: "cm-url-text" }).range(node.from, node.to)
                );
              }
              
              // Blockquotes
              else if (node.name === "Blockquote") {
                const line = view.state.doc.lineAt(node.from);
                decorations.push(
                  Decoration.line({ class: "cm-blockquote-line" }).range(line.from)
                );
              }
              else if (node.name === "QuoteMark") {
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.to)
                );
              }
              
              // Lists
              else if (node.name === "ListItem") {
                const line = view.state.doc.lineAt(node.from);
                decorations.push(
                  Decoration.line({ class: "cm-list-line" }).range(line.from)
                );
              }
              else if (node.name === "ListMark") {
                decorations.push(
                  Decoration.mark({ class: "cm-list-mark" }).range(node.from, node.to)
                );
              }
              
              // Strikethrough
              else if (node.name === "Strikethrough") {
                let contentStart = node.from;
                let contentEnd = node.to;
                const text = view.state.doc.sliceString(node.from, node.to);
                
                // Skip opening ~~
                if (text.startsWith("~~")) {
                  contentStart += 2;
                }
                // Skip closing ~~
                if (text.endsWith("~~")) {
                  contentEnd -= 2;
                }
                
                // Apply strikethrough style
                if (contentStart < contentEnd) {
                  decorations.push(
                    Decoration.mark({ class: "cm-strikethrough-content" }).range(contentStart, contentEnd)
                  );
                }
                
                // Dim the markers
                if (text.startsWith("~~")) {
                  decorations.push(
                    Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.from + 2)
                  );
                }
                if (text.endsWith("~~")) {
                  decorations.push(
                    Decoration.mark({ class: "cm-formatting-mark" }).range(node.to - 2, node.to)
                  );
                }
              }
              
              // Horizontal rule
              else if (node.name === "HorizontalRule") {
                const line = view.state.doc.lineAt(node.from);
                decorations.push(
                  Decoration.line({ class: "cm-hr-line" }).range(line.from)
                );
              }
              
              // Code blocks
              else if (node.name === "FencedCode" || node.name === "CodeBlock") {
                const line = view.state.doc.lineAt(node.from);
                decorations.push(
                  Decoration.line({ class: "cm-code-block-line" }).range(line.from)
                );
              }
              else if (node.name === "CodeMark") {
                decorations.push(
                  Decoration.mark({ class: "cm-formatting-mark" }).range(node.from, node.to)
                );
              }
            },
          });
        }

        return Decoration.set(decorations, true);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );

  // Insert markdown syntax at cursor
  const handleInsert = useCallback((before: string, after: string = "") => {
    if (!viewRef.current) return;

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
  }, []);

  // Initialize editor once
  useEffect(() => {
    if (!editorRef.current || initializedRef.current) {
      return;
    }

    // Initialize CodeMirror editor with Obsidian-style theme
    const startState = EditorState.create({
      doc: content || "# Welcome to A3Note\n\nStart writing your notes here...",
      extensions: [
        basicSetup,
        markdown(),
        syntaxHighlighting(defaultHighlightStyle),
        EditorView.lineWrapping,
        headingPlugin,
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
        EditorView.baseTheme({
          "&": { 
            backgroundColor: "#1e1e1e", 
            color: "#d4d4d4", 
            height: "100%",
            fontSize: "16px",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          },
          ".cm-content": { 
            caretColor: "#d4d4d4",
            padding: "10px 0"
          },
          ".cm-line": {
            padding: "0 20px",
            lineHeight: "1.6"
          },
          ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#d4d4d4" },
          "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
            backgroundColor: "#264f78"
          },
          ".cm-gutters": { 
            backgroundColor: "#1e1e1e", 
            color: "#858585", 
            border: "none",
            paddingRight: "10px"
          },
          // Markdown heading line styles (applied via decorations)
          ".cm-heading-line-1": { 
            fontSize: "2em", 
            fontWeight: "700",
            color: "#e0e0e0",
            lineHeight: "1.3"
          },
          ".cm-heading-line-2": { 
            fontSize: "1.6em", 
            fontWeight: "600",
            color: "#d4d4d4",
            lineHeight: "1.3"
          },
          ".cm-heading-line-3": { 
            fontSize: "1.3em", 
            fontWeight: "600",
            color: "#c4c4c4",
            lineHeight: "1.3"
          },
          ".cm-heading-line-4": { 
            fontSize: "1.1em", 
            fontWeight: "600",
            color: "#b4b4b4"
          },
          ".cm-heading-line-5": { 
            fontSize: "1em", 
            fontWeight: "600",
            color: "#a4a4a4"
          },
          ".cm-heading-line-6": { 
            fontSize: "0.9em", 
            fontWeight: "600",
            color: "#949494"
          },
          // Markdown formatting marks
          ".cm-formatting-header": {
            color: "#808080",
            fontWeight: "400"
          },
          // Formatting marks (**, *, `, etc.) - dimmed
          ".cm-formatting-mark": {
            opacity: "0.4",
            color: "#808080"
          },
          // Bold content
          ".cm-strong-content": { 
            fontWeight: "700",
            color: "#e0e0e0"
          },
          // Italic content
          ".cm-em-content": { 
            fontStyle: "italic",
            color: "#d4d4d4"
          },
          // Code content
          ".cm-code-content": {
            backgroundColor: "#2d2d2d",
            color: "#ce9178",
            padding: "2px 4px",
            borderRadius: "3px",
            fontFamily: "'Fira Code', 'Consolas', monospace",
            fontSize: "0.9em"
          },
          // Legacy syntax highlighting (fallback)
          ".cm-strong, .cm-emphasis": { 
            fontWeight: "700",
            color: "#e0e0e0"
          },
          ".cm-em": { 
            fontStyle: "italic",
            color: "#d4d4d4"
          },
          // Links
          ".cm-link-text": {
            color: "#4fc3f7",
            textDecoration: "underline",
            cursor: "pointer"
          },
          ".cm-url-text": {
            color: "#4fc3f7",
            opacity: "0.6"
          },
          // Blockquotes
          ".cm-blockquote-line": {
            color: "#9e9e9e",
            fontStyle: "italic",
            borderLeft: "3px solid #4a4a4a",
            paddingLeft: "12px",
            marginLeft: "4px"
          },
          // Lists
          ".cm-list-line": {
            paddingLeft: "4px"
          },
          ".cm-list-mark": {
            color: "#4fc3f7",
            fontWeight: "600"
          },
          // Strikethrough
          ".cm-strikethrough-content": {
            textDecoration: "line-through",
            color: "#9e9e9e",
            opacity: "0.7"
          },
          // Horizontal rule
          ".cm-hr-line": {
            color: "#616161",
            borderTop: "2px solid #4a4a4a",
            paddingTop: "8px",
            marginTop: "8px"
          },
          // Code blocks
          ".cm-code-block-line": {
            backgroundColor: "#2d2d2d",
            fontFamily: "'Fira Code', 'Consolas', monospace",
            fontSize: "0.9em"
          },
          // Legacy styles
          ".cm-link": { 
            color: "#4fc3f7",
            textDecoration: "underline"
          },
          ".cm-url": { 
            color: "#4fc3f7"
          },
          ".cm-quote": { 
            color: "#9e9e9e",
            fontStyle: "italic"
          },
          ".cm-list": {
            color: "#d4d4d4"
          },
          ".cm-monospace, .cm-code": {
            backgroundColor: "#2d2d2d",
            color: "#ce9178",
            padding: "2px 4px",
            borderRadius: "3px",
            fontFamily: "'Fira Code', 'Consolas', monospace"
          },
          ".cm-meta": {
            color: "#808080"
          },
          ".cm-hr": {
            color: "#616161"
          }
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            contentRef.current = newContent;
            onContentChange(newContent);
            
            // Check for [[ trigger for semantic link suggestions
            const cursorPos = update.state.selection.main.head;
            if (cursorPos >= 2) {
              const beforeCursor = newContent.slice(Math.max(0, cursorPos - 2), cursorPos);
              if (beforeCursor === '[[') {
                setShowLinkSuggestion(true);
                setLinkTriggerPos(cursorPos);
                log.debug('Editor', 'Link suggestion triggered at position', cursorPos);
              } else if (showLinkSuggestion && !newContent.slice(linkTriggerPos - 2, cursorPos).includes('[[')) {
                // Close if [[ was deleted
                setShowLinkSuggestion(false);
              }
            }
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    contentRef.current = content;
    initializedRef.current = true;

    return () => {
      viewRef.current?.destroy();
      initializedRef.current = false;
    };
  }, []);

  // Update editor content when file or content changes
  useEffect(() => {
    if (viewRef.current && content !== contentRef.current) {
      // Update editor content when file changes
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
      viewRef.current.dispatch(transaction);
      contentRef.current = content;
    }
  }, [currentFile, content]);

  // Handle link selection from semantic suggestions
  const handleSelectLink = useCallback((path: string, title: string) => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const cursorPos = view.state.selection.main.head;
    
    // Replace [[ with [[title]]
    const transaction = view.state.update({
      changes: {
        from: linkTriggerPos - 2,
        to: cursorPos,
        insert: `[[${title}]]`
      },
      selection: { anchor: linkTriggerPos - 2 + `[[${title}]]`.length }
    });
    
    view.dispatch(transaction);
    view.focus();
    setShowLinkSuggestion(false);
    
    log.info('Editor', `Inserted semantic link: ${title}`);
  }, [linkTriggerPos]);

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
      
      {/* Semantic Link Suggestions */}
      {showLinkSuggestion && currentFile && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <SemanticLinkSuggestion
            currentText={content}
            onSelectLink={handleSelectLink}
            onClose={() => setShowLinkSuggestion(false)}
            visible={showLinkSuggestion}
          />
        </div>
      )}
    </div>
  );
}
