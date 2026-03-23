// Bookmarks Panel - Aerospace Grade
// Quick access to bookmarked files

import { useEffect, useState } from 'react';
import { Star, Trash2, FolderOpen, Plus } from 'lucide-react';
import { bookmarksService, type Bookmark, type BookmarkCategory } from '../services/bookmarks';
import { log } from '../utils/logger';

interface BookmarksPanelProps {
  currentFilePath: string | null;
  onNavigate: (path: string) => void;
  onAddBookmark?: () => void;
}

export default function BookmarksPanel({ 
  currentFilePath, 
  onNavigate,
  onAddBookmark 
}: BookmarksPanelProps) {
  const [categories, setCategories] = useState<BookmarkCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Uncategorized']));

  useEffect(() => {
    loadBookmarks();

    // Subscribe to bookmark changes
    const unsubscribe = bookmarksService.subscribe(() => {
      loadBookmarks();
    });

    return unsubscribe;
  }, []);

  const loadBookmarks = () => {
    const bookmarkCategories = bookmarksService.getBookmarksByCategory();
    setCategories(bookmarkCategories);
    log.debug('[BookmarksPanel] Loaded bookmarks:', bookmarkCategories.length);
  };

  const handleRemoveBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Remove this bookmark?')) {
      await bookmarksService.removeBookmark(id);
    }
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCurrentFile = async () => {
    if (!currentFilePath) return;

    const fileName = currentFilePath.split('/').pop()?.replace('.md', '') || 'Untitled';
    await bookmarksService.addBookmark(currentFilePath, fileName);
  };

  const totalBookmarks = categories.reduce((sum, cat) => sum + cat.bookmarks.length, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Bookmarks</h3>
          </div>
          {currentFilePath && !bookmarksService.isBookmarked(currentFilePath) && (
            <button
              onClick={handleAddCurrentFile}
              className="p-1 hover:bg-background rounded transition-colors"
              title="Bookmark current file"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {categories.length > 0 ? (
          <div>
            {categories.map(category => {
              const isExpanded = expandedCategories.has(category.name);

              return (
                <div key={category.name} className="border-b border-border last:border-0">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-foreground/60" />
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-xs text-foreground/40">
                        ({category.bookmarks.length})
                      </span>
                    </div>
                  </button>

                  {/* Bookmarks */}
                  {isExpanded && (
                    <div className="pb-2">
                      {category.bookmarks.map(bookmark => (
                        <div
                          key={bookmark.id}
                          className={`group flex items-center gap-2 px-3 py-2 ml-6 hover:bg-secondary/50 cursor-pointer transition-colors ${
                            currentFilePath === bookmark.path ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => onNavigate(bookmark.path)}
                        >
                          <Star className="w-3 h-3 text-primary fill-primary flex-shrink-0" />
                          <span className="text-sm flex-1 truncate">{bookmark.title}</span>
                          <button
                            onClick={(e) => handleRemoveBookmark(bookmark.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded transition-all"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-foreground/40">
            <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No bookmarks yet</p>
            <p className="text-xs mt-1">Click the + button to bookmark files</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {totalBookmarks > 0 && (
        <div className="px-3 py-2 border-t border-border bg-secondary/30 text-xs text-foreground/60">
          {totalBookmarks} {totalBookmarks === 1 ? 'bookmark' : 'bookmarks'}
        </div>
      )}
    </div>
  );
}
