import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, RefreshCw, Trash2, Edit, Copy, FilePlus, FolderPlus } from "lucide-react";
import { FileItem } from "../types";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  files: FileItem[];
  currentFile: FileItem | null;
  onFileSelect: (file: FileItem) => void;
  onDeleteFile: (path: string) => void;
  onRefresh: () => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
  onRename: (oldPath: string, newName: string) => void;
}

export default function Sidebar({ files, currentFile, onFileSelect, onDeleteFile, onRefresh, onCreateFile, onCreateFolder, onRename }: SidebarProps) {
  const { t } = useTranslation('sidebar');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);

  const handleNewFile = () => {
    // Create default unnamed file immediately (Obsidian-style)
    const timestamp = Date.now();
    const fileName = `未命名-${timestamp}.md`;
    onCreateFile(fileName);
  };

  const handleNewFolder = () => {
    // Create default unnamed folder immediately (Obsidian-style)
    const timestamp = Date.now();
    const folderName = `未命名文件夹-${timestamp}`;
    onCreateFolder(folderName);
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const getContextMenuItems = (file: FileItem): ContextMenuItem[] => {
    if (file.isDirectory) {
      return [
        {
          label: t('contextMenu.newFile'),
          icon: <FilePlus size={16} />,
          onClick: () => {
            const timestamp = Date.now();
            const fileName = `未命名-${timestamp}.md`;
            onCreateFile(`${file.path}/${fileName}`);
          },
        },
        {
          label: t('contextMenu.newFolder'),
          icon: <FolderPlus size={16} />,
          onClick: () => {
            const timestamp = Date.now();
            const folderName = `未命名文件夹-${timestamp}`;
            onCreateFolder(`${file.path}/${folderName}`);
          },
        },
        { separator: true } as ContextMenuItem,
        {
          label: t('contextMenu.rename'),
          icon: <Edit size={16} />,
          onClick: () => {
            const newName = prompt(t('prompts.enterNewName'), file.name);
            if (newName && newName !== file.name) {
              onRename(file.path, newName);
            }
          },
        },
        {
          label: t('contextMenu.delete'),
          icon: <Trash2 size={16} />,
          onClick: () => {
            if (confirm(t('prompts.confirmDelete'))) {
              onDeleteFile(file.path);
            }
          },
          danger: true,
        },
      ];
    } else {
      return [
        {
          label: t('contextMenu.open'),
          icon: <File size={16} />,
          onClick: () => onFileSelect(file),
        },
        { separator: true } as ContextMenuItem,
        {
          label: t('contextMenu.rename'),
          icon: <Edit size={16} />,
          onClick: () => {
            const newName = prompt(t('prompts.enterNewName'), file.name);
            if (newName && newName !== file.name) {
              onRename(file.path, newName);
            }
          },
        },
        {
          label: t('contextMenu.copyPath'),
          icon: <Copy size={16} />,
          onClick: () => {
            navigator.clipboard.writeText(file.path);
          },
        },
        { separator: true } as ContextMenuItem,
        {
          label: t('contextMenu.delete'),
          icon: <Trash2 size={16} />,
          onClick: () => {
            if (confirm(t('prompts.confirmDelete'))) {
              onDeleteFile(file.path);
            }
          },
          danger: true,
        },
      ];
    }
  };

  return (
    <div className="w-64 bg-secondary border-r border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">{t('title')}</h2>
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title={t('refresh')}
            aria-label={t('refresh')}
          >
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNewFile}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title={t('contextMenu.newFile')}
            aria-label={t('contextMenu.newFile')}
          >
            <FilePlus size={14} />
            <span>{t('file')}</span>
          </button>
          <button
            onClick={handleNewFolder}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title={t('contextMenu.newFolder')}
            aria-label={t('contextMenu.newFolder')}
          >
            <FolderPlus size={14} />
            <span>{t('folder')}</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="text-sm text-foreground/50 p-4 text-center">
            {t('noFiles')}
          </div>
        ) : (
          files.map((file) => (
            <FileTreeItem
              key={file.path}
              file={file}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onDeleteFile={onDeleteFile}
              onContextMenu={handleContextMenu}
              level={0}
            />
          ))
        )}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems(contextMenu.file)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

interface FileTreeItemProps {
  file: FileItem;
  currentFile: FileItem | null;
  onFileSelect: (file: FileItem) => void;
  onDeleteFile: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, file: FileItem) => void;
  level: number;
}

function FileTreeItem({ file, currentFile, onFileSelect, onDeleteFile, onContextMenu, level }: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isActive = currentFile?.path === file.path;

  const handleClick = () => {
    if (file.isDirectory) {
      setExpanded(!expanded);
    } else {
      // Single click to open file (Obsidian-style)
      onFileSelect(file);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteFile(file.path);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, file);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent/10 hover:shadow-sm transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isActive ? "bg-primary/20 border border-primary/30" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        tabIndex={0}
        role="button"
        aria-label={file.isDirectory ? `Folder: ${file.name}` : `File: ${file.name}`}
      >
        {file.isDirectory ? (
          <>
            {expanded ? (
              <ChevronDown size={14} className="text-foreground/70 group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight size={14} className="text-foreground/70 group-hover:text-foreground transition-colors" />
            )}
            {expanded ? (
              <FolderOpen size={16} className="text-accent group-hover:scale-110 transition-transform" />
            ) : (
              <Folder size={16} className="text-accent group-hover:scale-110 transition-transform" />
            )}
          </>
        ) : (
          <>
            <div className="w-3.5" />
            <File size={16} className="text-foreground/70 group-hover:text-primary group-hover:scale-110 transition-all" />
          </>
        )}
        <span className="text-sm truncate flex-1 group-hover:text-foreground transition-colors">{file.name}</span>
        {!file.isDirectory && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded transition-all"
            title="Delete"
          >
            <Trash2 size={12} className="text-foreground/50 hover:text-red-500" />
          </button>
        )}
      </div>
      {file.isDirectory && expanded && file.children && (
        <div>
          {file.children.map((child) => (
            <FileTreeItem
              key={child.path}
              file={child}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onDeleteFile={onDeleteFile}
              onContextMenu={onContextMenu}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
