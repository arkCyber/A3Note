import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FileItem, FileContent, SearchResult } from "../types";

// File system operations
export const tauriApi = {
  // Read file content from disk
  async readFile(path: string): Promise<FileContent> {
    return await invoke<FileContent>("read_file_content", { path });
  },

  // Write content to file
  async writeFile(path: string, content: string): Promise<void> {
    await invoke("write_file_content", { path, content });
  },

  // List directory contents recursively
  async listDirectory(path: string): Promise<FileItem[]> {
    return await invoke<FileItem[]>("list_directory", { path });
  },

  // Create new file or directory
  async createFile(path: string, isDirectory: boolean): Promise<void> {
    await invoke("create_file", { path, isDirectory });
  },

  // Delete file or directory
  async deleteFile(path: string): Promise<void> {
    await invoke("delete_file", { path });
  },

  // Search for text in files
  async searchFiles(directory: string, query: string): Promise<SearchResult[]> {
    return await invoke<SearchResult[]>("search_files", { directory, query });
  },

  // Open directory picker dialog
  async openDirectoryDialog(): Promise<string | null> {
    const result = await open({
      directory: true,
      multiple: false,
      title: "Select Workspace Folder",
    });
    return result as string | null;
  },

  // Open file picker dialog
  async openFileDialog(): Promise<string | null> {
    const result = await open({
      directory: false,
      multiple: false,
      filters: [
        {
          name: "Markdown",
          extensions: ["md", "markdown"],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
      title: "Open File",
    });
    return result as string | null;
  },
};
