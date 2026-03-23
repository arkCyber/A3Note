import { useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  RefreshCw,
  FilePlus,
  FolderPlus,
} from "lucide-react";
import { FileItem } from "../types";
import EnhancedFileContextMenu from "./EnhancedFileContextMenu";
import { useFileOperations } from "../hooks/useFileOperations";
import { useTranslation } from 'react-i18next';
import { log } from "../utils/logger";

/**
 * Sidebar with Enhanced File Context Menu
 * Demonstrates integration of EnhancedFileContextMenu
 */

interface SidebarWithEnhancedContextMenuProps {
  files: FileItem[];
  currentFile: FileItem | null;
  onFileSelect: (file: FileItem) => void;
  onDeleteFile: (path: string) => void;
  onRefresh: () => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
  onRename: (oldPath: string, newName: string) => void;
  onFileCreate: (path: string, content: string) => void;
  onFileMove: (oldPath: string, newPath: string) => void;
}

export default function SidebarWithEnhancedContextMenu({
  files,
  currentFile,
  onFileSelect,
  onDeleteFile,
  onRefresh,
  onCreateFile,
  onCreateFolder,
  onRename,
  onFileCreate,
  onFileMove,
}: SidebarWithEnhancedContextMenuProps) {
  const { t } = useTranslation('sidebar');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);
  
  const fileOps = useFileOperations();

  const handleNewFile = () => {
    const timestamp = Date.now();
    const fileName = `Untitled ${timestamp}.md`;
    onCreateFile(fileName);
    log.info('[SidebarWithEnhancedContextMenu] Created new file', fileName);
  };

  const handleNewFolder = () => {
    const folderName = prompt(t('prompts.enterFolderName'));
    if (folderName) {
      onCreateFolder(folderName);
      log.info('[SidebarWithEnhancedContextMenu] Created new folder', folderName);
    }
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Enhanced file operations
  const handleDuplicate = useCallback(async (file: FileItem) => {
    try {
      await fileOps.duplicateFile(file, onFileCreate);
      closeContextMenu();
    } catch (error) {
      log.error('[SidebarWithEnhancedContextMenu] Failed to duplicate file', error as Error);
      alert('Failed to duplicate file');
    }
  }, [fileOps, onFileCreate, closeContextMenu]);

  const handleMoveTo = useCallback((file: FileItem) => {
    const targetPath = prompt('Enter target folder path:');
    if (targetPath) {
      fileOps.moveFile(file, targetPath, onFileMove);
      closeContextMenu();
    }
  }, [fileOps, onFileMove, closeContextMenu]);

  const handleShowProperties = useCallback((file: FileItem) => {
    const props = fileOps.getFileProperties(file.path);
    if (props) {
      alert(`File Properties:\n\nPath: ${file.path}\nCreated: ${props.created}\nModified: ${props.modified}\nSize: ${props.size} bytes\nTags: ${props.tags.join(', ')}`);
    } else {
      alert(`File Properties:\n\nPath: ${file.path}\nName: ${file.name}\nType: ${file.isDirectory ? 'Folder' : 'File'}`);
    }
    closeContextMenu();
  }, [fileOps, closeContextMenu]);

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">{t('title')}</h2>
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-background rounded transition-colors"
            title={t('refresh')}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleNewFile}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
            title={t('contextMenu.newFile')}
          >
            <FilePlus size={14} />
            <span>{t('file')}</span>
          </button>
          <button
            onClick={handleNewFolder}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
            title={t('contextMenu.newFolder')}
          >
            <FolderPlus size={14} />
            <span>{t('folder')}</span>
          </button>
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {files.length === 0 ? (
          <div className="p-4 text-center text-sm text-foreground/50">
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

      {/* Enhanced Context Menu */}
      {contextMenu && (
        <EnhancedFileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onOpen={() => {
            onFileSelect(contextMenu.file);
            closeContextMenu();
          }}
          onOpenInNewTab={() => {
            fileOps.openInNewTab(contextMenu.file, onFileSelect);
            closeContextMenu();
          }}
          onOpenInNewWindow={() => {
            fileOps.openInNewWindow(contextMenu.file);
            closeContextMenu();
          }}
          onOpenToRight={() => {
            fileOps.openToRight(contextMenu.file, onFileSelect);
            closeContextMenu();
          }}
          onRename={() => {
            const newName = prompt(t('prompts.enterNewName'), contextMenu.file.name);
            if (newName && newName !== contextMenu.file.name) {
              onRename(contextMenu.file.path, newName);
            }
            closeContextMenu();
          }}
          onCopyPath={() => {
            fileOps.copyPath(contextMenu.file.path);
            closeContextMenu();
          }}
          onCopyObsidianURL={() => {
            fileOps.copyObsidianURL(contextMenu.file);
            closeContextMenu();
          }}
          onShowInExplorer={() => {
            fileOps.showInExplorer(contextMenu.file.path);
            closeContextMenu();
          }}
          onMoveTo={() => handleMoveTo(contextMenu.file)}
          onDuplicate={() => handleDuplicate(contextMenu.file)}
          onStar={() => {
            fileOps.toggleStar(contextMenu.file.path);
            closeContextMenu();
          }}
          onProperties={() => handleShowProperties(contextMenu.file)}
          onDelete={() => {
            if (confirm(t('prompts.confirmDelete'))) {
              onDeleteFile(contextMenu.file.path);
            }
            closeContextMenu();
          }}
          isStarred={fileOps.isStarred(contextMenu.file.path)}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

// FileTreeItem component (simplified)
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
      onFileSelect(file);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, file);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-secondary transition-colors ${
          isActive ? "bg-primary/20 text-primary" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {file.isDirectory ? (
          <>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {expanded ? <FolderOpen size={16} /> : <Folder size={16} />}
          </>
        ) : (
          <File size={16} className="ml-4" />
        )}
        <span className="text-sm truncate">{file.name}</span>
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
