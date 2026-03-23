import { FileItem } from '../types';

/**
 * Date Grouping Utilities
 * Groups files by date for enhanced sidebar display
 */

export type GroupingMode = 'none' | 'created' | 'modified' | 'daily-notes';

export interface FileGroup {
  id: string;
  label: string;
  date: Date;
  files: FileItem[];
  collapsed?: boolean;
}

/**
 * Group files by creation date
 */
export function groupByCreatedDate(files: FileItem[]): FileGroup[] {
  const groups = new Map<string, FileItem[]>();
  
  files.forEach(file => {
    if (file.isDirectory) return;
    
    // Get file creation date (would need to be added to FileItem type)
    // For now, use a placeholder
    const dateKey = getDateKey(new Date());
    
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(file);
  });
  
  return convertGroupsToArray(groups);
}

/**
 * Group files by modification date
 */
export function groupByModifiedDate(files: FileItem[]): FileGroup[] {
  const groups = new Map<string, FileItem[]>();
  
  files.forEach(file => {
    if (file.isDirectory) return;
    
    // Get file modification date (would need to be added to FileItem type)
    // For now, use a placeholder
    const dateKey = getDateKey(new Date());
    
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(file);
  });
  
  return convertGroupsToArray(groups);
}

/**
 * Group daily notes by date
 */
export function groupDailyNotes(files: FileItem[]): FileGroup[] {
  const groups = new Map<string, FileItem[]>();
  
  files.forEach(file => {
    if (file.isDirectory) return;
    
    // Match daily note pattern: YYYY-MM-DD.md
    const match = file.name.match(/^(\d{4})-(\d{2})-(\d{2})\.md$/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      const date = new Date(year, month, day);
      const dateKey = getDateKey(date);
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(file);
    }
  });
  
  return convertGroupsToArray(groups);
}

/**
 * Get date key for grouping
 */
function getDateKey(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if today
  if (isSameDay(date, today)) {
    return 'today';
  }
  
  // Check if yesterday
  if (isSameDay(date, yesterday)) {
    return 'yesterday';
  }
  
  // Check if this week
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date > weekAgo) {
    return 'this-week';
  }
  
  // Check if this month
  if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
    return 'this-month';
  }
  
  // Check if this year
  if (date.getFullYear() === today.getFullYear()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  
  // Older
  return `${date.getFullYear()}`;
}

/**
 * Get label for date key
 */
function getDateLabel(dateKey: string, date: Date): string {
  if (dateKey === 'today') return 'Today';
  if (dateKey === 'yesterday') return 'Yesterday';
  if (dateKey === 'this-week') return 'This Week';
  if (dateKey === 'this-month') return 'This Month';
  
  // Month format
  if (dateKey.includes('-')) {
    const [year, month] = dateKey.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  
  // Year format
  return dateKey;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Convert groups map to sorted array
 */
function convertGroupsToArray(groups: Map<string, FileItem[]>): FileGroup[] {
  const result: FileGroup[] = [];
  
  // Define order for special keys
  const keyOrder = ['today', 'yesterday', 'this-week', 'this-month'];
  
  // Add special keys first
  keyOrder.forEach(key => {
    if (groups.has(key)) {
      const files = groups.get(key)!;
      result.push({
        id: key,
        label: getDateLabel(key, new Date()),
        date: new Date(),
        files: files.sort((a, b) => a.name.localeCompare(b.name)),
      });
      groups.delete(key);
    }
  });
  
  // Add remaining groups sorted by date (newest first)
  const remainingGroups = Array.from(groups.entries())
    .map(([key, files]) => {
      // Parse date from key
      let date: Date;
      if (key.includes('-')) {
        const [year, month] = key.split('-');
        date = new Date(parseInt(year), parseInt(month) - 1);
      } else {
        date = new Date(parseInt(key), 0);
      }
      
      return {
        id: key,
        label: getDateLabel(key, date),
        date,
        files: files.sort((a, b) => a.name.localeCompare(b.name)),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  result.push(...remainingGroups);
  
  return result;
}

/**
 * Apply grouping to files
 */
export function applyGrouping(files: FileItem[], mode: GroupingMode): FileGroup[] {
  switch (mode) {
    case 'created':
      return groupByCreatedDate(files);
    case 'modified':
      return groupByModifiedDate(files);
    case 'daily-notes':
      return groupDailyNotes(files);
    case 'none':
    default:
      return [{
        id: 'all',
        label: 'All Files',
        date: new Date(),
        files: files.filter(f => !f.isDirectory),
      }];
  }
}
