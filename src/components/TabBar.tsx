import { X } from "lucide-react";
import { FileItem } from "../types";

export interface Tab {
  id: string;
  file: FileItem;
  isDirty: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}

export default function TabBar({ tabs, activeTabId, onTabClick, onTabClose }: TabBarProps) {
  const handleCloseTab = (e: React.MouseEvent, tabId: string, isDirty: boolean) => {
    e.stopPropagation();
    
    if (isDirty) {
      if (confirm('File has unsaved changes. Close anyway?')) {
        onTabClose(tabId);
      }
    } else {
      onTabClose(tabId);
    }
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="h-10 bg-secondary border-b border-border flex items-center overflow-x-auto">
      <div className="flex items-center gap-1 px-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer
              transition-colors group min-w-0 max-w-[200px]
              ${activeTabId === tab.id
                ? 'bg-background text-foreground'
                : 'bg-secondary text-foreground/70 hover:bg-background/50'
              }
            `}
          >
            <span className="text-sm truncate flex-1">
              {tab.file.name}
            </span>
            {tab.isDirty && (
              <span className="text-accent text-xs">●</span>
            )}
            <button
              onClick={(e) => handleCloseTab(e, tab.id, tab.isDirty)}
              className={`
                p-0.5 rounded hover:bg-border/50 transition-colors
                ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              `}
              title="Close tab"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
