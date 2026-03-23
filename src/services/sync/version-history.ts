// Version History Service - Aerospace Grade
// Manages file version history and restoration

import { invoke } from '@tauri-apps/api/tauri';
import { log } from '../../utils/logger';
import { syncEncryption } from './encryption';

export interface Version {
  id: string;
  path: string;
  content: string;
  timestamp: number;
  hash: string;
  size: number;
  author?: string;
  message?: string;
}

export interface VersionDiff {
  additions: number;
  deletions: number;
  changes: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'remove' | 'unchanged';
  content: string;
  lineNumber: number;
}

/**
 * Version History Service
 * Manages file versions with snapshots and restoration
 */
export class VersionHistory {
  private static instance: VersionHistory;
  private maxVersions: number = 50; // Maximum versions per file
  private maxAge: number = 365 * 24 * 60 * 60 * 1000; // 1 year

  private constructor() {}

  static getInstance(): VersionHistory {
    if (!VersionHistory.instance) {
      VersionHistory.instance = new VersionHistory();
    }
    return VersionHistory.instance;
  }

  /**
   * Save a new version
   */
  async saveVersion(
    path: string,
    content: string,
    message?: string
  ): Promise<Version> {
    try {
      const hash = await syncEncryption.hashContent(content);
      
      const version: Version = {
        id: this.generateVersionId(),
        path,
        content,
        timestamp: Date.now(),
        hash,
        size: content.length,
        message
      };

      // Save to storage
      await this.storeVersion(version);
      
      // Cleanup old versions
      await this.cleanupOldVersions(path);
      
      log.info('[VersionHistory] Version saved:', version.id);
      return version;
    } catch (error) {
      log.error('[VersionHistory] Failed to save version:', error);
      throw error;
    }
  }

  /**
   * Get all versions for a file
   */
  async getVersions(path: string, limit?: number): Promise<Version[]> {
    try {
      const versions = await this.loadVersions(path);
      
      // Sort by timestamp (newest first)
      versions.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply limit
      if (limit) {
        return versions.slice(0, limit);
      }
      
      return versions;
    } catch (error) {
      log.error('[VersionHistory] Failed to get versions:', error);
      return [];
    }
  }

