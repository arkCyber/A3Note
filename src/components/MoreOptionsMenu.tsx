import { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  FileDown, 
  Globe, 
  FileText, 
  Link, 
  FolderOpen, 
  Info, 
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { FileItem } from '../types';
import { log } from '../utils/logger';

/**
 * More Options Menu Component
 * Provides additional file operations similar to Obsidian
 */

interface MoreOptionsMenuProps {
  currentFile: FileItem | null;
  onExportPDF?: () => void;
  onExportHTML?: () => void;
  onExportMarkdown?: () => void;
  onCopyLink?: () => void;
  onShowInFolder?: () => void;
  onProperties?: () => void;
  onDelete?: () => void;
}

export default function MoreOptionsMenu({
  currentFile,
  onExportPDF,
  onExportHTML,
  onExportMarkdown,
  onCopyLink,
  onShowInFolder,
  onProperties,
  onDelete,
}: MoreOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleAction = (action: (() => void) | undefined, actionName: string) => {
    if (action) {
      log.info('[MoreOptionsMenu]', actionName);
      action();
      setIsOpen(false);
    }
  };

  if (!currentFile) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-background rounded transition-colors"
        title="More options"
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-secondary border border-border rounded-lg shadow-lg z-50 py-1">
          {/* Export Section */}
          <div className="px-2 py-1">
            <div className="text-xs font-semibold text-foreground/50 px-2 py-1">
              Export
            </div>
            
            <MenuItem
              icon={<FileDown size={16} />}
              label="Export as PDF"
              onClick={() => handleAction(onExportPDF, 'Export PDF')}
              disabled={!onExportPDF}
            />
            
            <MenuItem
              icon={<Globe size={16} />}
              label="Export as HTML"
              onClick={() => handleAction(onExportHTML, 'Export HTML')}
              disabled={!onExportHTML}
            />
            
            <MenuItem
              icon={<FileText size={16} />}
              label="Export as Markdown"
              onClick={() => handleAction(onExportMarkdown, 'Export Markdown')}
              disabled={!onExportMarkdown}
            />
          </div>

          <div className="border-t border-border my-1" />

          {/* File Operations */}
          <div className="px-2 py-1">
            <MenuItem
              icon={<Copy size={16} />}
              label="Copy file path"
              onClick={() => handleAction(onCopyLink, 'Copy Link')}
              disabled={!onCopyLink}
            />
            
            <MenuItem
              icon={<Link size={16} />}
              label="Copy Obsidian URL"
              onClick={() => {
                if (currentFile) {
                  const url = `obsidian://open?vault=A3Note&file=${encodeURIComponent(currentFile.path)}`;
                  navigator.clipboard.writeText(url);
                  log.info('[MoreOptionsMenu] Copied Obsidian URL');
                  setIsOpen(false);
                }
              }}
            />
            
            <MenuItem
              icon={<FolderOpen size={16} />}
              label="Show in system explorer"
              onClick={() => handleAction(onShowInFolder, 'Show in Folder')}
              disabled={!onShowInFolder}
            />
            
            <MenuItem
              icon={<ExternalLink size={16} />}
              label="Open in default app"
              onClick={() => {
                if (currentFile) {
                  log.info('[MoreOptionsMenu] Open in default app:', currentFile.path);
                  // This would need Tauri integration
                  setIsOpen(false);
                }
              }}
            />
          </div>

          <div className="border-t border-border my-1" />

          {/* File Info & Actions */}
          <div className="px-2 py-1">
            <MenuItem
              icon={<Info size={16} />}
              label="File properties"
              onClick={() => handleAction(onProperties, 'Properties')}
              disabled={!onProperties}
            />
            
            <MenuItem
              icon={<Trash2 size={16} />}
              label="Delete file"
              onClick={() => handleAction(onDelete, 'Delete')}
              disabled={!onDelete}
              className="text-red-500 hover:bg-red-500/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

function MenuItem({ icon, label, onClick, disabled, className }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
