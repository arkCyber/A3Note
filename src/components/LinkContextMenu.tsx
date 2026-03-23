import { useRef, useEffect } from 'react';
import { ExternalLink, FileText, Copy, Edit } from 'lucide-react';
import { log } from '../utils/logger';

/**
 * Link Context Menu Component
 * Right-click menu for links in the editor
 */

export interface LinkContextMenuProps {
  x: number;
  y: number;
  link: string;
  linkText: string;
  onOpenLink?: () => void;
  onOpenInNewTab?: () => void;
  onCopyLink?: () => void;
  onEditLink?: () => void;
  onClose: () => void;
}

export default function LinkContextMenu({
  x,
  y,
  link,
  linkText,
  onOpenLink,
  onOpenInNewTab,
  onCopyLink,
  onEditLink,
  onClose,
}: LinkContextMenuProps) {
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
      log.info('[LinkContextMenu]', actionName, link);
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
        icon={<ExternalLink size={16} />}
        label="Open link"
        onClick={() => handleAction(onOpenLink, 'Open link')}
        disabled={!onOpenLink}
      />
      
      <MenuItem
        icon={<FileText size={16} />}
        label="Open in new tab"
        onClick={() => handleAction(onOpenInNewTab, 'Open in new tab')}
        disabled={!onOpenInNewTab}
      />

      <Separator />
      
      <MenuItem
        icon={<Copy size={16} />}
        label="Copy link"
        onClick={() => handleAction(onCopyLink, 'Copy link')}
        disabled={!onCopyLink}
      />
      
      <MenuItem
        icon={<Edit size={16} />}
        label="Edit link"
        onClick={() => handleAction(onEditLink, 'Edit link')}
        disabled={!onEditLink}
      />
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function MenuItem({ icon, label, onClick, disabled }: MenuItemProps) {
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
    </button>
  );
}

function Separator() {
  return <div className="h-px bg-border my-1" />;
}
