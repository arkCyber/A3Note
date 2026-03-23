import { ReactNode } from "react";
import { FileItem } from "../types";
import MarkdownStats from "./MarkdownStats";

interface StatusBarProps {
  currentFile: FileItem | null;
  content: string;
  cursorPosition?: { line: number; column: number };
  children?: ReactNode;
}

export default function StatusBar({
  currentFile,
  content,
  cursorPosition,
}: StatusBarProps) {
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
            <MarkdownStats content={content} />
          </>
        )}

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
