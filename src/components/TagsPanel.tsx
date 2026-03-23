// Tags Panel - Aerospace Grade
// Hierarchical tag management and navigation

import { useEffect, useState } from 'react';
import { Tag, ChevronRight, ChevronDown, Hash } from 'lucide-react';
import { log } from '../utils/logger';

interface TagNode {
  name: string;
  fullPath: string;
  count: number;
  children: TagNode[];
  files: string[];
}

interface TagsPanelProps {
  workspacePath: string;
  onNavigate: (path: string) => void;
  onTagFilter: (tag: string | null) => void;
}

export default function TagsPanel({ workspacePath, onNavigate, onTagFilter }: TagsPanelProps) {
  const [tagTree, setTagTree] = useState<TagNode[]>([]);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workspacePath) {
      loadTags();
    }
  }, [workspacePath]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      log.info('[TagsPanel] Loading tags from:', workspacePath);

      // Mock data for web environment
      const mockTagTree: TagNode[] = [
        {
          name: '工作',
          fullPath: '工作',
          count: 5,
          children: [
            {
              name: '项目',
              fullPath: '工作/项目',
              count: 3,
              children: [],
              files: ['/docs/project1.md', '/docs/project2.md', '/docs/project3.md'],
            },
          ],
          files: ['/docs/work1.md', '/docs/work2.md'],
        },
        {
          name: '个人',
          fullPath: '个人',
          count: 3,
          children: [],
          files: ['/docs/personal1.md', '/docs/personal2.md', '/docs/personal3.md'],
        },
      ];

      setTagTree(mockTagTree);
      log.info(`[TagsPanel] Loaded mock tags`);
    } catch (error) {
      log.error('[TagsPanel] Failed to load tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildTagTree = (tagMap: Map<string, { count: number; files: string[] }>): TagNode[] => {
    const root: TagNode[] = [];
    const nodeMap = new Map<string, TagNode>();

    // Sort tags alphabetically
    const sortedTags = Array.from(tagMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    sortedTags.forEach(([tag, data]) => {
      const parts = tag.split('/');
      let currentPath = '';
      let currentLevel = root;

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        let node = nodeMap.get(currentPath);
        
        if (!node) {
          node = {
            name: part,
            fullPath: currentPath,
            count: index === parts.length - 1 ? data.count : 0,
            children: [],
            files: index === parts.length - 1 ? data.files : [],
          };
          
          nodeMap.set(currentPath, node);
          currentLevel.push(node);
        }

        if (index === parts.length - 1) {
          node.count = data.count;
          node.files = data.files;
        }

        currentLevel = node.children;
      });
    });

    return root;
  };

  const toggleExpanded = (fullPath: string) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(fullPath)) {
      newExpanded.delete(fullPath);
    } else {
      newExpanded.add(fullPath);
    }
    setExpandedTags(newExpanded);
  };

  const handleTagClick = (node: TagNode) => {
    setSelectedTag(node.fullPath);
    onTagFilter(node.fullPath);
    log.info('[TagsPanel] Selected tag:', node.fullPath);
  };

  const renderTagNode = (node: TagNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedTags.has(node.fullPath);
    const isSelected = selectedTag === node.fullPath;
    const indent = depth * 12;

    return (
      <div key={node.fullPath}>
        <div
          className={`flex items-center gap-1 py-1 px-2 hover:bg-secondary/50 cursor-pointer rounded group ${
            isSelected ? 'bg-primary/20' : ''
          }`}
          style={{ paddingLeft: `${8 + indent}px` }}
          onClick={() => handleTagClick(node)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.fullPath);
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

          <Hash className="w-3 h-3 text-primary flex-shrink-0" />
          <span className="text-sm flex-1 truncate">{node.name}</span>
          <span className="text-xs text-foreground/40">{node.count}</span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTagNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalTags = tagTree.reduce((sum, node) => {
    const countNode = (n: TagNode): number => {
      return 1 + n.children.reduce((s, c) => s + countNode(c), 0);
    };
    return sum + countNode(node);
  }, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Tags</h3>
          </div>
          {selectedTag && (
            <button
              onClick={() => {
                setSelectedTag(null);
                onTagFilter(null);
              }}
              className="text-xs text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-foreground/60">
            Loading tags...
          </div>
        ) : tagTree.length > 0 ? (
          <div>
            {tagTree.map(node => renderTagNode(node))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-foreground/40">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tags found</p>
            <p className="text-xs mt-1">Add #tags to your notes</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {totalTags > 0 && (
        <div className="px-3 py-2 border-t border-border bg-secondary/30 text-xs text-foreground/60">
          {totalTags} {totalTags === 1 ? 'tag' : 'tags'}
        </div>
      )}
    </div>
  );
}
