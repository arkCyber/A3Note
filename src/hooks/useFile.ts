import { useState, useCallback, useEffect, useRef } from "react";
import { tauriApi } from "../api/tauri";
import { FileItem } from "../types";

// Extract title from first line (Obsidian-style)
function extractTitleFromFirstLine(content: string): string | null {
  const lines = content.split('\n');
  if (lines.length === 0) return null;

  const firstLine = lines[0].trim();
  let title: string | null = null;

  // Check if first line is a markdown heading
  if (firstLine.match(/^#+\s+/)) {
    title = firstLine.replace(/^#+\s+/, '').trim() || null;
  } else if (firstLine.length > 0 && firstLine.length < 100) {
    title = firstLine;
  }

  return title;
}

interface FileState {
  currentFile: FileItem | null;
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useFile(onTitleChange?: (oldPath: string, newTitle: string) => void) {
  const [state, setState] = useState<FileState>({
    currentFile: null,
    content: "",
    isDirty: false,
    isSaving: false,
    error: null,
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTitleRef = useRef<string | null>(null);

  // Open and load file
  const openFile = useCallback(async (file: FileItem) => {
    if (!file || file.isDirectory) {
      return;
    }

    setState((prev) => ({ ...prev, error: null }));
    try {
      const fileContent = await tauriApi.readFile(file.path);
      const content = fileContent?.content || '';
      
      // Extract title from first line (Obsidian-style)
      const title = extractTitleFromFirstLine(content);
      lastTitleRef.current = title;
      
      setState({
        currentFile: file,
        content,
        isDirty: false,
        isSaving: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading file:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to open file",
      }));
    }
  }, []);

  // Save current file
  const saveFile = useCallback(async () => {
    if (!state.currentFile || !state.isDirty) {
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true, error: null }));
    try {
      await tauriApi.writeFile(state.currentFile.path, state.content);
      setState((prev) => ({ ...prev, isDirty: false, isSaving: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to save file",
      }));
    }
  }, [state.currentFile, state.content, state.isDirty]);

  // Update content with auto-save
  const updateContent = useCallback(
    (newContent: string) => {
      setState((prev) => ({
        ...prev,
        content: newContent,
        isDirty: prev.content !== newContent,
      }));

      // Check for title change (Obsidian-style: first line is filename)
      const newTitle = extractTitleFromFirstLine(newContent);
      if (newTitle && newTitle !== lastTitleRef.current && state.currentFile) {
        const oldTitle = lastTitleRef.current;
        lastTitleRef.current = newTitle;
        
        // Only trigger rename if title actually changed and not "未命名"
        if (oldTitle !== newTitle && !newTitle.startsWith('未命名') && onTitleChange) {
          onTitleChange(state.currentFile.path, newTitle);
        }
      } else if (!newTitle) {
        lastTitleRef.current = null;
      }

      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new auto-save timeout (2 seconds)
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (state.currentFile) {
          tauriApi.writeFile(state.currentFile.path, newContent).catch((error) => {
            console.error("Auto-save failed:", error);
          });
        }
      }, 2000);
    },
    [state.currentFile, onTitleChange]
  );

  // Create new file
  const createNewFile = useCallback(async (path: string) => {
    try {
      await tauriApi.createFile(path, false);
      const newFile: FileItem = {
        path,
        name: path.split("/").pop() || "Untitled.md",
        isDirectory: false,
      };
      await openFile(newFile);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to create file",
      }));
    }
  }, [openFile]);

  // Close current file
  const closeFile = useCallback(async () => {
    if (state.isDirty) {
      await saveFile();
    }
    setState({
      currentFile: null,
      content: "",
      isDirty: false,
      isSaving: false,
      error: null,
    });
  }, [state.isDirty, saveFile]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentFile: state.currentFile,
    content: state.content,
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    error: state.error,
    openFile,
    saveFile,
    updateContent,
    createNewFile,
    closeFile,
  };
}
