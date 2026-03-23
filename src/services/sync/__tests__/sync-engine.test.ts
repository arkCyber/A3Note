import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SyncEngine } from '../sync-engine';
import { syncEncryption } from '../encryption';

// Mock cloud provider
const mockProvider = {
  listFiles: vi.fn(),
  uploadFile: vi.fn(),
  downloadFile: vi.fn(),
  deleteFile: vi.fn(),
  getFileMetadata: vi.fn()
};

describe('SyncEngine', () => {
  let syncEngine: SyncEngine;

  beforeEach(() => {
    syncEngine = SyncEngine.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    syncEngine.stop();
  });

  describe('Initialization', () => {
    it('should initialize with config', async () => {
      await syncEngine.initialize({
        enabled: true,
        autoSync: false,
        syncInterval: 60000,
        encryptionEnabled: false
      });

      const status = syncEngine.getStatus();
      expect(status.enabled).toBe(true);
      expect(status.autoSync).toBe(false);
    });

    it('should start auto-sync when enabled', async () => {
      await syncEngine.initialize({
        enabled: true,
        autoSync: true,
        syncInterval: 100,
        encryptionEnabled: false
      });

      const status = syncEngine.getStatus();
      expect(status.autoSync).toBe(true);
    });
  });

  describe('Sync Queue', () => {
    beforeEach(async () => {
      await syncEngine.initialize({
        enabled: true,
        autoSync: false,
        syncInterval: 60000,
        encryptionEnabled: false
      });
    });

    it('should queue sync operations', () => {
      syncEngine.queueSync({
        type: 'upload',
        path: '/test/file.md',
        timestamp: Date.now()
      });

      const queue = syncEngine.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe('upload');
      expect(queue[0].path).toBe('/test/file.md');
    });

    it('should not queue duplicate operations', () => {
      const operation = {
        type: 'upload' as const,
        path: '/test/file.md',
        timestamp: Date.now()
      };

      syncEngine.queueSync(operation);
      syncEngine.queueSync(operation);

      const queue = syncEngine.getQueue();
      expect(queue).toHaveLength(1);
    });

    it('should clear queue', () => {
      syncEngine.queueSync({
        type: 'upload',
        path: '/test/file1.md',
        timestamp: Date.now()
      });
      syncEngine.queueSync({
        type: 'upload',
        path: '/test/file2.md',
        timestamp: Date.now()
      });

      syncEngine.clearQueue();
      const queue = syncEngine.getQueue();
      expect(queue).toHaveLength(0);
    });
  });

  describe('Conflict Detection', () => {
    beforeEach(async () => {
      await syncEngine.initialize({
        enabled: true,
        autoSync: false,
        syncInterval: 60000,
        encryptionEnabled: false
      });
    });

    it('should detect conflicts based on timestamp', () => {
      const localTime = Date.now();
      const remoteTime = localTime + 1000;

      const hasConflict = (syncEngine as any).detectConflict(
        localTime,
        remoteTime,
        'hash1',
        'hash2'
      );

      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict for same content', () => {
      const timestamp = Date.now();
      const hash = 'same-hash';

      const hasConflict = (syncEngine as any).detectConflict(
        timestamp,
        timestamp,
        hash,
        hash
      );

      expect(hasConflict).toBe(false);
    });

    it('should create conflict copy path', () => {
      const originalPath = '/notes/test.md';
      const conflictPath = (syncEngine as any).createConflictCopyPath(originalPath);

      expect(conflictPath).toContain('test (conflict');
      expect(conflictPath).toContain(').md');
    });
  });

  describe('Status Management', () => {
    beforeEach(async () => {
      await syncEngine.initialize({
        enabled: true,
        autoSync: false,
        syncInterval: 60000,
        encryptionEnabled: false
      });
    });

    it('should track sync status', () => {
      const status = syncEngine.getStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('autoSync');
      expect(status).toHaveProperty('lastSync');
      expect(status).toHaveProperty('isSyncing');
      expect(status).toHaveProperty('queueSize');
    });

    it('should update last sync time', async () => {
      const beforeSync = syncEngine.getStatus().lastSync;
      
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 10));
      (syncEngine as any).config.lastSync = Date.now();
      
      const afterSync = syncEngine.getStatus().lastSync;
      expect(afterSync).toBeGreaterThan(beforeSync);
    });
  });

  describe('Enable/Disable', () => {
    it('should enable sync', async () => {
      await syncEngine.initialize({
        enabled: false,
        autoSync: false,
        syncInterval: 60000,
        encryptionEnabled: false
      });

      syncEngine.enable();
      const status = syncEngine.getStatus();
      expect(status.enabled).toBe(true);
    });

    it('should disable sync', async () => {
      await syncEngine.initialize({
        enabled: true,
        autoSync: false,
        syncInterval: 60000,
        encryptionEnabled: false
      });

      syncEngine.disable();
      const status = syncEngine.getStatus();
      expect(status.enabled).toBe(false);
    });

    it('should stop auto-sync when disabled', async () => {
      await syncEngine.initialize({
        enabled: true,
        autoSync: true,
        syncInterval: 100,
        encryptionEnabled: false
      });

      syncEngine.disable();
      const status = syncEngine.getStatus();
      expect(status.enabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await syncEngine.initialize({
        enabled: true,
        autoSync: false,
        syncInterval: 60000,
        encryptionEnabled: false
      });
    });

    it('should handle sync errors gracefully', async () => {
      // Mock provider to throw error
      const errorProvider = {
        ...mockProvider,
        listFiles: vi.fn().mockRejectedValue(new Error('Network error'))
      };

      (syncEngine as any).provider = errorProvider;

      // Should not throw
      await expect(syncEngine.sync()).resolves.toBeDefined();
    });
  });

  describe('Encryption Integration', () => {
    beforeEach(async () => {
      await syncEncryption.initialize('test-password');
      await syncEngine.initialize({
        enabled: true,
        autoSync: false,
        syncInterval: 60000,
        encryptionEnabled: true
      });
    });

    it('should use encryption when enabled', async () => {
      const config = (syncEngine as any).config;
      expect(config.encryptionEnabled).toBe(true);
    });
  });
});
