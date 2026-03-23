import { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Copy,
  Clipboard,
  Search,
  Replace,
  MousePointer,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Bold,
  Italic,
  Highlighter,
  Strikethrough,
} from 'lucide-react';
import { log } from '../utils/logger';

/**
 * Editor Context Menu Component
 * Right-click menu for text editing operations
 */

export interface EditorContextMenuProps {
  x: number;
  y: number;
  selectedText: string;
  hasSelection: boolean;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onFind?: () => void;
  onReplace?: () => void;
  onInsertLink?: () => void;
  onInsertImage?: () => void;
  onInsertCodeBlock?: () => void;
  onBold?: () => void;
  onItalic?: () => void;
  onHighlight?: () => void;
  onStrikethrough?: () => void;
  onClose: () => void;
}

export default function EditorContextMenu({
  x,
  y,
  selectedText,
  hasSelection,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onFind,
  onReplace,
  onInsertLink,
  onInsertImage,
  onInsertCodeBlock,
  onBold,
  onItalic,
  onHighlight,
  onStrikethrough,
  onClose,
}: EditorContextMenuProps) {
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
      log.info('[EditorContextMenu]', actionName);
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
      {/* Basic editing operations */}
      <MenuItem
        icon={<Scissors size={16} />}
        label="Cut"
        shortcut="Ctrl+X"
        onClick={() => handleAction(onCut, 'Cut')}
        disabled={!hasSelection || !onCut}
      />
      
      <MenuItem
        icon={<Copy size={16} />}
        label="Copy"
        shortcut="Ctrl+C"
        onClick={() => handleAction(onCopy, 'Copy')}
        disabled={!hasSelection || !onCopy}
      />
      
      <MenuItem
        icon={<Clipboard size={16} />}
        label="Paste"
        shortcut="Ctrl+V"
        onClick={() => handleAction(onPaste, 'Paste')}
        disabled={!onPaste}
      />

      <Separator />

      {/* Search operations */}
      <MenuItem
        icon={<Search size={16} />}
        label="Find"
        shortcut="Ctrl+F"
        onClick={() => handleAction(onFind, 'Find')}
        disabled={!onFind}
      />
      
      <MenuItem
        icon={<Replace size={16} />}
        label="Replace"
        shortcut="Ctrl+H"
        onClick={() => handleAction(onReplace, 'Replace')}
        disabled={!onReplace}
      />
      
      <MenuItem
        icon={<MousePointer size={16} />}
        label="Select all"
        shortcut="Ctrl+A"
        onClick={() => handleAction(onSelectAll, 'Select all')}
        disabled={!onSelectAll}
      />

      <Separator />

      {/* Insert operations */}
      <MenuItem
        icon={<LinkIcon size={16} />}
        label="Insert link"
        shortcut="Ctrl+K"
        onClick={() => handleAction(onInsertLink, 'Insert link')}
        disabled={!onInsertLink}
      />
      
      <MenuItem
        icon={<ImageIcon size={16} />}
        label="Insert image"
        onClick={() => handleAction(onInsertImage, 'Insert image')}
        disabled={!onInsertImage}
      />
      
      <MenuItem
        icon={<Code size={16} />}
        label="Insert code block"
        onClick={() => handleAction(onInsertCodeBlock, 'Insert code block')}
        disabled={!onInsertCodeBlock}
      />

      {hasSelection && (
        <>
          <Separator />

          {/* Formatting operations */}
          <MenuItem
            icon={<Bold size={16} />}
            label="Bold"
            shortcut="Ctrl+B"
            onClick={() => handleAction(onBold, 'Bold')}
            disabled={!onBold}
          />
          
          <MenuItem
            icon={<Italic size={16} />}
            label="Italic"
            shortcut="Ctrl+I"
            onClick={() => handleAction(onItalic, 'Italic')}
            disabled={!onItalic}
          />
          
          <MenuItem
            icon={<Highlighter size={16} />}
            label="Highlight"
            shortcut="Ctrl+Shift+H"
            onClick={() => handleAction(onHighlight, 'Highlight')}
            disabled={!onHighlight}
          />
          
          <MenuItem
            icon={<Strikethrough size={16} />}
            label="Strikethrough"
            onClick={() => handleAction(onStrikethrough, 'Strikethrough')}
            disabled={!onStrikethrough}
          />
        </>
      )}
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}

function MenuItem({ icon, label, shortcut, onClick, disabled }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
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
