import { Search, Settings, HelpCircle, Command, MessageSquare } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface RibbonProps {
  onToggleSearch: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onOpenRAGChat: () => void;
}

export default function Ribbon({ onToggleSearch, onOpenSettings, onOpenCommandPalette, onOpenRAGChat }: RibbonProps) {
  const { t } = useTranslation('ribbon');

  return (
    <div className="w-12 bg-secondary border-r border-border flex flex-col items-center py-2 gap-1">
      <RibbonButton
        icon={<Search size={20} />}
        onClick={onToggleSearch}
        title={t('search')}
        aria-label={t('search')}
      />
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
