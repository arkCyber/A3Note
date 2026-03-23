import { Edit, Eye, Layers } from 'lucide-react';
import { log } from '../utils/logger';

/**
 * View Mode Toggle Component
 * Switches between Edit, Preview, and Live Preview modes
 */

export type ViewMode = 'edit' | 'preview' | 'live-preview';

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export default function ViewModeToggle({ mode, onChange, className = '' }: ViewModeToggleProps) {
  const handleModeChange = (newMode: ViewMode) => {
    log.info('[ViewModeToggle] Switching to mode:', newMode);
    onChange(newMode);
    
    // Save preference
    localStorage.setItem('a3note-view-mode', newMode);
  };

  return (
    <div className={`flex items-center bg-secondary border border-border rounded-lg p-1 ${className}`}>
      <ModeButton
        icon={<Edit size={16} />}
        label="Edit"
        isActive={mode === 'edit'}
        onClick={() => handleModeChange('edit')}
        tooltip="Edit mode (Ctrl+E)"
      />
      
      <ModeButton
        icon={<Layers size={16} />}
        label="Live"
        isActive={mode === 'live-preview'}
        onClick={() => handleModeChange('live-preview')}
        tooltip="Live preview mode (Ctrl+L)"
      />
      
      <ModeButton
        icon={<Eye size={16} />}
        label="Preview"
        isActive={mode === 'preview'}
        onClick={() => handleModeChange('preview')}
        tooltip="Preview mode (Ctrl+P)"
      />
    </div>
  );
}

interface ModeButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  tooltip: string;
}

function ModeButton({ icon, label, isActive, onClick, tooltip }: ModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-background text-foreground/70'
      }`}
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={isActive}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

/**
 * Hook to get initial view mode from localStorage
 */
export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const savedMode = localStorage.getItem('a3note-view-mode') as ViewMode;
  const initialMode = savedMode || 'edit';
  
  const setMode = (mode: ViewMode) => {
    localStorage.setItem('a3note-view-mode', mode);
  };

  return [initialMode, setMode];
}
