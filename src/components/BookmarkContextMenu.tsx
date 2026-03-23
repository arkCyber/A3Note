import { useRef, useEffect } from 'react';
import { FileText, FileStack, Edit, FolderInput, Trash2 } from 'lucide-react';
import { log } from '../utils/logger';

/**
 * Bookmark Context Menu Component
 * Right-click menu for bookmarks
 */

export interface BookmarkContextMenuProps {
  x: number;
  y: number;
  bookmarkId: string;
  bookmarkName: string;
  groups?: Array<{ id: string; name: string }>;
  onOpen?: () => void;
  onOpenInNewTab?: () => void;
  onRename?: () => void;
  onMoveToGroup?: (groupId: string) => void;
  onRemove?: () => void;
  onClose: () => void;
}

export default function BookmarkContextMenu({
  x,
  y,
  bookmarkId,
  bookmarkName,
  groups = [],
  onOpen,
  onOpenInNewTab,
  onRename,
  onMoveToGroup,
  onRemove,
  onClose,
}: BookmarkContextMenuProps) {
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

  const handleAction = (action: (() => void) | undefined, actionName: string) => {
    if (action) {
      log.info('[BookmarkContextMenu]', actionName, bookmarkId);
      action();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-secondary border border-border rounded-lg shadow-lg py-1 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      <MenuItem
        icon={<FileText size={16} />}
        label="Open"
        onClick={() => handleAction(onOpen, 'Open')}
        disabled={!onOpen}
      />
      
      <MenuItem
        icon={<FileStack size={16} />}
        label="Open in new tab"
        onClick={() => handleAction(onOpenInNewTab, 'Open in new tab')}
        disabled={!onOpenInNewTab}
      />

      <Separator />
      
      <MenuItem
        icon={<Edit size={16} />}
        label="Rename"
        onClick={() => handleAction(onRename, 'Rename')}
        disabled={!onRename}
      />

      {groups.length > 0 && onMoveToGroup && (
        <>
          <Separator />
          <div className="px-4 py-2 text-xs font-semibold text-foreground/50">
            Move to group
          </div>
          {groups.map(group => (
            <MenuItem
              key={group.id}
              icon={<FolderInput size={16} />}
              label={group.name}
              onClick={() => {
                log.info('[BookmarkContextMenu] Move to group', group.id);
                onMoveToGroup(group.id);
                onClose();
              }}
            />
          ))}
        </>
      )}

      <Separator />
      
      <MenuItem
        icon={<Trash2 size={16} />}
        label="Remove"
        onClick={() => handleAction(onRemove, 'Remove')}
        disabled={!onRemove}
        danger
      />
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function MenuItem({ icon, label, onClick, disabled, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : danger
          ? 'hover:bg-red-500/10 hover:text-red-500'
          : 'hover:bg-background'
      }`}
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

function Separator() {
  return <div className="h-px bg-border my-1" />;
}
