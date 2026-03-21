import { FileItem } from "../types";

interface StatusBarProps {
  currentFile: FileItem | null;
  content: string;
  wordCount?: number;
  lineCount?: number;
  cursorPosition?: { line: number; column: number };
}

export default function StatusBar({
  currentFile,
  content,
  cursorPosition,
}: StatusBarProps) {
  // Calculate statistics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.split('\n').length;
  const charCount = content.length;

  return (
    <div className="h-6 bg-secondary border-t border-border flex items-center px-4 text-xs text-muted">
      <div className="flex items-center gap-4">
        {currentFile && (
          <>
            <span className="flex items-center gap-1">
              <span className="text-foreground/50">File:</span>
              <span>{currentFile.name}</span>
            </span>
            <span className="text-border">|</span>
          </>
        )}
        
        <span className="flex items-center gap-1">
          <span className="text-foreground/50">Words:</span>
          <span>{wordCount}</span>
        </span>
        
        <span className="text-border">|</span>
        
        <span className="flex items-center gap-1">
          <span className="text-foreground/50">Lines:</span>
          <span>{lineCount}</span>
        </span>
        
        <span className="text-border">|</span>
        
        <span className="flex items-center gap-1">
          <span className="text-foreground/50">Characters:</span>
          <span>{charCount}</span>
        </span>

        {cursorPosition && (
          <>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <span className="text-foreground/50">Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
            </span>
          </>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <span className="text-foreground/50">Markdown</span>
      </div>
    </div>
  );
}
