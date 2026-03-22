import { useState, useEffect, useCallback } from "react";
import { tauriApi } from "../api/tauri";
import { FileItem } from "../types";

interface WorkspaceState {
  path: string | null;
  files: FileItem[];
  loading: boolean;
  error: string | null;
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    path: null,
    files: [],
    loading: false,
    error: null,
  });

  // Load workspace directory
  const loadWorkspace = useCallback(async (path: string) => {
    setWorkspace((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const files = await tauriApi.listDirectory(path);
      setWorkspace({
        path,
        files,
        loading: false,
        error: null,
      });
      localStorage.setItem("workspacePath", path);
    } catch (error) {
      setWorkspace((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load workspace",
      }));
    }
  }, []);

  // Load workspace from localStorage on mount
  useEffect(() => {
    const savedPath = localStorage.getItem("workspacePath");
    if (savedPath) {
      loadWorkspace(savedPath);
    }
  }, [loadWorkspace]);

  // Open workspace picker dialog
  const openWorkspace = useCallback(async () => {
    try {
      const path = await tauriApi.openDirectoryDialog();
      if (path) {
        await loadWorkspace(path);
      }
    } catch (error) {
      console.error("Failed to open workspace:", error);
    }
  }, [loadWorkspace]);

  // Refresh current workspace
  const refreshWorkspace = useCallback(async () => {
    if (workspace.path) {
      await loadWorkspace(workspace.path);
    }
  }, [workspace.path, loadWorkspace]);

  // Create new file in workspace
  const createFile = useCallback(
    async (name: string, isDirectory: boolean = false) => {
      if (!workspace.path) {
        return;
      }

      const fullPath = `${workspace.path}/${name}`;
      try {
        await tauriApi.createFile(fullPath, isDirectory);
        await refreshWorkspace();
      } catch (error) {
        console.error("Failed to create file:", error);
        throw error;
      }
    },
    [workspace.path, refreshWorkspace]
  );

  // Delete file from workspace
  const deleteFile = useCallback(
    async (path: string) => {
      try {
        await tauriApi.deleteFile(path);
        await refreshWorkspace();
      } catch (error) {
        console.error("Failed to delete file:", error);
        throw error;
      }
    },
    [refreshWorkspace]
  );

  return {
    workspace,
    openWorkspace,
    refreshWorkspace,
    createFile,
    deleteFile,
  };
}
