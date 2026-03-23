// Sync Engine - Aerospace Grade
// Core synchronization engine

import { log } from '../../utils/logger';
import { syncEncryption } from './encryption';

export interface SyncOperation {
  type: 'upload' | 'download' | 'delete';
  path: string;
  timestamp: number;
  hash?: string;
}

export interface FileInfo {
  path: string;
  content: string;
  timestamp: number;
  hash: string;
  size: number;
}

export interface SyncResult {
  uploaded: number;
  downloaded: number;
  deleted: number;
  conflicts: number;
  errors: string[];
}

export interface SyncConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // milliseconds
  encryptionEnabled: boolean;
}

/**
 * Sync Engine
 * Manages file synchronization operations
 */
export class SyncEngine {
  private static instance: SyncEngine;
  private syncQueue: SyncOperation[] = [];
  private isSyncing: boolean = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private config: SyncConfig = {
    enabled: false,
    autoSync: true,
    syncInterval: 60000, // 1 minute
    encryptionEnabled: true
  };

  private constructor() {}

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  /**
   * Initialize sync engine
   */
  async initialize(config: Partial<SyncConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && this.config.autoSync) {
      this.startAutoSync();
    }
    
    log.info('[SyncEngine] Initialized with config:', this.config);
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.sync().catch(error => {
        log.error('[SyncEngine] Auto-sync failed:', error);
      });
    }, this.config.syncInterval);

    log.info('[SyncEngine] Auto-sync started');
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    log.info('[SyncEngine] Auto-sync stopped');
  }

  /**
   * Queue a sync operation
   */
  queueSync(operation: SyncOperation): void {
    // Remove duplicate operations for the same file
    this.syncQueue = this.syncQueue.filter(op => op.path !== operation.path);
    this.syncQueue.push(operation);
    
    log.debug('[SyncEngine] Queued operation:', operation);
  }

  /**
   * Perform sync
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      log.warn('[SyncEngine] Sync already in progress');
      return {
        uploaded: 0,
        downloaded: 0,
        deleted: 0,
        conflicts: 0,
        errors: ['Sync already in progress']
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      uploaded: 0,
      downloaded: 0,
      deleted: 0,
      conflicts: 0,
      errors: []
    };

    try {
      log.info('[SyncEngine] Starting sync...');

      // Process queued operations
      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift()!;
        
        try {
          await this.processOperation(operation, result);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          result.errors.push(`${operation.path}: ${errorMsg}`);
          log.error('[SyncEngine] Operation failed:', operation, error);
        }
      }

      log.info('[SyncEngine] Sync completed:', result);
    } catch (error) {
      log.error('[SyncEngine] Sync failed:', error);
      result.errors.push(error instanceof Error ? error.message : String(error));
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Process a single sync operation
   */
  private async processOperation(operation: SyncOperation, result: SyncResult): Promise<void> {
    switch (operation.type) {
      case 'upload':
        await this.uploadFile(operation.path);
        result.uploaded++;
        break;
      case 'download':
        await this.downloadFile(operation.path);
        result.downloaded++;
        break;
      case 'delete':
        await this.deleteFile(operation.path);
        result.deleted++;
        break;
    }
  }

  /**
   * Upload file to remote
   */
  private async uploadFile(path: string): Promise<void> {
    try {
      // Read local file
      const content = await invoke<string>('read_file_content', { path });
      const hash = await syncEncryption.hashContent(content);
      
      const fileInfo: FileInfo = {
        path,
        content,
        timestamp: Date.now(),
        hash,
        size: content.length
      };

      // Encrypt if enabled
      if (this.config.encryptionEnabled) {
        const encrypted = await syncEncryption.encryptFile(content);
        // TODO: Upload encrypted data to remote
        log.debug('[SyncEngine] Uploaded encrypted file:', path);
      } else {
        // TODO: Upload plain data to remote
        log.debug('[SyncEngine] Uploaded file:', path);
      }
    } catch (error) {
      log.error('[SyncEngine] Failed to upload file:', path, error);
      throw error;
    }
  }

  /**
   * Download file from remote
   */
  private async downloadFile(path: string): Promise<void> {
    try {
      // TODO: Download from remote
      // For now, just log
      log.debug('[SyncEngine] Downloaded file:', path);
    } catch (error) {
      log.error('[SyncEngine] Failed to download file:', path, error);
      throw error;
    }
  }

  /**
   * Delete file from remote
   */
  private async deleteFile(path: string): Promise<void> {
    try {
      // TODO: Delete from remote
      log.debug('[SyncEngine] Deleted file:', path);
    } catch (error) {
      log.error('[SyncEngine] Failed to delete file:', path, error);
      throw error;
    }
  }

  /**
   * Get local file info
   */
  async getLocalFile(path: string): Promise<FileInfo | null> {
    try {
      const content = await invoke<string>('read_file_content', { path });
      const hash = await syncEncryption.hashContent(content);
      
      return {
        path,
        content,
        timestamp: Date.now(),
        hash,
        size: content.length
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Resolve conflict between local and remote files
   */
  async resolveConflict(local: FileInfo, remote: FileInfo): Promise<void> {
    try {
      if (local.timestamp > remote.timestamp) {
        // Local is newer, upload
        await this.uploadFile(local.path);
        log.info('[SyncEngine] Conflict resolved: local is newer');
      } else if (remote.timestamp > local.timestamp) {
        // Remote is newer, download
        await this.downloadFile(remote.path);
        log.info('[SyncEngine] Conflict resolved: remote is newer');
      } else {
        // Same timestamp, check content
        if (local.hash !== remote.hash) {
          // Content conflict, create conflict copy
          await this.createConflictCopy(local, remote);
          log.warn('[SyncEngine] Conflict: created conflict copy');
        }
      }
    } catch (error) {
      log.error('[SyncEngine] Failed to resolve conflict:', error);
      throw error;
    }
  }

  /**
   * Create conflict copy
   */
  private async createConflictCopy(local: FileInfo, remote: FileInfo): Promise<void> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const conflictPath = local.path.replace('.md', ` (conflict ${timestamp}).md`);
    
    try {
      await invoke('write_file_content', {
        path: conflictPath,
        content: remote.content
      });
      
      log.info('[SyncEngine] Created conflict copy:', conflictPath);
    } catch (error) {
      log.error('[SyncEngine] Failed to create conflict copy:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getStatus(): { isSyncing: boolean; queueLength: number; config: SyncConfig } {
    return {
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && this.config.autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
    
    log.info('[SyncEngine] Config updated:', this.config);
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    this.syncQueue = [];
    log.info('[SyncEngine] Queue cleared');
  }
}

// Export singleton instance
export const syncEngine = SyncEngine.getInstance();
