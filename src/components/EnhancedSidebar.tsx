/**
 * Enhanced Sidebar Component - Obsidian Aligned
 * Includes search, sorting, keyboard navigation, and more
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  RefreshCw,
  Trash2,
  Edit,
  Copy,
  FilePlus,
  FolderPlus,
  Search,
  X,
  ChevronsRight,
  SortAsc,
  SortDesc,
  Clock,
  Type,
} from "lucide-react";
import { FileItem } from "../types";
import ContextMenu, { ContextMenuItem } from "./ContextMenu";
import { useTranslation } from "react-i18next";
import { log } from "../utils/logger";
import { ErrorHandler, ErrorSeverity } from "../utils/errorHandler";

type SortBy = "name" | "modified" | "created";
type SortOrder = "asc" | "desc";

interface EnhancedSidebarProps {
  files: FileItem[];
  currentFile: FileItem | null;
  onFileSelect: (file: FileItem) => void;
  onDeleteFile: (path: string) => void;
  onRefresh: () => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
  onRename: (oldPath: string, newName: string) => void;
}

export default function EnhancedSidebar({
  files,
  currentFile,
  onFileSelect,
  onDeleteFile,
  onRefresh,
  onCreateFile,
  onCreateFolder,
  onRename,
}: EnhancedSidebarProps) {
  const { t } = useTranslation("sidebar");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  log.debug("EnhancedSidebar", "Rendering", {
    fileCount: files.length,
    searchQuery,
    sortBy,
    sortOrder,
  });

  // File statistics
  const fileStats = useMemo(() => {
    let fileCount = 0;
    let folderCount = 0;

    const count = (items: FileItem[]) => {
      items.forEach((item) => {
        if (item.isDirectory) {
          folderCount++;
          if (item.children) count(item.children);
        } else {
          fileCount++;
        }
      });
    };

    count(files);
    return { fileCount, folderCount };
  }, [files]);

  // Search and filter files
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;

    const endTimer = log.timer("EnhancedSidebar", "filterFiles");

    const filterRecursive = (items: FileItem[]): FileItem[] => {
      return items
        .map((item) => {
          const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

          if (item.isDirectory && item.children) {
            const filteredChildren = filterRecursive(item.children);
            if (filteredChildren.length > 0 || matchesSearch) {
              return { ...item, children: filteredChildren };
            }
            return null;
          }

          return matchesSearch ? item : null;
        })
        .filter((item): item is FileItem => item !== null);
    };

    const result = filterRecursive(files);
    endTimer();
    log.debug("EnhancedSidebar", "Filtered files", {
      query: searchQuery,
      resultCount: result.length,
    });

    return result;
  }, [files, searchQuery]);

  // Sort files
  const sortedFiles = useMemo(() => {
    const endTimer = log.timer("EnhancedSidebar", "sortFiles");

    const sortRecursive = (items: FileItem[]): FileItem[] => {
      const sorted = [...items].sort((a, b) => {
        // Folders first
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        let comparison = 0;

        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "modified":
            comparison = (a.modified || 0) - (b.modified || 0);
            break;
          case "created":
            comparison = (a.created || 0) - (b.created || 0);
            break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });

      return sorted.map((item) => {
        if (item.isDirectory && item.children) {
          return { ...item, children: sortRecursive(item.children) };
        }
        return item;
      });
    };

    const result = sortRecursive(filteredFiles);
    endTimer();

    return result;
  }, [filteredFiles, sortBy, sortOrder]);

  const handleNewFile = useCallback(() => {
    try {
      const timestamp = Date.now();
      const fileName = `未命名-${timestamp}.md`;
      onCreateFile(fileName);
      log.info("EnhancedSidebar", "Created new file", { fileName });
    } catch (error) {
      log.error("EnhancedSidebar", "Failed to create file", error as Error);
      ErrorHandler.handle(error as Error, {
        component: "EnhancedSidebar",
        operation: "handleNewFile",
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
      });
    }
  }, [onCreateFile]);

  const handleNewFolder = useCallback(() => {
    try {
      const timestamp = Date.now();
      const folderName = `未命名文件夹-${timestamp}`;
      onCreateFolder(folderName);
      log.info("EnhancedSidebar", "Created new folder", { folderName });
    } catch (error) {
      log.error("EnhancedSidebar", "Failed to create folder", error as Error);
      ErrorHandler.handle(error as Error, {
        component: "EnhancedSidebar",
        operation: "handleNewFolder",
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
      });
    }
  }, [onCreateFolder]);

  const handleContextMenu = useCallback((e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
    log.debug("EnhancedSidebar", "Context menu opened", { file: file.name });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    log.debug("EnhancedSidebar", "Search query changed", { query });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
    log.debug("EnhancedSidebar", "Search cleared");
  }, []);

  const toggleSort = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    log.debug("EnhancedSidebar", "Sort order toggled", { newOrder: sortOrder === "asc" ? "desc" : "asc" });
  }, [sortOrder]);

  const collapseAll = useCallback(() => {
    setExpandedFolders(new Set());
    log.debug("EnhancedSidebar", "Collapsed all folders");
  }, []);

  const getContextMenuItems = useCallback(
    (file: FileItem): ContextMenuItem[] => {
      if (file.isDirectory) {
        return [
          {
            label: t("contextMenu.newFile"),
            icon: <FilePlus size={16} />,
            onClick: () => {
              const timestamp = Date.now();
              const fileName = `未命名-${timestamp}.md`;
              onCreateFile(`${file.path}/${fileName}`);
            },
          },
          {
            label: t("contextMenu.newFolder"),
            icon: <FolderPlus size={16} />,
            onClick: () => {
              const timestamp = Date.now();
              const folderName = `未命名文件夹-${timestamp}`;
              onCreateFolder(`${file.path}/${folderName}`);
            },
          },
          { separator: true } as ContextMenuItem,
          {
            label: t("contextMenu.rename"),
            icon: <Edit size={16} />,
            onClick: () => {
              const newName = prompt(t("prompts.enterNewName"), file.name);
              if (newName && newName !== file.name) {
                onRename(file.path, newName);
              }
            },
          },
          {
            label: t("contextMenu.delete"),
            icon: <Trash2 size={16} />,
            onClick: () => {
              if (confirm(t("prompts.confirmDelete"))) {
                onDeleteFile(file.path);
              }
            },
            danger: true,
          },
        ];
      } else {
        return [
          {
            label: t("contextMenu.open"),
            icon: <File size={16} />,
            onClick: () => onFileSelect(file),
          },
          { separator: true } as ContextMenuItem,
          {
            label: t("contextMenu.rename"),
            icon: <Edit size={16} />,
            onClick: () => {
              const newName = prompt(t("prompts.enterNewName"), file.name);
              if (newName && newName !== file.name) {
                onRename(file.path, newName);
              }
            },
          },
          {
            label: t("contextMenu.copyPath"),
            icon: <Copy size={16} />,
            onClick: () => {
              navigator.clipboard.writeText(file.path);
            },
          },
          { separator: true } as ContextMenuItem,
          {
            label: t("contextMenu.delete"),
            icon: <Trash2 size={16} />,
            onClick: () => {
              if (confirm(t("prompts.confirmDelete"))) {
                onDeleteFile(file.path);
              }
            },
            danger: true,
          },
        ];
      }
    },
    [t, onCreateFile, onCreateFolder, onRename, onDeleteFile, onFileSelect]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-64 bg-secondary border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t("title")}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFile}
            className="p-1.5 hover:bg-background rounded transition-colors text-primary"
            title={t("actions.newFile")}
          >
            <FilePlus size={16} />
          </button>
          <button
            onClick={collapseAll}
            className="p-1.5 hover:bg-background rounded transition-colors"
            title={t("actions.collapseAll")}
          >
            <ChevronsRight size={16} />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-background rounded transition-colors"
            title={t("actions.refresh")}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-2 border-b border-border">
        <div className="flex gap-2">
          <button
            onClick={handleNewFile}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
            title={t("contextMenu.newFile")}
          >
            <FilePlus size={14} />
            <span>{t("file")}</span>
          </button>
          <button
            onClick={handleNewFolder}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
            title={t("contextMenu.newFolder")}
          >
            <FolderPlus size={14} />
            <span>{t("folder")}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground/50" size={14} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索文件... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setSortBy("name")}
            className={`p-1 rounded transition-colors ${
              sortBy === "name" ? "bg-primary/20 text-primary" : "hover:bg-background"
            }`}
            title="按名称排序"
          >
            <Type size={14} />
          </button>
          <button
            onClick={() => setSortBy("modified")}
            className={`p-1 rounded transition-colors ${
              sortBy === "modified" ? "bg-primary/20 text-primary" : "hover:bg-background"
            }`}
            title="按修改时间排序"
          >
            <Clock size={14} />
          </button>
        </div>
        <button onClick={toggleSort} className="p-1 hover:bg-background rounded transition-colors" title="切换排序顺序">
          {sortOrder === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
        </button>
      </div>

      {/* File Statistics */}
      <div className="px-3 py-1.5 text-xs text-foreground/50 border-b border-border">
        {fileStats.fileCount} 个文件, {fileStats.folderCount} 个文件夹
        {searchQuery && ` (搜索: "${searchQuery}")`}
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {sortedFiles.length === 0 ? (
          <div className="text-sm text-foreground/50 p-4 text-center">
            {searchQuery ? `未找到匹配 "${searchQuery}" 的文件` : t("noFiles")}
          </div>
        ) : (
          sortedFiles.map((file) => (
            <FileTreeItem
              key={file.path}
              file={file}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onDeleteFile={onDeleteFile}
              onContextMenu={handleContextMenu}
              level={0}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
              searchQuery={searchQuery}
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
  expandedFolders: Set<string>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  searchQuery: string;
}

function FileTreeItem({
  file,
  currentFile,
  onFileSelect,
  onDeleteFile,
  onContextMenu,
  level,
  expandedFolders,
  setExpandedFolders,
  searchQuery,
}: FileTreeItemProps) {
  const isExpanded = expandedFolders.has(file.path);
  const isActive = currentFile?.path === file.path;

  // Auto-expand folders when searching
  useEffect(() => {
    if (searchQuery && file.isDirectory && file.children && file.children.length > 0) {
      setExpandedFolders((prev) => new Set(prev).add(file.path));
    }
  }, [searchQuery, file.isDirectory, file.children, file.path, setExpandedFolders]);

  const handleClick = useCallback(() => {
    if (file.isDirectory) {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(file.path)) {
          next.delete(file.path);
        } else {
          next.add(file.path);
        }
        return next;
      });
    } else {
      onFileSelect(file);
    }
  }, [file, onFileSelect, setExpandedFolders]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteFile(file.path);
    },
    [file.path, onDeleteFile]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, file);
    },
    [file, onContextMenu]
  );

  // Highlight search matches
  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const index = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <mark className="bg-yellow-500/30 text-foreground">{text.substring(index, index + searchQuery.length)}</mark>
        {text.substring(index + searchQuery.length)}
      </>
    );
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-accent/10 transition-all duration-150 group ${
          isActive ? "bg-primary/20 border-l-2 border-primary" : ""
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
            {isExpanded ? (
              <ChevronDown size={12} className="text-foreground/70" />
            ) : (
              <ChevronRight size={12} className="text-foreground/70" />
            )}
            {isExpanded ? (
              <FolderOpen size={16} className="text-accent" />
            ) : (
              <Folder size={16} className="text-accent" />
            )}
          </>
        ) : (
          <>
            <div className="w-3" />
            <File size={16} className="text-foreground/70 group-hover:text-primary transition-colors" />
          </>
        )}
        <span className="text-sm truncate flex-1">{highlightText(file.name)}</span>
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
      {file.isDirectory && isExpanded && file.children && (
        <div className="animate-slideDown">
          {file.children.map((child) => (
            <FileTreeItem
              key={child.path}
              file={child}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onDeleteFile={onDeleteFile}
              onContextMenu={onContextMenu}
              level={level + 1}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
