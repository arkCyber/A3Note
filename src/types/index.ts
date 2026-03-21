export interface FileItem {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: FileItem[];
  content?: string;
  modified?: number;
}

export interface FileContent {
  path: string;
  content: string;
}

export interface EditorState {
  content: string;
  cursorPosition: number;
  scrollPosition: number;
}

export interface SearchResult {
  path: string;
  line: number;
  column: number;
  snippet: string;
}
