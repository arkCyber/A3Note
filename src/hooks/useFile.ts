import { useState, useCallback, useEffect, useRef } from "react";
import { tauriApi } from "../api/tauri";
import { FileItem } from "../types";

interface FileState {
  currentFile: FileItem | null;
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useFile() {
  const [state, setState] = useState<FileState>({
    currentFile: null,
    content: "",
    isDirty: false,
    isSaving: false,
    error: null,
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Open and load file
  const openFile = useCallback(async (file: FileItem) => {
    if (!file || file.isDirectory) {
      return;
    }

    setState((prev) => ({ ...prev, error: null }));
    try {
      const fileContent = await tauriApi.readFile(file.path);
      setState({
        currentFile: file,
        content: fileContent?.content || '',
        isDirty: false,
        isSaving: false,
        error: null,
      });
    } catch (error) {
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
    [state.currentFile]
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
