import { useRef, useEffect } from 'react';
import {
  FileText,
  FileStack,
  ExternalLink,
  FolderOpen,
  Edit,
  Copy,
  Link as LinkIcon,
  FolderInput,
  Files,
  Star,
  Info,
  Trash2,
} from 'lucide-react';
import { FileItem } from '../types';
import { log } from '../utils/logger';

/**
 * Enhanced File Context Menu Component
 * Extended right-click menu for files with more operations
 */

export interface EnhancedFileContextMenuProps {
  x: number;
  y: number;
  file: FileItem;
  onOpen?: () => void;
  onOpenInNewTab?: () => void;
  onOpenInNewWindow?: () => void;
  onOpenToRight?: () => void;
  onRename?: () => void;
  onCopyPath?: () => void;
  onCopyObsidianURL?: () => void;
  onShowInExplorer?: () => void;
  onMoveTo?: () => void;
  onDuplicate?: () => void;
  onStar?: () => void;
  onProperties?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  isStarred?: boolean;
}

export default function EnhancedFileContextMenu({
  x,
  y,
  file,
  onOpen,
  onOpenInNewTab,
  onOpenInNewWindow,
  onOpenToRight,
  onRename,
  onCopyPath,
  onCopyObsidianURL,
  onShowInExplorer,
  onMoveTo,
  onDuplicate,
  onStar,
  onProperties,
  onDelete,
  onClose,
  isStarred = false,
}: EnhancedFileContextMenuProps) {
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
      log.info('[EnhancedFileContextMenu]', actionName, file.path);
      action();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-secondary border border-border rounded-lg shadow-lg py-1 min-w-[220px]"
      style={{ left: x, top: y }}
    >
      {/* Open operations */}
      <MenuItem
        icon={<FileText size={16} />}
        label="Open"
        onClick={() => handleAction(onOpen, 'Open')}
        disabled={!onOpen}
      />
      
      <MenuItem
        icon={<FileStack size={16} />}
        label="Open in new tab"
        shortcut="Ctrl+Click"
        onClick={() => handleAction(onOpenInNewTab, 'Open in new tab')}
        disabled={!onOpenInNewTab}
      />
      
      <MenuItem
        icon={<ExternalLink size={16} />}
        label="Open in new window"
        onClick={() => handleAction(onOpenInNewWindow, 'Open in new window')}
        disabled={!onOpenInNewWindow}
      />
      
      <MenuItem
        icon={<FileStack size={16} />}
        label="Open to the right"
        onClick={() => handleAction(onOpenToRight, 'Open to the right')}
        disabled={!onOpenToRight}
      />

      <Separator />

      {/* File operations */}
      <MenuItem
        icon={<Edit size={16} />}
        label="Rename"
        onClick={() => handleAction(onRename, 'Rename')}
        disabled={!onRename}
      />
      
      <MenuItem
        icon={<Copy size={16} />}
        label="Copy path"
        onClick={() => handleAction(onCopyPath, 'Copy path')}
        disabled={!onCopyPath}
      />
      
      <MenuItem
        icon={<LinkIcon size={16} />}
        label="Copy Obsidian URL"
        onClick={() => handleAction(onCopyObsidianURL, 'Copy Obsidian URL')}
        disabled={!onCopyObsidianURL}
      />
      
      <MenuItem
        icon={<FolderOpen size={16} />}
        label="Show in system explorer"
        onClick={() => handleAction(onShowInExplorer, 'Show in explorer')}
        disabled={!onShowInExplorer}
      />

      <Separator />

      {/* Advanced operations */}
      <MenuItem
        icon={<FolderInput size={16} />}
        label="Move to..."
        onClick={() => handleAction(onMoveTo, 'Move to')}
        disabled={!onMoveTo}
      />
      
      <MenuItem
        icon={<Files size={16} />}
        label="Duplicate"
        onClick={() => handleAction(onDuplicate, 'Duplicate')}
        disabled={!onDuplicate}
      />
      
      <MenuItem
        icon={<Star size={16} />}
        label={isStarred ? 'Remove from starred' : 'Add to starred'}
        onClick={() => handleAction(onStar, 'Toggle star')}
        disabled={!onStar}
      />

      <Separator />

      {/* Info and delete */}
      <MenuItem
        icon={<Info size={16} />}
        label="Properties"
        onClick={() => handleAction(onProperties, 'Properties')}
        disabled={!onProperties}
      />
      
      <MenuItem
        icon={<Trash2 size={16} />}
        label="Delete"
        onClick={() => handleAction(onDelete, 'Delete')}
        disabled={!onDelete}
        danger
      />
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function MenuItem({ icon, label, shortcut, onClick, disabled, danger }: MenuItemProps) {
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
      {shortcut && (
        <span className="text-xs text-foreground/40">{shortcut}</span>
      )}
    </button>
  );
}

function Separator() {
  return <div className="h-px bg-border my-1" />;
}
