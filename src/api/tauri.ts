import { FileItem, FileContent, SearchResult } from "../types";

export interface FileStats {
  isDirectory: boolean;
  size: number;
  mtime: number;
  ctime?: number;
}

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Lazy load Tauri APIs only when in Tauri environment
let invoke: any;
let open: any;

if (isTauri) {
  import("@tauri-apps/api/core").then(module => {
    invoke = module.invoke;
  });
  import("@tauri-apps/plugin-dialog").then(module => {
    open = module.open;
  });
}

// Mock data for browser development
const mockFiles: FileItem[] = [
  { path: "/demo/README.md", name: "README.md", isDirectory: false },
  { path: "/demo/notes", name: "notes", isDirectory: true },
  { path: "/demo/notes/note1.md", name: "note1.md", isDirectory: false },
  { path: "/demo/notes/note2.md", name: "note2.md", isDirectory: false },
];

const mockFileContents: Record<string, string> = {
  "/demo/README.md": "# Welcome to A3Note\n\nThis is a demo workspace.",
  "/demo/notes/note1.md": "# Note 1\n\nSample content for note 1.",
  "/demo/notes/note2.md": "# Note 2\n\nSample content for note 2.",
};

// File system operations
export const tauriApi = {
  // Read file content from disk
  async readFile(path: string): Promise<FileContent> {
    if (!isTauri || !invoke) {
      // Browser mock
      return {
        path,
        content: mockFileContents[path] || "# New File\n\nStart writing...",
      };
    }
    return await invoke("read_file_content", { path }) as Promise<FileContent>;
  },

  // Write content to file
  async writeFile(path: string, content: string): Promise<void> {
    if (!isTauri || !invoke) {
      // Browser mock
      mockFileContents[path] = content;
      console.log(`[Mock] Saved file: ${path}`);
      return;
    }
    await invoke("write_file_content", { path, content });
  },

  // List directory contents recursively
  async listDirectory(path: string): Promise<FileItem[]> {
    if (!isTauri || !invoke) {
      // Browser mock
      return mockFiles;
    }
    return await invoke("list_directory", { path }) as FileItem[];
  },

  // Create new file or directory
  async createFile(path: string, isDirectory: boolean): Promise<void> {
    if (!isTauri || !invoke) {
      // Browser mock
      const name = path.split("/").pop() || "untitled";
      mockFiles.push({ path, name, isDirectory });
      if (!isDirectory) {
        mockFileContents[path] = "";
      }
      console.log(`[Mock] Created ${isDirectory ? 'directory' : 'file'}: ${path}`);
      return;
    }
    await invoke("create_file", { path, isDirectory });
  },

  // Delete file or directory
  async deleteFile(path: string): Promise<void> {
    if (!isTauri || !invoke) {
      // Browser mock
      const index = mockFiles.findIndex(f => f.path === path);
      if (index !== -1) {
        mockFiles.splice(index, 1);
      }
      delete mockFileContents[path];
      console.log(`[Mock] Deleted: ${path}`);
      return;
    }
    await invoke("delete_file", { path });
  },

  // Search for text in files
  async searchFiles(directory: string, query: string): Promise<SearchResult[]> {
    if (!isTauri || !invoke) {
      // Browser mock
      const results: SearchResult[] = [];
      Object.entries(mockFileContents).forEach(([path, content]) => {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              path,
              line: index + 1,
              snippet: line,
            });
          }
        });
      });
      return results;
    }
    return await invoke("search_files", { directory, query }) as SearchResult[];
  },

  // Open directory picker dialog
  async openDirectoryDialog(): Promise<string | null> {
    if (!isTauri || !open) {
      // Browser mock
      console.log("[Mock] Opening directory dialog...");
      return "/demo";
    }
    const result = await open({
      directory: true,
      multiple: false,
      title: "Select Workspace Folder",
    });
    return result as string | null;
  },

  // Open file picker dialog
  async openFileDialog(): Promise<string | null> {
    if (!isTauri || !open) {
      console.log("[Mock] Opening file dialog...");
      return "/demo/README.md";
    }
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

  async readDir(path: string): Promise<Array<{ name: string; isDirectory: boolean }>> {
    try {
      const result = await this.listDirectory(path);
      return result.map(file => ({
        name: file.name,
        isDirectory: file.isDirectory,
      }));
    } catch {
      return [];
    }
  },

  async getFileStats(path: string): Promise<{ isDirectory: boolean; size: number; mtime: number }> {
    try {
      const result = await this.readFile(path);
      return {
        isDirectory: false,
        size: result.content.length,
        mtime: Date.now(),
      };
    } catch {
      try {
        await this.listDirectory(path);
        return {
          isDirectory: true,
          size: 0,
          mtime: Date.now(),
        };
      } catch {
        throw new Error('File or directory not found');
      }
    }
  },

  async moveToTrash(path: string): Promise<void> {
    await this.deleteFile(path);
  },
};
