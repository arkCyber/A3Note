import { useState, useMemo, useEffect, useCallback } from "react";
import Ribbon from "./components/Ribbon";
import EnhancedSidebar from "./components/EnhancedSidebar";
import Editor from "./components/Editor";
import { log } from "./utils/logger";
import { ErrorHandler, ErrorSeverity } from "./utils/errorHandler";
import PreviewPane from "./components/PreviewPane";
import SearchPanel from "./components/SearchPanel";
import StatusBar from "./components/StatusBar";
import CommandPalette, { type Command } from "./components/CommandPalette";
import Settings from "./components/Settings";
import WelcomeScreen from "./components/WelcomeScreen";
import PluginManager from "./components/PluginManager";
import PluginMarketplace from "./components/PluginMarketplace";
import ThemeToggle from "./components/ThemeToggle";
import RAGChat from "./components/RAGChat";
import { ErrorBoundary } from "./components/ErrorBoundary";
import IndexingProgress from "./components/IndexingProgress";
import BacklinksPanel from "./components/BacklinksPanel";
import OutlineView from "./components/OutlineView";
import TemplateSelector from "./components/TemplateSelector";
import BookmarksPanel from "./components/BookmarksPanel";
import GraphView from "./components/GraphView";
import TagsPanel from "./components/TagsPanel";
import SyncSettings from "./components/SyncSettings";
import { useWorkspace } from "./hooks/useWorkspace";
import { useFile } from "./hooks/useFile";
import { useSearch } from "./hooks/useSearch";
import { useKeyboard } from "./hooks/useKeyboard";
import { usePlugins } from "./hooks/usePlugins";
import { useSemanticIndex } from "./hooks/useSemanticIndex";
import { useFileWatcher } from "./hooks/useFileWatcher";
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from "./hooks/useKeyboardShortcuts";
import { batchIndexer, type IndexingProgress as IndexingProgressType, type IndexingResult } from "./services/ai/batch-indexer";
import { dailyNotesService } from "./services/daily-notes";
import { FileItem } from "./types";
import { app } from "./plugins/api/App";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pluginManagerOpen, setPluginManagerOpen] = useState(false);
  const [pluginMarketplaceOpen, setPluginMarketplaceOpen] = useState(false);
  const [ragChatOpen, setRagChatOpen] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState<IndexingProgressType | null>(null);
  const [indexingResult, setIndexingResult] = useState<IndexingResult | null>(null);
  const [showBacklinks, setShowBacklinks] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showGraphView, setShowGraphView] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showSyncSettings, setShowSyncSettings] = useState(false);

  const { workspace, openWorkspace, refreshWorkspace, deleteFile, createFile, createFolder, renameFile } = useWorkspace();
  const { currentFile, content, isDirty, isSaving, openFile, saveFile, updateContent, createNewFile } = useFile();
  const { query, results, isSearching, search, clearSearch } = useSearch(workspace.path);
  usePlugins();
  
  // Auto-index files for semantic search
  useSemanticIndex(currentFile?.path || null, content, { enabled: true });
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    enabled: !commandPaletteOpen && !settingsOpen && !showTemplateSelector,
    shortcuts: [
      { ...DEFAULT_SHORTCUTS.NEW_FILE, action: () => createNewFile() },
      { ...DEFAULT_SHORTCUTS.SAVE_FILE, action: () => saveFile() },
      { ...DEFAULT_SHORTCUTS.TOGGLE_SIDEBAR, action: () => setSidebarOpen(!sidebarOpen) },
      { ...DEFAULT_SHORTCUTS.TOGGLE_PREVIEW, action: () => setPreviewOpen(!previewOpen) },
      { ...DEFAULT_SHORTCUTS.COMMAND_PALETTE, action: () => setCommandPaletteOpen(true) },
      { ...DEFAULT_SHORTCUTS.SEARCH, action: () => setSearchOpen(true) },
      { ...DEFAULT_SHORTCUTS.RAG_CHAT, action: () => setRagChatOpen(true) },
      { ...DEFAULT_SHORTCUTS.TEMPLATE, action: () => setShowTemplateSelector(true) },
      { ...DEFAULT_SHORTCUTS.GRAPH_VIEW, action: () => setShowGraphView(true) },
      { ...DEFAULT_SHORTCUTS.OUTLINE, action: () => setShowOutline(!showOutline) },
      { ...DEFAULT_SHORTCUTS.BACKLINKS, action: () => setShowBacklinks(!showBacklinks) },
      { ...DEFAULT_SHORTCUTS.BOOKMARKS, action: () => setShowBookmarks(!showBookmarks) },
      { ...DEFAULT_SHORTCUTS.TAGS, action: () => setShowTags(!showTags) },
      { ...DEFAULT_SHORTCUTS.TODAY_NOTE, action: () => handleOpenTodayNote() },
      { ...DEFAULT_SHORTCUTS.SETTINGS, action: () => setSettingsOpen(true) },
    ],
  });
  
  // File watcher for external changes
  useFileWatcher(workspace.path, refreshWorkspace, {
    enabled: true,
    onFileCreated: (path) => {
      log.info('[App] External file created:', path);
    },
    onFileDeleted: (path) => {
      log.info('[App] External file deleted:', path);
      if (currentFile?.path === path) {
        openFile({ path: "", name: "", isDirectory: false });
      }
    },
  });
  
  // Batch index workspace on load
  useEffect(() => {
    if (workspace.path && workspace.files.length > 0) {
      const hasIndexed = sessionStorage.getItem(`indexed_${workspace.path}`);
      if (!hasIndexed) {
        handleBatchIndex();
      }
    }
  }, [workspace.path]);
  
  const handleBatchIndex = async () => {
    if (!workspace.path) return;
    
    try {
      log.info('[App] Starting batch indexing');
      setIndexingProgress({ current: 0, total: 0, currentFile: '', percentage: 0 });
      setIndexingResult(null);
      
      const result = await batchIndexer.indexWorkspace(
        workspace.path,
        (progress) => setIndexingProgress(progress)
      );
      
      setIndexingResult(result);
      sessionStorage.setItem(`indexed_${workspace.path}`, 'true');
      log.info('[App] Batch indexing complete:', result);
    } catch (error) {
      log.error('[App] Batch indexing failed:', error);
      setIndexingProgress(null);
    }
  };
  
  const handleOpenTodayNote = async () => {
    if (!workspace.path) return;
    
    try {
      const notePath = await dailyNotesService.openTodayNote(workspace.path);
      const fileName = notePath.split('/').pop() || '';
      openFile({ path: notePath, name: fileName, isDirectory: false });
      log.info('[App] Opened today\'s note:', notePath);
    } catch (error) {
      log.error('[App] Failed to open today\'s note:', error);
    }
  };

  // Handle title change from first line (Obsidian-style)
  useEffect(() => {
    if (!currentFile || !content) return;

    // Extract title from first line
    const lines = content.split('\n');
    if (lines.length === 0) return;
    
    const firstLine = lines[0].trim();
    let newTitle: string | null = null;
    
    // Check if first line is a markdown heading
    if (firstLine.match(/^#+\s+/)) {
      newTitle = firstLine.replace(/^#+\s+/, '').trim() || null;
    } else if (firstLine.length > 0 && firstLine.length < 100) {
      newTitle = firstLine;
    }
    
    // Only rename if title changed and not "未命名"
    if (newTitle && !newTitle.startsWith('未命名')) {
      const oldName = currentFile.name.replace('.md', '');
      if (newTitle !== oldName) {
        const handleRename = async () => {
          try {
            await renameFile(currentFile.path, newTitle);
            const extension = currentFile.path.split('.').pop() || 'md';
            const pathParts = currentFile.path.split('/');
            pathParts[pathParts.length - 1] = `${newTitle}.${extension}`;
            const newPath = pathParts.join('/');
            await openFile({ path: newPath, name: `${newTitle}.${extension}`, isDirectory: false });
            await refreshWorkspace();
          } catch (error) {
            console.error("Failed to rename file based on title:", error);
          }
        };
        handleRename();
      }
    }
  }, [currentFile, content, renameFile, openFile, refreshWorkspace]);

  // Initialize plugin system with workspace path when workspace is loaded
  useEffect(() => {
    if (workspace.path) {
      app.initialize(workspace.path);
      console.log('Plugin system initialized with workspace:', workspace.path);
    }
  }, [workspace.path]);

  const handleNewFile = async () => {
    if (!workspace.path) {
      await openWorkspace();
      return;
    }

    // Create default unnamed file immediately (Obsidian-style)
    const timestamp = Date.now();
    const fileName = `未命名-${timestamp}.md`;
    const fullPath = `${workspace.path}/${fileName}`;
    await createNewFile(fullPath);
    await refreshWorkspace();
  };

  const handleCreateFile = async (path: string) => {
    try {
      await createFile(path, false);
      // Open the newly created file
      const fileName = path.split('/').pop() || '';
      await openFile({ path, name: fileName, isDirectory: false });
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  };

  const handleCreateFolder = async (path: string) => {
    try {
      await createFolder(path);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  // Define commands for command palette
  const commands: Command[] = useMemo(() => [
    {
      id: 'new-file',
      label: 'New File',
      description: 'Create a new markdown file',
      shortcut: '⌘+N',
      category: 'File',
      action: handleNewFile,
    },
    {
      id: 'new-file-in-folder',
      label: 'New File in Folder',
      description: 'Create a new file with default name',
      shortcut: '⌘+Shift+N',
      category: 'File',
      action: async () => {
        if (!workspace.path) return;
        const timestamp = Date.now();
        const fileName = `未命名-${timestamp}.md`;
        const fullPath = `${workspace.path}/${fileName}`;
        await handleCreateFile(fullPath);
      },
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      description: 'Create a new folder',
      shortcut: '⌘+Shift+D',
      category: 'File',
      action: async () => {
        if (!workspace.path) return;
        const timestamp = Date.now();
        const folderName = `未命名文件夹-${timestamp}`;
        const fullPath = `${workspace.path}/${folderName}`;
        await handleCreateFolder(fullPath);
      },
    },
    {
      id: 'save-file',
      label: 'Save File',
      description: 'Save current file',
      shortcut: '⌘+S',
      category: 'File',
      action: saveFile,
    },
    {
      id: 'open-workspace',
      label: 'Open Workspace',
      description: 'Open a workspace folder',
      category: 'File',
      action: openWorkspace,
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide sidebar',
      shortcut: '⌘+B',
      category: 'View',
      action: () => setSidebarOpen(!sidebarOpen),
    },
    {
      id: 'toggle-search',
      label: 'Toggle Search',
      description: 'Show or hide search panel',
      shortcut: '⌘+Shift+F',
      category: 'View',
      action: () => setSearchOpen(!searchOpen),
    },
    {
      id: 'toggle-preview',
      label: 'Toggle Preview',
      description: 'Show or hide markdown preview',
      shortcut: '⌘+E',
      category: 'View',
      action: () => setPreviewOpen(!previewOpen),
    },
  ], [sidebarOpen, searchOpen, previewOpen, workspace.path, handleCreateFile, handleCreateFolder, handleNewFile]);

  // Keyboard shortcuts
  useKeyboard([
    {
      key: "s",
      meta: true,
      callback: () => saveFile(),
    },
    {
      key: "n",
      meta: true,
      callback: () => handleNewFile(),
    },
    {
      key: "n",
      meta: true,
      shift: true,
      callback: async () => {
        if (!workspace.path) return;
        const timestamp = Date.now();
        const fileName = `未命名-${timestamp}.md`;
        const fullPath = `${workspace.path}/${fileName}`;
        await handleCreateFile(fullPath);
      },
    },
    {
      key: "d",
      meta: true,
      shift: true,
      callback: async () => {
        if (!workspace.path) return;
        const timestamp = Date.now();
        const folderName = `未命名文件夹-${timestamp}`;
        const fullPath = `${workspace.path}/${folderName}`;
        await handleCreateFolder(fullPath);
      },
    },
    {
      key: "p",
      meta: true,
      callback: () => setCommandPaletteOpen(!commandPaletteOpen),
    },
    {
      key: "f",
      meta: true,
      shift: true,
      callback: () => setSearchOpen(!searchOpen),
    },
    {
      key: "b",
      meta: true,
      callback: () => setSidebarOpen(!sidebarOpen),
    },
    {
      key: "e",
      meta: true,
      callback: () => setPreviewOpen(!previewOpen),
    },
  ]);

  const handleFileSelect = async (file: FileItem) => {
    await openFile(file);
  };

  const handleDeleteFile = async (path: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      await deleteFile(path);
      if (currentFile?.path === path) {
        // Close the file if it's currently open
        await openFile({ path: "", name: "", isDirectory: false });
      }
    }
  };

  const handleRename = async (oldPath: string, newName: string) => {
    try {
      await renameFile(oldPath, newName);
      // If the renamed file is currently open, update the current file
      if (currentFile?.path === oldPath) {
        const pathParts = oldPath.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');
        await openFile({ path: newPath, name: newName, isDirectory: false });
      }
    } catch (error) {
      console.error("Failed to rename file:", error);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      search(query);
    } else {
      clearSearch();
    }
  };

  // Show welcome screen if no workspace is loaded
  if (!workspace.path) {
    return <WelcomeScreen onOpenWorkspace={openWorkspace} />;
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen w-screen bg-background text-foreground">
        <div className="flex flex-1 overflow-hidden">
        <Ribbon
          onToggleSearch={() => setSearchOpen(!searchOpen)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(!commandPaletteOpen)}
          onOpenRAGChat={() => setRagChatOpen(true)}
        />
        {sidebarOpen && (
          <EnhancedSidebar
            files={workspace.files}
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
            onDeleteFile={handleDeleteFile}
            onRefresh={refreshWorkspace}
          />
        )}
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="h-10 bg-secondary border-b border-border flex items-center justify-between px-4">
            <span className="text-sm font-medium">
              {currentFile ? currentFile.name : 'A3Note'}
            </span>
            <div className="flex items-center gap-2">
              {isDirty && <span className="text-accent text-sm">●</span>}
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
                title="Insert Template"
              >
                Template
              </button>
              <button
                onClick={() => setShowOutline(!showOutline)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  showOutline ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
                title="Toggle Outline"
              >
                Outline
              </button>
              <button
                onClick={() => setShowBacklinks(!showBacklinks)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  showBacklinks ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
                title="Toggle Backlinks"
              >
                Links
              </button>
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  showBookmarks ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
                title="Toggle Bookmarks"
              >
                ★
              </button>
              <button
                onClick={() => setShowTags(!showTags)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  showTags ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                }`}
                title="Toggle Tags"
              >
                #
              </button>
              <button
                onClick={() => setShowGraphView(true)}
                className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
                title="Graph View"
              >
                Graph
              </button>
              <button
                onClick={handleOpenTodayNote}
                className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
                title="Today's Note"
              >
                Today
              </button>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel: Bookmarks */}
            {showBookmarks && (
              <div className="w-64 border-r border-border">
                <BookmarksPanel
                  currentFilePath={currentFile?.path || null}
                  onNavigate={(path) => openFile({ path, name: path.split('/').pop() || '', isDirectory: false })}
                />
              </div>
            )}
            
            {/* Main Editor */}
            <Editor
              currentFile={currentFile}
              content={content}
              onContentChange={updateContent}
            />
            
            {/* Right Panels */}
            {showOutline && (
              <div className="w-64 border-l border-border">
                <OutlineView content={content} />
              </div>
            )}
            {showBacklinks && (
              <div className="w-64 border-l border-border">
                <BacklinksPanel
                  currentFilePath={currentFile?.path || null}
                  onNavigate={(path) => openFile({ path, name: path.split('/').pop() || '', isDirectory: false })}
                />
              </div>
            )}
            <PreviewPane
              content={content}
              isVisible={previewOpen}
              onToggle={() => setPreviewOpen(!previewOpen)}
            />
          </div>
        </div>
        {searchOpen && (
          <SearchPanel
            query={query}
            results={results}
            isSearching={isSearching}
            onSearch={handleSearch}
            onResultClick={handleFileSelect}
            onClose={() => setSearchOpen(false)}
          />
        )}
        </div>
        <StatusBar
        currentFile={currentFile}
        content={content}
      />
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />
      {settingsOpen && (
        <Settings 
          onClose={() => setSettingsOpen(false)}
          onOpenPlugins={() => {
            setSettingsOpen(false);
            setPluginManagerOpen(true);
          }}
          onOpenSync={() => {
            setSettingsOpen(false);
            setShowSyncSettings(true);
          }}
        />
      )}
      {pluginManagerOpen && (
        <PluginManager onClose={() => setPluginManagerOpen(false)} />
      )}
      {pluginMarketplaceOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <PluginMarketplace onClose={() => setPluginMarketplaceOpen(false)} />
          </div>
        </div>
      )}
      {ragChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl h-[80vh] overflow-hidden">
            <RAGChat onClose={() => setRagChatOpen(false)} />
          </div>
        </div>
      )}
      
      {/* Template Selector */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={(templateContent) => {
            if (currentFile) {
              updateContent(content + '\n\n' + templateContent);
            }
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      
      {/* Graph View */}
      {showGraphView && workspace.path && (
        <GraphView
          workspacePath={workspace.path}
          currentFilePath={currentFile?.path || null}
          onNavigate={(path) => {
            const fileName = path.split('/').pop() || '';
            openFile({ path, name: fileName, isDirectory: false });
          }}
          onClose={() => setShowGraphView(false)}
        />
      )}
      
      {/* Tags Panel (as overlay when shown) */}
      {showTags && workspace.path && (
        <div className="fixed right-0 top-0 bottom-0 w-64 bg-background border-l border-border shadow-xl z-40">
          <TagsPanel
            workspacePath={workspace.path}
            onNavigate={(path) => {
              const fileName = path.split('/').pop() || '';
              openFile({ path, name: fileName, isDirectory: false });
            }}
            onTagFilter={setTagFilter}
          />
        </div>
      )}
      
      {/* Indexing Progress */}
      {(indexingProgress || indexingResult) && (
        <IndexingProgress
          progress={indexingProgress}
          result={indexingResult}
          onClose={() => {
            setIndexingProgress(null);
            setIndexingResult(null);
          }}
          onAbort={() => {
            batchIndexer.abort();
            setIndexingProgress(null);
          }}
        />
      )}
      
      {/* Sync Settings */}
      {showSyncSettings && (
        <SyncSettings onClose={() => setShowSyncSettings(false)} />
      )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
