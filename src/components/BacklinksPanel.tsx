// Backlinks Panel - Aerospace Grade
// Shows all notes that link to the current note

import { useEffect, useState } from 'react';
import { Link2, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { invoke } from '@tauri-apps/api/tauri';
import { log } from '../utils/logger';

interface Backlink {
  path: string;
  title: string;
  context: string;
  lineNumber: number;
}

interface BacklinksPanelProps {
  currentFilePath: string | null;
  onNavigate: (path: string) => void;
}

export default function BacklinksPanel({ currentFilePath, onNavigate }: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [unlinkedMentions, setUnlinkedMentions] = useState<Backlink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnlinked, setShowUnlinked] = useState(false);
  const [expandedBacklinks, setExpandedBacklinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentFilePath) {
      loadBacklinks();
    } else {
      setBacklinks([]);
      setUnlinkedMentions([]);
    }
  }, [currentFilePath]);

  const loadBacklinks = async () => {
    if (!currentFilePath) return;

    setIsLoading(true);
    try {
      log.info('[BacklinksPanel] Loading backlinks for:', currentFilePath);

      // Get all files in workspace
      const workspacePath = currentFilePath.substring(0, currentFilePath.lastIndexOf('/'));
      const files = await invoke<Array<{ path: string; name: string; isDirectory: boolean }>>(
        'list_directory',
        { path: workspacePath }
      );

      // Extract current file name for matching
      const currentFileName = currentFilePath.split('/').pop()?.replace('.md', '') || '';
      
      const linkedBacklinks: Backlink[] = [];
      const unlinkedBacklinks: Backlink[] = [];

      // Search through all markdown files
      for (const file of files) {
        if (file.isDirectory || !file.name.endsWith('.md') || file.path === currentFilePath) {
          continue;
        }

        try {
          const content = await invoke<string>('read_file_content', { path: file.path });
          
          // Extract title from first line
          const lines = content.split('\n');
          let title = file.name.replace('.md', '');
          if (lines[0]?.trim().match(/^#+\s+/)) {
            title = lines[0].trim().replace(/^#+\s+/, '');
          }

          // Find linked mentions [[filename]]
          const linkedRegex = new RegExp(`\\[\\[${currentFileName}\\]\\]`, 'gi');
          const linkedMatches = content.matchAll(linkedRegex);

          for (const match of linkedMatches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const line = lines[lineNumber - 1] || '';
            
            linkedBacklinks.push({
              path: file.path,
              title,
              context: line.trim(),
              lineNumber,
            });
          }

          // Find unlinked mentions (just the filename as text)
          const unlinkedRegex = new RegExp(`\\b${currentFileName}\\b`, 'gi');
          const unlinkedMatches = content.matchAll(unlinkedRegex);

          for (const match of unlinkedMatches) {
            // Skip if it's part of a link
            const beforeMatch = content.substring(Math.max(0, match.index! - 2), match.index);
            if (beforeMatch === '[[') continue;

            const lineNumber = content.substring(0, match.index).split('\n').length;
            const line = lines[lineNumber - 1] || '';
            
            unlinkedBacklinks.push({
              path: file.path,
              title,
              context: line.trim(),
              lineNumber,
            });
          }
        } catch (error) {
          log.error('[BacklinksPanel] Failed to read file:', file.path, error);
        }
      }

      setBacklinks(linkedBacklinks);
      setUnlinkedMentions(unlinkedBacklinks);
      log.info(`[BacklinksPanel] Found ${linkedBacklinks.length} backlinks, ${unlinkedBacklinks.length} unlinked mentions`);
    } catch (error) {
      log.error('[BacklinksPanel] Failed to load backlinks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedBacklinks);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedBacklinks(newExpanded);
  };

  const renderBacklink = (backlink: Backlink) => {
    const isExpanded = expandedBacklinks.has(backlink.path);

    return (
      <div key={`${backlink.path}-${backlink.lineNumber}`} className="border-b border-border last:border-0">
        <button
          onClick={() => toggleExpanded(backlink.path)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-foreground/60 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-foreground/60 flex-shrink-0" />
          )}
          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium truncate">{backlink.title}</span>
        </button>
        
        {isExpanded && (
          <div
            onClick={() => onNavigate(backlink.path)}
            className="px-3 py-2 ml-6 text-xs text-foreground/70 hover:bg-secondary/30 cursor-pointer rounded"
          >
            <div className="mb-1 text-foreground/50">Line {backlink.lineNumber}</div>
            <div className="font-mono bg-background/50 p-2 rounded border border-border">
              {backlink.context}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!currentFilePath) {
    return (
      <div className="h-full flex items-center justify-center text-foreground/40 text-sm">
        <div className="text-center">
          <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No file selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-secondary">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Backlinks</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-foreground/60">
            Loading backlinks...
          </div>
        ) : (
          <>
            {/* Linked Backlinks */}
            {backlinks.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-foreground/60 bg-secondary/30">
                  LINKED MENTIONS ({backlinks.length})
                </div>
                <div>
                  {backlinks.map(renderBacklink)}
                </div>
              </div>
            )}

            {/* Unlinked Mentions */}
            {unlinkedMentions.length > 0 && (
              <div>
                <button
                  onClick={() => setShowUnlinked(!showUnlinked)}
                  className="w-full px-3 py-2 text-xs font-semibold text-foreground/60 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left flex items-center gap-2"
                >
                  {showUnlinked ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  UNLINKED MENTIONS ({unlinkedMentions.length})
                </button>
                {showUnlinked && (
                  <div>
                    {unlinkedMentions.map(renderBacklink)}
                  </div>
                )}
              </div>
            )}

            {/* No backlinks */}
            {backlinks.length === 0 && unlinkedMentions.length === 0 && (
              <div className="p-4 text-center text-sm text-foreground/40">
                <p>No backlinks found</p>
                <p className="text-xs mt-1">This note is not referenced by any other notes</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
