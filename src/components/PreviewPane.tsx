import { useState } from "react";
import MarkdownPreview from "./MarkdownPreview";
import { Eye, EyeOff } from "lucide-react";

interface PreviewPaneProps {
  content: string;
  isVisible: boolean;
  onToggle: () => void;
}

export default function PreviewPane({ content, isVisible, onToggle }: PreviewPaneProps) {
  const [scrollSync, setScrollSync] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-20 p-2 bg-secondary border border-border rounded-lg shadow-lg hover:bg-background transition-colors z-10"
        title="Show preview (⌘+E)"
      >
        <Eye size={18} className="text-foreground" />
      </button>
    );
  }

  return (
    <div className="w-1/2 flex flex-col border-l border-border bg-background">
      {/* Preview Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-secondary">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-muted" />
          <span className="text-sm font-medium">Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScrollSync(!scrollSync)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              scrollSync
                ? "bg-primary/20 text-primary"
                : "bg-background text-muted hover:text-foreground"
            }`}
            title="Toggle scroll sync"
          >
            Sync Scroll
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-background rounded transition-colors"
            title="Hide preview (⌘+E)"
          >
            <EyeOff size={16} className="text-muted" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-6">
        {content ? (
          <MarkdownPreview content={content} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted">
            <div className="text-center">
              <Eye size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Start writing to see preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
