import { useState, useRef, useEffect } from 'react';
import { X, Pin, Copy, FolderOpen, MoreHorizontal } from 'lucide-react';
import { FileItem } from '../types';
import { log } from '../utils/logger';

/**
 * Enhanced Tab Bar Component
 * Supports drag & drop, pinning, context menu, and more
 */

export interface Tab {
  id: string;
  file: FileItem;
  isDirty: boolean;
  isPinned?: boolean;
}

interface EnhancedTabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabPin?: (id: string) => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  onNewTab?: () => void;
}

export default function EnhancedTabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabPin,
  onTabReorder,
  onNewTab,
}: EnhancedTabBarProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);

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

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    if (onTabReorder) {
      onTabReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const closeOtherTabs = (tabId: string) => {
    tabs.forEach(tab => {
      if (tab.id !== tabId && !tab.isPinned) {
        onTabClose(tab.id);
      }
    });
    setContextMenu(null);
  };

  const closeTabsToRight = (tabId: string) => {
    const index = tabs.findIndex(t => t.id === tabId);
    tabs.slice(index + 1).forEach(tab => {
      if (!tab.isPinned) {
        onTabClose(tab.id);
      }
    });
    setContextMenu(null);
  };

  const closeTabsToLeft = (tabId: string) => {
    const index = tabs.findIndex(t => t.id === tabId);
    tabs.slice(0, index).forEach(tab => {
      if (!tab.isPinned) {
        onTabClose(tab.id);
      }
    });
    setContextMenu(null);
  };

  const copyFilePath = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      navigator.clipboard.writeText(tab.file.path);
      log.info('[EnhancedTabBar] Copied file path:', tab.file.path);
    }
    setContextMenu(null);
  };

  if (tabs.length === 0) {
    return null;
  }

  // Separate pinned and unpinned tabs
  const pinnedTabs = tabs.filter(t => t.isPinned);
  const unpinnedTabs = tabs.filter(t => !t.isPinned);
  const sortedTabs = [...pinnedTabs, ...unpinnedTabs];

  return (
    <>
      <div className="h-10 bg-secondary border-b border-border flex items-center overflow-x-auto">
        <div className="flex items-center gap-1 px-2 flex-1">
          {sortedTabs.map((tab, index) => (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onTabClick(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer
                transition-colors group min-w-0 max-w-[200px] relative
                ${activeTabId === tab.id
                  ? 'bg-background text-foreground'
                  : 'bg-secondary text-foreground/70 hover:bg-background/50'
                }
                ${draggedIndex === index ? 'opacity-50' : ''}
              `}
              title={tab.file.path}
            >
              {tab.isPinned && (
                <Pin size={12} className="text-primary flex-shrink-0" />
              )}
              
              <span className="text-sm truncate flex-1">
                {tab.file.name}
              </span>
              
              {tab.isDirty && (
                <span className="text-accent text-xs">●</span>
              )}
              
              <button
                onClick={(e) => handleCloseTab(e, tab.id, tab.isDirty)}
                className={`
                  p-0.5 rounded hover:bg-border/50 transition-colors flex-shrink-0
                  ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                `}
                title="Close tab"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {onNewTab && (
          <button
            onClick={onNewTab}
            className="px-3 py-2 hover:bg-background/50 transition-colors border-l border-border"
            title="New tab"
            aria-label="New tab"
          >
            <span className="text-lg">+</span>
          </button>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tab={tabs.find(t => t.id === contextMenu.tabId)!}
          onClose={() => setContextMenu(null)}
          onPin={() => {
            if (onTabPin) {
              onTabPin(contextMenu.tabId);
            }
            setContextMenu(null);
          }}
          onCloseTab={() => {
            const tab = tabs.find(t => t.id === contextMenu.tabId);
            if (tab) {
              onTabClose(contextMenu.tabId);
            }
            setContextMenu(null);
          }}
          onCloseOthers={() => closeOtherTabs(contextMenu.tabId)}
          onCloseToRight={() => closeTabsToRight(contextMenu.tabId)}
          onCloseToLeft={() => closeTabsToLeft(contextMenu.tabId)}
          onCopyPath={() => copyFilePath(contextMenu.tabId)}
        />
      )}
    </>
  );
}

interface TabContextMenuProps {
  x: number;
  y: number;
  tab: Tab;
  onClose: () => void;
  onPin: () => void;
  onCloseTab: () => void;
  onCloseOthers: () => void;
  onCloseToRight: () => void;
  onCloseToLeft: () => void;
  onCopyPath: () => void;
}

function TabContextMenu({
  x,
  y,
  tab,
  onClose,
  onPin,
  onCloseTab,
  onCloseOthers,
  onCloseToRight,
  onCloseToLeft,
  onCopyPath,
}: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-secondary border border-border rounded-lg shadow-lg z-50 py-1 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      <MenuItem
        icon={<Pin size={16} />}
        label={tab.isPinned ? 'Unpin tab' : 'Pin tab'}
        onClick={onPin}
      />
      
      <MenuItem
        icon={<Copy size={16} />}
        label="Copy file path"
        onClick={onCopyPath}
      />
      
      <MenuItem
        icon={<FolderOpen size={16} />}
        label="Reveal in file explorer"
        onClick={() => {
          log.info('[TabContextMenu] Reveal in explorer:', tab.file.path);
          onClose();
        }}
      />

      <div className="border-t border-border my-1" />

      <MenuItem
        icon={<X size={16} />}
        label="Close"
        onClick={onCloseTab}
      />
      
      <MenuItem
        icon={<MoreHorizontal size={16} />}
        label="Close others"
        onClick={onCloseOthers}
      />
      
      <MenuItem
        icon={<MoreHorizontal size={16} />}
        label="Close tabs to the right"
        onClick={onCloseToRight}
      />
      
      <MenuItem
        icon={<MoreHorizontal size={16} />}
        label="Close tabs to the left"
        onClick={onCloseToLeft}
      />
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-background transition-colors"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
