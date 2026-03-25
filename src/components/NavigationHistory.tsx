/**
 * Navigation History Component - Aerospace-grade UI
 * DO-178C Level A
 * Back/Forward navigation history dropdown
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, File } from 'lucide-react';
import { NavigationEntry } from '../services/NavigationHistoryService';

export interface NavigationHistoryProps {
  backHistory: NavigationEntry[];
  forwardHistory: NavigationEntry[];
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onJumpTo: (index: number) => void;
}

export default function NavigationHistory({
  backHistory,
  forwardHistory,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onJumpTo,
}: NavigationHistoryProps) {
  const [showBackMenu, setShowBackMenu] = useState(false);
  const [showForwardMenu, setShowForwardMenu] = useState(false);
  const backMenuRef = useRef<HTMLDivElement>(null);
  const forwardMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (backMenuRef.current && !backMenuRef.current.contains(event.target as Node)) {
        setShowBackMenu(false);
      }
      if (forwardMenuRef.current && !forwardMenuRef.current.contains(event.target as Node)) {
        setShowForwardMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  const renderHistoryMenu = (
    entries: NavigationEntry[],
    isBack: boolean,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    if (entries.length === 0) {
      return (
        <div className="px-4 py-3 text-sm text-foreground/50">
          No {isBack ? 'back' : 'forward'} history
        </div>
      );
    }

    return (
      <div ref={ref} className="absolute top-full mt-1 w-80 bg-secondary border border-border rounded-lg shadow-lg overflow-hidden z-50">
        <div className="max-h-96 overflow-y-auto">
          {entries.map((entry, index) => (
            <button
              key={`${entry.filePath}-${entry.timestamp}`}
              onClick={() => {
                onJumpTo(isBack ? index : -index - 1);
                setShowBackMenu(false);
                setShowForwardMenu(false);
              }}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-background transition-colors border-b border-border last:border-b-0"
            >
              <File size={16} className="flex-shrink-0 mt-0.5 text-foreground/50" />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">
                  {getFileName(entry.filePath)}
                </div>
                <div className="text-xs text-foreground/50 truncate">
                  {entry.filePath}
                </div>
                {entry.position && (
                  <div className="text-xs text-foreground/40 mt-0.5">
                    Line {entry.position.line}, Col {entry.position.column}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center gap-1 text-xs text-foreground/40">
                <Clock size={12} />
                {formatTimestamp(entry.timestamp)}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {/* Back Button */}
      <div className="relative">
        <button
          onClick={onBack}
          onContextMenu={(e) => {
            e.preventDefault();
            if (canGoBack) {
              setShowBackMenu(!showBackMenu);
              setShowForwardMenu(false);
            }
          }}
          disabled={!canGoBack}
          className={`p-2 rounded transition-colors ${
            canGoBack
              ? 'hover:bg-background'
              : 'opacity-30 cursor-not-allowed'
          }`}
          title="Back (Cmd+Alt+Left) - Right-click for history"
          aria-label="Navigate back"
        >
          <ChevronLeft size={18} />
        </button>

        {showBackMenu && renderHistoryMenu(backHistory, true, backMenuRef)}
      </div>

      {/* Forward Button */}
      <div className="relative">
        <button
          onClick={onForward}
          onContextMenu={(e) => {
            e.preventDefault();
            if (canGoForward) {
              setShowForwardMenu(!showForwardMenu);
              setShowBackMenu(false);
            }
          }}
          disabled={!canGoForward}
          className={`p-2 rounded transition-colors ${
            canGoForward
              ? 'hover:bg-background'
              : 'opacity-30 cursor-not-allowed'
          }`}
          title="Forward (Cmd+Alt+Right) - Right-click for history"
          aria-label="Navigate forward"
        >
          <ChevronRight size={18} />
        </button>

        {showForwardMenu && renderHistoryMenu(forwardHistory, false, forwardMenuRef)}
      </div>
    </div>
  );
}
