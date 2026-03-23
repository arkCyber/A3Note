import { useRef, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { log } from '../utils/logger';

/**
 * Tag Context Menu Component
 * Right-click menu for tags
 */

export interface TagContextMenuProps {
  x: number;
  y: number;
  tag: string;
  onSearch?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function TagContextMenu({
  x,
  y,
  tag,
  onSearch,
  onRename,
  onDelete,
  onClose,
}: TagContextMenuProps) {
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
      log.info('[TagContextMenu]', actionName, tag);
      action();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-secondary border border-border rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      <MenuItem
        icon={<Search size={16} />}
        label="Search tag"
        onClick={() => handleAction(onSearch, 'Search tag')}
        disabled={!onSearch}
      />
      
      <MenuItem
        icon={<Edit size={16} />}
        label="Rename tag"
        onClick={() => handleAction(onRename, 'Rename tag')}
        disabled={!onRename}
      />

      <Separator />
      
      <MenuItem
        icon={<Trash2 size={16} />}
        label="Delete tag"
        onClick={() => handleAction(onDelete, 'Delete tag')}
        disabled={!onDelete}
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
