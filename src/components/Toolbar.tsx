import { Menu, FolderOpen, Save, Search, Settings as SettingsIcon, FileText, Loader2, Package, Network, Calendar, Command, ChevronLeft, ChevronRight } from "lucide-react";
import { FileItem } from "../types";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from 'react-i18next';

interface ToolbarProps {
  currentFile: FileItem | null;
  isDirty: boolean;
  isSaving: boolean;
  onNewFile: () => void;
  onSave: () => void;
  onOpenWorkspace: () => void;
  onToggleSidebar: () => void;
  onToggleSearch: () => void;
  onOpenSettings: () => void;
  onOpenPluginMarketplace?: () => void;
  onQuickSwitcher?: () => void;
  onGraphView?: () => void;
  onDailyNote?: () => void;
  onCommandPalette?: () => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  sidebarOpen: boolean;
  searchOpen: boolean;
}

export default function Toolbar({
  currentFile,
  isDirty,
  isSaving,
  onNewFile,
  onSave,
  onOpenWorkspace,
  onToggleSidebar,
  onToggleSearch,
  onOpenSettings,
  onOpenPluginMarketplace,
  onQuickSwitcher,
  onGraphView,
  onDailyNote,
  onCommandPalette,
  onNavigateBack,
  onNavigateForward,
  searchOpen,
}: ToolbarProps) {
  const { t } = useTranslation('toolbar');
  
  return (
    <div className="h-12 bg-secondary border-b border-border flex items-center px-4 gap-4">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={t('toggleSidebar')}
        aria-label={t('toggleSidebar')}
      >
        <Menu size={18} />
      </button>

      <button
        onClick={onOpenWorkspace}
        className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={t('openWorkspace')}
        aria-label={t('openWorkspace')}
      >
        <FolderOpen size={18} />
      </button>

      <button
        onClick={onNewFile}
        className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={t('newFileShortcut')}
        aria-label={t('newFile')}
      >
        <FileText size={18} />
      </button>

      <button
        onClick={onSave}
        disabled={!isDirty || isSaving}
        className="p-2 hover:bg-background rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={t('saveShortcut')}
        aria-label={isSaving ? t('saving') : t('save')}
      >
        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
      </button>

      <button
        onClick={onToggleSearch}
        className={`p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          searchOpen ? "bg-background" : ""
        }`}
        title={t('searchShortcut')}
        aria-label={t('search')}
      >
        <Search size={18} />
      </button>

      {onQuickSwitcher && (
        <button
          onClick={onQuickSwitcher}
          className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Quick Switcher (Cmd+O)"
          aria-label="Quick Switcher"
        >
          <Search size={18} />
        </button>
      )}

      {onGraphView && (
        <button
          onClick={onGraphView}
          className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Graph View (Cmd+G)"
          aria-label="Graph View"
        >
          <Network size={18} />
        </button>
      )}

      {onDailyNote && (
        <button
          onClick={onDailyNote}
          className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Daily Note (Cmd+D)"
          aria-label="Daily Note"
        >
          <Calendar size={18} />
        </button>
      )}

      {onCommandPalette && (
        <button
          onClick={onCommandPalette}
          className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Command Palette (Cmd+P)"
          aria-label="Command Palette"
        >
          <Command size={18} />
        </button>
      )}

      {onNavigateBack && (
        <button
          onClick={onNavigateBack}
          className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Back (Cmd+Alt+Left)"
          aria-label="Navigate Back"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {onNavigateForward && (
        <button
          onClick={onNavigateForward}
          className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Forward (Cmd+Alt+Right)"
          aria-label="Navigate Forward"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div className="flex-1 text-center text-sm">
        <span className="text-foreground/70">
          {currentFile ? currentFile.name : t('common:appName', { defaultValue: 'A3Note' })}
        </span>
        {isDirty && <span className="ml-2 text-accent">●</span>}
      </div>

      <ThemeToggle />

      {onOpenPluginMarketplace && (
        <button
          onClick={onOpenPluginMarketplace}
          className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Plugin Marketplace"
          aria-label="Plugin Marketplace"
        >
          <Package size={18} />
        </button>
      )}

      <button
        onClick={onOpenSettings}
        className="p-2 hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={t('settings')}
        aria-label={t('settings')}
      >
        <SettingsIcon size={18} />
      </button>
    </div>
  );
}
