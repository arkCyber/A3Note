import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Calendar } from 'lucide-react';
import { FileItem } from '../types';
import { applyGrouping, GroupingMode, FileGroup } from '../utils/dateGrouping';

/**
 * Date Grouped Sidebar Component
 * Displays files grouped by date
 */

interface DateGroupedSidebarProps {
  files: FileItem[];
  currentFile: FileItem | null;
  onFileSelect: (file: FileItem) => void;
  groupingMode?: GroupingMode;
  onGroupingModeChange?: (mode: GroupingMode) => void;
}

export default function DateGroupedSidebar({
  files,
  currentFile,
  onFileSelect,
  groupingMode = 'none',
  onGroupingModeChange,
}: DateGroupedSidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const groups = applyGrouping(files, groupingMode);

  const toggleGroup = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const renderGroup = (group: FileGroup) => {
    const isCollapsed = collapsedGroups.has(group.id);

    return (
      <div key={group.id} className="mb-2">
        {/* Group Header */}
        <button
          onClick={() => toggleGroup(group.id)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 rounded transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-foreground/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-foreground/60" />
          )}
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold flex-1 text-left">{group.label}</span>
          <span className="text-xs text-foreground/40">{group.files.length}</span>
        </button>

        {/* Group Files */}
        {!isCollapsed && (
          <div className="ml-6 mt-1 space-y-1">
            {group.files.map(file => (
              <button
                key={file.path}
                onClick={() => onFileSelect(file)}
                className={`
                  w-full flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-left
                  ${currentFile?.path === file.path
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-secondary/50'
                  }
                `}
              >
                <File className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{file.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with grouping selector */}
      <div className="px-3 py-2 border-b border-border bg-secondary">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Files</h3>
        </div>

        {onGroupingModeChange && (
          <select
            value={groupingMode}
            onChange={(e) => onGroupingModeChange(e.target.value as GroupingMode)}
            className="w-full px-2 py-1 text-xs bg-background border border-border rounded"
          >
            <option value="none">No Grouping</option>
            <option value="created">Group by Created Date</option>
            <option value="modified">Group by Modified Date</option>
            <option value="daily-notes">Group Daily Notes</option>
          </select>
        )}
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto py-2">
        {groups.length > 0 ? (
          groups.map(renderGroup)
        ) : (
          <div className="p-4 text-center text-sm text-foreground/40">
            No files found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border bg-secondary/30 text-xs text-foreground/60">
        {groups.reduce((sum, g) => sum + g.files.length, 0)} files in {groups.length} groups
      </div>
    </div>
  );
}
