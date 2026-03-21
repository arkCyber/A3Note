import { useState, useMemo, useEffect } from "react";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import PreviewPane from "./components/PreviewPane";
import SearchPanel from "./components/SearchPanel";
import StatusBar from "./components/StatusBar";
import CommandPalette from "./components/CommandPalette";
import Settings from "./components/Settings";
import WelcomeScreen from "./components/WelcomeScreen";
import PluginManager from "./components/PluginManager";
import PluginMarketplace from "./components/PluginMarketplace";
import { useWorkspace } from "./hooks/useWorkspace";
import { useFile } from "./hooks/useFile";
import { useSearch } from "./hooks/useSearch";
import { useKeyboard } from "./hooks/useKeyboard";
import { usePlugins } from "./hooks/usePlugins";
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

  const { workspace, openWorkspace, refreshWorkspace, deleteFile } = useWorkspace();
  const { currentFile, content, isDirty, isSaving, openFile, saveFile, updateContent, createNewFile } = useFile();
  const { query, results, isSearching, search, clearSearch } = useSearch(workspace.path);
  const { initialized: pluginsInitialized } = usePlugins();

  // Initialize plugin system with workspace path when workspace is loaded
  useEffect(() => {
    if (workspace.path) {
      app.initialize(workspace.path);
      console.log('Plugin system initialized with workspace:', workspace.path);
    }
  }, [workspace.path]);

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
  ], [sidebarOpen, searchOpen, previewOpen]);

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

  const handleNewFile = async () => {
    if (!workspace.path) {
      await openWorkspace();
      return;
    }

    const fileName = prompt("Enter file name (e.g., note.md):");
    if (fileName) {
      const fullPath = `${workspace.path}/${fileName}`;
      await createNewFile(fullPath);
      await refreshWorkspace();
    }
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
    <div className="flex flex-col h-screen w-screen bg-background text-foreground">
      <Toolbar
        currentFile={currentFile}
        isDirty={isDirty}
        isSaving={isSaving}
        onNewFile={handleNewFile}
        onSave={saveFile}
        onOpenWorkspace={openWorkspace}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleSearch={() => setSearchOpen(!searchOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPluginMarketplace={() => setPluginMarketplaceOpen(true)}
        sidebarOpen={sidebarOpen}
        searchOpen={searchOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            files={workspace.files}
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
            onDeleteFile={handleDeleteFile}
            onRefresh={refreshWorkspace}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
          <Editor
            currentFile={currentFile}
            content={content}
            onContentChange={updateContent}
          />
          <PreviewPane
            content={content}
            isVisible={previewOpen}
            onToggle={() => setPreviewOpen(!previewOpen)}
          />
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
        />
      )}
      {pluginManagerOpen && (
        <PluginManager onClose={() => setPluginManagerOpen(false)} />
      )}
    </div>
  );
}

export default App;