  /**
   * Get a specific version
   */
  async getVersion(versionId: string): Promise<Version | null> {
    try {
      const stored = localStorage.getItem(`version_${versionId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      log.error('[VersionHistory] Failed to get version:', error);
      return null;
    }
  }

  /**
   * Restore a version
   */
  async restoreVersion(versionId: string): Promise<void> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Save current version before restoring
      const currentContent = await invoke<string>('read_file_content', {
        path: version.path
      });
      await this.saveVersion(version.path, currentContent, 'Auto-save before restore');

      // Restore the version
      await invoke('write_file_content', {
        path: version.path,
        content: version.content
      });

      log.info('[VersionHistory] Version restored:', versionId);
    } catch (error) {
      log.error('[VersionHistory] Failed to restore version:', error);
      throw error;
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(versionId1: string, versionId2: string): Promise<VersionDiff> {
    try {
      const version1 = await this.getVersion(versionId1);
      const version2 = await this.getVersion(versionId2);

      if (!version1 || !version2) {
        throw new Error('Version not found');
      }

      return this.calculateDiff(version1.content, version2.content);
    } catch (error) {
      log.error('[VersionHistory] Failed to compare versions:', error);
      throw error;
    }
  }

  /**
   * Delete a version
   */
  async deleteVersion(versionId: string): Promise<void> {
    try {
      localStorage.removeItem(`version_${versionId}`);
      log.info('[VersionHistory] Version deleted:', versionId);
    } catch (error) {
      log.error('[VersionHistory] Failed to delete version:', error);
      throw error;
    }
  }

  /**
   * Delete all versions for a file
   */
  async deleteAllVersions(path: string): Promise<void> {
    try {
      const versions = await this.getVersions(path);
      for (const version of versions) {
        await this.deleteVersion(version.id);
      }
      log.info('[VersionHistory] All versions deleted for:', path);
    } catch (error) {
      log.error('[VersionHistory] Failed to delete all versions:', error);
      throw error;
    }
  }

  /**
   * Get version statistics
   */
  async getStats(path: string): Promise<{
    count: number;
    totalSize: number;
    oldestVersion: number;
    newestVersion: number;
  }> {
    const versions = await this.getVersions(path);
    
    return {
      count: versions.length,
      totalSize: versions.reduce((sum, v) => sum + v.size, 0),
      oldestVersion: versions.length > 0 ? Math.min(...versions.map(v => v.timestamp)) : 0,
      newestVersion: versions.length > 0 ? Math.max(...versions.map(v => v.timestamp)) : 0
    };
  }

  /**
   * Store version in localStorage
   */
  private async storeVersion(version: Version): Promise<void> {
    localStorage.setItem(`version_${version.id}`, JSON.stringify(version));
    
    // Update version index
    const index = this.getVersionIndex(version.path);
    index.push(version.id);
    this.saveVersionIndex(version.path, index);
  }

  /**
   * Load versions from storage
   */
  private async loadVersions(path: string): Promise<Version[]> {
    const index = this.getVersionIndex(path);
    const versions: Version[] = [];

    for (const versionId of index) {
      const version = await this.getVersion(versionId);
      if (version) {
        versions.push(version);
      }
    }

    return versions;
  }

  /**
   * Get version index for a file
   */
  private getVersionIndex(path: string): string[] {
    try {
      const stored = localStorage.getItem(`version_index_${this.hashPath(path)}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Save version index
   */
  private saveVersionIndex(path: string, index: string[]): void {
    localStorage.setItem(`version_index_${this.hashPath(path)}`, JSON.stringify(index));
  }

  /**
   * Cleanup old versions
   */
  private async cleanupOldVersions(path: string): Promise<void> {
    const versions = await this.getVersions(path);
    
    // Remove versions exceeding max count
    if (versions.length > this.maxVersions) {
      const toDelete = versions.slice(this.maxVersions);
      for (const version of toDelete) {
        await this.deleteVersion(version.id);
      }
    }

    // Remove versions older than max age
    const cutoffTime = Date.now() - this.maxAge;
    const oldVersions = versions.filter(v => v.timestamp < cutoffTime);
    for (const version of oldVersions) {
      await this.deleteVersion(version.id);
    }
  }

  /**
   * Calculate diff between two contents
   */
  private calculateDiff(content1: string, content2: string): VersionDiff {
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    
    const changes: DiffLine[] = [];
    let additions = 0;
    let deletions = 0;

    // Simple line-by-line diff
    const maxLines = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined) {
        changes.push({ type: 'add', content: line2, lineNumber: i + 1 });
        additions++;
      } else if (line2 === undefined) {
        changes.push({ type: 'remove', content: line1, lineNumber: i + 1 });
        deletions++;
      } else if (line1 !== line2) {
        changes.push({ type: 'remove', content: line1, lineNumber: i + 1 });
        changes.push({ type: 'add', content: line2, lineNumber: i + 1 });
        additions++;
        deletions++;
      } else {
        changes.push({ type: 'unchanged', content: line1, lineNumber: i + 1 });
      }
    }

    return { additions, deletions, changes };
  }

  /**
   * Generate unique version ID
   */
  private generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hash file path for indexing
   */
  private hashPath(path: string): string {
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      const char = path.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Configure version history settings
   */
  configure(options: { maxVersions?: number; maxAge?: number }): void {
    if (options.maxVersions !== undefined) {
      this.maxVersions = options.maxVersions;
    }
    if (options.maxAge !== undefined) {
      this.maxAge = options.maxAge;
    }
    log.info('[VersionHistory] Configuration updated');
  }
}

// Export singleton instance
export const versionHistory = VersionHistory.getInstance();
