// Bookmarks Service - Aerospace Grade
// Manages bookmarked files and quick access

import { invoke } from '@tauri-apps/api/tauri';
import { log } from '../utils/logger';

export interface Bookmark {
  id: string;
  path: string;
  title: string;
  category?: string;
  createdAt: number;
  order: number;
}

export interface BookmarkCategory {
  name: string;
  bookmarks: Bookmark[];
}

/**
 * Bookmarks Service
 * Manages bookmarked files for quick access
 */
export class BookmarksService {
  private static instance: BookmarksService;
  private bookmarks: Map<string, Bookmark> = new Map();
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.loadBookmarks();
  }

  static getInstance(): BookmarksService {
    if (!BookmarksService.instance) {
      BookmarksService.instance = new BookmarksService();
    }
    return BookmarksService.instance;
  }

  /**
   * Load bookmarks from storage
   */
  private async loadBookmarks(): Promise<void> {
    try {
      const stored = localStorage.getItem('a3note_bookmarks');
      if (stored) {
        const bookmarksArray: Bookmark[] = JSON.parse(stored);
        bookmarksArray.forEach(bookmark => {
          this.bookmarks.set(bookmark.id, bookmark);
        });
        log.info('[BookmarksService] Loaded bookmarks:', this.bookmarks.size);
      }
    } catch (error) {
      log.error('[BookmarksService] Failed to load bookmarks:', error);
    }
  }

  /**
   * Save bookmarks to storage
   */
  private async saveBookmarks(): Promise<void> {
    try {
      const bookmarksArray = Array.from(this.bookmarks.values());
      localStorage.setItem('a3note_bookmarks', JSON.stringify(bookmarksArray));
      log.info('[BookmarksService] Saved bookmarks:', bookmarksArray.length);
      this.notifyListeners();
    } catch (error) {
      log.error('[BookmarksService] Failed to save bookmarks:', error);
    }
  }

  /**
   * Add bookmark
   */
  async addBookmark(path: string, title: string, category?: string): Promise<Bookmark> {
    const id = `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const bookmark: Bookmark = {
      id,
      path,
      title,
      category,
      createdAt: Date.now(),
      order: this.bookmarks.size,
    };

    this.bookmarks.set(id, bookmark);
    await this.saveBookmarks();
    
    log.info('[BookmarksService] Added bookmark:', title);
    return bookmark;
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(id: string): Promise<boolean> {
    const deleted = this.bookmarks.delete(id);
    if (deleted) {
      await this.saveBookmarks();
      log.info('[BookmarksService] Removed bookmark:', id);
    }
    return deleted;
  }

  /**
   * Remove bookmark by path
   */
  async removeBookmarkByPath(path: string): Promise<boolean> {
    const bookmark = Array.from(this.bookmarks.values()).find(b => b.path === path);
    if (bookmark) {
      return this.removeBookmark(bookmark.id);
    }
    return false;
  }

  /**
   * Check if path is bookmarked
   */
  isBookmarked(path: string): boolean {
    return Array.from(this.bookmarks.values()).some(b => b.path === path);
  }

  /**
   * Get bookmark by path
   */
  getBookmarkByPath(path: string): Bookmark | undefined {
    return Array.from(this.bookmarks.values()).find(b => b.path === path);
  }

  /**
   * Get all bookmarks
   */
  getAllBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get bookmarks by category
   */
  getBookmarksByCategory(): BookmarkCategory[] {
    const categories = new Map<string, Bookmark[]>();
    
    this.bookmarks.forEach(bookmark => {
      const category = bookmark.category || 'Uncategorized';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(bookmark);
    });

    return Array.from(categories.entries()).map(([name, bookmarks]) => ({
      name,
      bookmarks: bookmarks.sort((a, b) => a.order - b.order),
    }));
  }

  /**
   * Update bookmark
   */
  async updateBookmark(id: string, updates: Partial<Bookmark>): Promise<boolean> {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) {
      return false;
    }

    this.bookmarks.set(id, { ...bookmark, ...updates });
    await this.saveBookmarks();
    
    log.info('[BookmarksService] Updated bookmark:', id);
    return true;
  }

  /**
   * Reorder bookmarks
   */
  async reorderBookmarks(bookmarkIds: string[]): Promise<void> {
    bookmarkIds.forEach((id, index) => {
      const bookmark = this.bookmarks.get(id);
      if (bookmark) {
        bookmark.order = index;
      }
    });

    await this.saveBookmarks();
    log.info('[BookmarksService] Reordered bookmarks');
  }

  /**
   * Clear all bookmarks
   */
  async clearBookmarks(): Promise<void> {
    this.bookmarks.clear();
    await this.saveBookmarks();
    log.info('[BookmarksService] Cleared all bookmarks');
  }

  /**
   * Subscribe to bookmark changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        log.error('[BookmarksService] Error in listener:', error);
      }
    });
  }
}

// Export singleton instance
export const bookmarksService = BookmarksService.getInstance();
