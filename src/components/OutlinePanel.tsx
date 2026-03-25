/**
 * Outline Panel Component - Aerospace-grade UI
 * DO-178C Level A
 * Document outline navigation panel
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, Hash, List } from 'lucide-react';
import { OutlineItem } from '../services/OutlineService';

export interface OutlinePanelProps {
  outline: OutlineItem[];
  currentLine?: number;
  onNavigate: (line: number) => void;
  onClose?: () => void;
}

export default function OutlinePanel({
  outline,
  currentLine,
  onNavigate,
  onClose,
}: OutlinePanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (items: OutlineItem[]) => {
      items.forEach(item => {
        if (item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(outline);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const renderItem = (item: OutlineItem, depth: number = 0) => {
    const hasChildren = item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const isCurrent = currentLine !== undefined && 
                      currentLine >= item.line && 
                      (item.children.length === 0 || 
                       currentLine < (item.children[0]?.line || Infinity));

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            }
            onNavigate(item.line);
          }}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
            isCurrent
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-background'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={e => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-background/50 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <Hash size={14} className="flex-shrink-0 text-foreground/40" />

          <span className="flex-1 truncate">{item.text}</span>

          <span className="flex-shrink-0 text-xs text-foreground/40">
            {item.line}
          </span>
        </button>

        {hasChildren && isExpanded && (
          <div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (outline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-foreground/50">
        <List size={48} className="mb-4 opacity-20" />
        <p className="text-sm">No headings found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <List size={16} />
          <span className="font-semibold text-sm">Outline</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs hover:bg-background rounded transition-colors"
            title="Expand all"
          >
            Expand
          </button>
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-xs hover:bg-background rounded transition-colors"
            title="Collapse all"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Outline Tree */}
      <div className="flex-1 overflow-y-auto">
        {outline.map(item => renderItem(item))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border bg-background/50">
        <div className="text-xs text-foreground/50">
          {outline.length} {outline.length === 1 ? 'heading' : 'headings'}
        </div>
      </div>
    </div>
  );
}
