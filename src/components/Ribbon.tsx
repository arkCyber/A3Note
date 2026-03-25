import { Search, Settings, HelpCircle, Command, MessageSquare, FileText, Network, Calendar, FolderTree, List, Link } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface RibbonProps {
  onToggleSearch: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onOpenRAGChat: () => void;
  onNewFile?: () => void;
  onQuickSwitcher?: () => void;
  onGraphView?: () => void;
  onDailyNote?: () => void;
  onFileExplorer?: () => void;
  onOutline?: () => void;
  onBacklinks?: () => void;
}

export default function Ribbon({ 
  onToggleSearch, 
  onOpenSettings, 
  onOpenCommandPalette, 
  onOpenRAGChat,
  onNewFile,
  onQuickSwitcher,
  onGraphView,
  onDailyNote,
  onFileExplorer,
  onOutline,
  onBacklinks,
}: RibbonProps) {
  const { t } = useTranslation('ribbon');

  return (
    <div className="w-12 bg-secondary border-r border-border flex flex-col items-center py-2 gap-1">
      {onNewFile && (
        <RibbonButton
          icon={<FileText size={20} />}
          onClick={onNewFile}
          title="New File"
          aria-label="New File"
        />
      )}
      
      <RibbonButton
        icon={<Search size={20} />}
        onClick={onToggleSearch}
        title={t('search')}
        aria-label={t('search')}
      />
      
      {onQuickSwitcher && (
        <RibbonButton
          icon={<Search size={20} />}
          onClick={onQuickSwitcher}
          title="Quick Switcher"
          aria-label="Quick Switcher"
        />
      )}
      
      {onGraphView && (
        <RibbonButton
          icon={<Network size={20} />}
          onClick={onGraphView}
          title="Graph View"
          aria-label="Graph View"
        />
      )}
      
      {onDailyNote && (
        <RibbonButton
          icon={<Calendar size={20} />}
          onClick={onDailyNote}
          title="Daily Note"
          aria-label="Daily Note"
        />
      )}
      
      {onFileExplorer && (
        <RibbonButton
          icon={<FolderTree size={20} />}
          onClick={onFileExplorer}
          title="File Explorer"
          aria-label="File Explorer"
        />
      )}
      
      {onOutline && (
        <RibbonButton
          icon={<List size={20} />}
          onClick={onOutline}
          title="Outline"
          aria-label="Outline"
        />
      )}
      
      {onBacklinks && (
        <RibbonButton
          icon={<Link size={20} />}
          onClick={onBacklinks}
          title="Backlinks"
          aria-label="Backlinks"
        />
      )}
      <RibbonButton
        icon={<MessageSquare size={20} />}
        onClick={onOpenRAGChat}
        title="问你的笔记库"
        aria-label="RAG Chat"
      />
      <RibbonButton
        icon={<Command size={20} />}
        onClick={onOpenCommandPalette}
        title={t('commandPalette')}
        aria-label={t('commandPalette')}
      />
      <div className="flex-1" />
      <RibbonButton
        icon={<Settings size={20} />}
        onClick={onOpenSettings}
        title={t('settings')}
        aria-label={t('settings')}
      />
      <RibbonButton
        icon={<HelpCircle size={20} />}
        onClick={() => window.open('https://obsidian.md/help', '_blank')}
        title={t('help')}
        aria-label={t('help')}
      />
    </div>
  );
}

interface RibbonButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  ariaLabel: string;
}

function RibbonButton({ icon, onClick, title, ariaLabel }: RibbonButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center hover:bg-background rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      title={title}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
}
