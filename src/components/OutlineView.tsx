// Outline View - Aerospace Grade
// Displays document structure with heading navigation

import { useEffect, useState, useMemo } from 'react';
import { List, ChevronRight, ChevronDown } from 'lucide-react';
import { log } from '../utils/logger';

interface HeadingNode {
  level: number;
  text: string;
  line: number;
  children: HeadingNode[];
}

interface OutlineViewProps {
  content: string;
  onNavigateToLine?: (line: number) => void;
}

export default function OutlineView({ content, onNavigateToLine }: OutlineViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Parse headings from content
  const headings = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const headingNodes: HeadingNode[] = [];
    const stack: HeadingNode[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        
        const node: HeadingNode = {
          level,
          text,
          line: index + 1,
          children: [],
        };

        // Build tree structure
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          headingNodes.push(node);
        } else {
          stack[stack.length - 1].children.push(node);
        }

        stack.push(node);
      }
    });

    return headingNodes;
  }, [content]);

  // Auto-expand all by default
  useEffect(() => {
    const allLines = new Set<number>();
    const collectLines = (nodes: HeadingNode[]) => {
      nodes.forEach(node => {
        allLines.add(node.line);
        if (node.children.length > 0) {
          collectLines(node.children);
        }
      });
    };
    collectLines(headings);
    setExpandedNodes(allLines);
  }, [headings]);

  const toggleExpanded = (line: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(line)) {
      newExpanded.delete(line);
    } else {
      newExpanded.add(line);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNavigate = (line: number) => {
    log.debug('[OutlineView] Navigate to line:', line);
    onNavigateToLine?.(line);
  };

  const renderHeading = (node: HeadingNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.line);
    const indent = depth * 12;

    return (
      <div key={node.line}>
        <div
          className="flex items-center gap-1 py-1 px-2 hover:bg-secondary/50 cursor-pointer rounded group"
          style={{ paddingLeft: `${8 + indent}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.line);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-secondary rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-foreground/60" />
              ) : (
                <ChevronRight className="w-3 h-3 text-foreground/60" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <button
            onClick={() => handleNavigate(node.line)}
            className="flex-1 text-left text-sm truncate"
            style={{
              fontSize: `${16 - node.level}px`,
              fontWeight: node.level <= 2 ? 600 : 400,
              color: `rgba(var(--foreground), ${1 - node.level * 0.1})`,
            }}
          >
            {node.text}
          </button>

          <span className="text-xs text-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity">
            L{node.line}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderHeading(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-secondary">
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Outline</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {headings.length > 0 ? (
          <div>
            {headings.map(heading => renderHeading(heading))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-foreground/40">
            <p>No headings found</p>
            <p className="text-xs mt-1">Add headings to see document structure</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {headings.length > 0 && (
        <div className="px-3 py-2 border-t border-border bg-secondary/30 text-xs text-foreground/60">
          {headings.length} {headings.length === 1 ? 'heading' : 'headings'}
        </div>
      )}
    </div>
  );
}
