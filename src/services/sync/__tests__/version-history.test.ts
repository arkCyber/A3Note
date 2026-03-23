import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VersionHistory } from '../version-history';
import { invoke } from '@tauri-apps/api/tauri';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn()
}));

describe('VersionHistory', () => {
  let versionHistory: VersionHistory;
  const testPath = '/test/note.md';
  const testContent = 'Test content for version history';

  beforeEach(() => {
    versionHistory = VersionHistory.getInstance();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Save Version', () => {
    it('should save a new version', async () => {
      const version = await versionHistory.saveVersion(testPath, testContent);

      expect(version).toBeDefined();
      expect(version.id).toBeTruthy();
      expect(version.path).toBe(testPath);
      expect(version.content).toBe(testContent);
      expect(version.timestamp).toBeLessThanOrEqual(Date.now());
      expect(version.hash).toBeTruthy();
      expect(version.size).toBe(testContent.length);
    });

    it('should save version with message', async () => {
      const message = 'Updated introduction';
      const version = await versionHistory.saveVersion(testPath, testContent, message);

      expect(version.message).toBe(message);
    });

    it('should generate unique version IDs', async () => {
      const version1 = await versionHistory.saveVersion(testPath, testContent);
      const version2 = await versionHistory.saveVersion(testPath, testContent);

      expect(version1.id).not.toBe(version2.id);
    });

    it('should store version in localStorage', async () => {
      const version = await versionHistory.saveVersion(testPath, testContent);
      
      const stored = localStorage.getItem(`version_${version.id}`);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.id).toBe(version.id);
      expect(parsed.content).toBe(testContent);
    });
  });

  describe('Get Versions', () => {
    it('should return empty array for file with no versions', async () => {
      const versions = await versionHistory.getVersions('/nonexistent.md');
      expect(versions).toEqual([]);
    });

    it('should return all versions for a file', async () => {
      await versionHistory.saveVersion(testPath, 'Version 1');
      await versionHistory.saveVersion(testPath, 'Version 2');
      await versionHistory.saveVersion(testPath, 'Version 3');

      const versions = await versionHistory.getVersions(testPath);
      expect(versions).toHaveLength(3);
    });

    it('should return versions sorted by timestamp (newest first)', async () => {
      const v1 = await versionHistory.saveVersion(testPath, 'Version 1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const v2 = await versionHistory.saveVersion(testPath, 'Version 2');
      await new Promise(resolve => setTimeout(resolve, 10));
      const v3 = await versionHistory.saveVersion(testPath, 'Version 3');

      const versions = await versionHistory.getVersions(testPath);
      expect(versions[0].id).toBe(v3.id);
      expect(versions[1].id).toBe(v2.id);
      expect(versions[2].id).toBe(v1.id);
    });

    it('should respect limit parameter', async () => {
      await versionHistory.saveVersion(testPath, 'Version 1');
      await versionHistory.saveVersion(testPath, 'Version 2');
      await versionHistory.saveVersion(testPath, 'Version 3');

      const versions = await versionHistory.getVersions(testPath, 2);
      expect(versions).toHaveLength(2);
    });
  });

  describe('Get Specific Version', () => {
    it('should retrieve a specific version by ID', async () => {
      const saved = await versionHistory.saveVersion(testPath, testContent);
      const retrieved = await versionHistory.getVersion(saved.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(saved.id);
      expect(retrieved!.content).toBe(testContent);
    });

    it('should return null for non-existent version', async () => {
      const version = await versionHistory.getVersion('non-existent-id');
      expect(version).toBeNull();
    });
  });

  describe('Restore Version', () => {
    it('should restore a previous version', async () => {
      const oldContent = 'Old content';
      const newContent = 'New content';

      (invoke as any).mockResolvedValueOnce(newContent);
      (invoke as any).mockResolvedValueOnce(undefined);

      const version = await versionHistory.saveVersion(testPath, oldContent);
      await versionHistory.restoreVersion(version.id);

      expect(invoke).toHaveBeenCalledWith('write_file_content', {
        path: testPath,
        content: oldContent
      });
    });

    it('should save current version before restoring', async () => {
      const oldContent = 'Old content';
      const currentContent = 'Current content';

      (invoke as any).mockResolvedValueOnce(currentContent);
      (invoke as any).mockResolvedValueOnce(undefined);

      const version = await versionHistory.saveVersion(testPath, oldContent);
      await versionHistory.restoreVersion(version.id);

      const versions = await versionHistory.getVersions(testPath);
      const autoSaved = versions.find(v => v.message === 'Auto-save before restore');
      expect(autoSaved).toBeDefined();
    });

    it('should throw error for non-existent version', async () => {
      await expect(
        versionHistory.restoreVersion('non-existent-id')
      ).rejects.toThrow('Version not found');
    });
  });

  describe('Compare Versions', () => {
    it('should compare two versions', async () => {
      const content1 = 'Line 1\nLine 2\nLine 3';
      const content2 = 'Line 1\nModified Line 2\nLine 3\nLine 4';

      const v1 = await versionHistory.saveVersion(testPath, content1);
      const v2 = await versionHistory.saveVersion(testPath, content2);

      const diff = await versionHistory.compareVersions(v1.id, v2.id);

      expect(diff.additions).toBeGreaterThan(0);
      expect(diff.deletions).toBeGreaterThan(0);
      expect(diff.changes).toBeDefined();
    });

    it('should detect no changes for identical content', async () => {
      const v1 = await versionHistory.saveVersion(testPath, testContent);
      const v2 = await versionHistory.saveVersion(testPath, testContent);

      const diff = await versionHistory.compareVersions(v1.id, v2.id);

      expect(diff.additions).toBe(0);
      expect(diff.deletions).toBe(0);
    });

    it('should throw error for non-existent versions', async () => {
      await expect(
        versionHistory.compareVersions('id1', 'id2')
      ).rejects.toThrow('Version not found');
    });
  });

  describe('Delete Version', () => {
    it('should delete a version', async () => {
      const version = await versionHistory.saveVersion(testPath, testContent);
      await versionHistory.deleteVersion(version.id);

      const retrieved = await versionHistory.getVersion(version.id);
      expect(retrieved).toBeNull();
    });

    it('should delete all versions for a file', async () => {
      await versionHistory.saveVersion(testPath, 'Version 1');
      await versionHistory.saveVersion(testPath, 'Version 2');
      await versionHistory.saveVersion(testPath, 'Version 3');

      await versionHistory.deleteAllVersions(testPath);

      const versions = await versionHistory.getVersions(testPath);
      expect(versions).toHaveLength(0);
    });
  });

  describe('Version Statistics', () => {
    it('should calculate version statistics', async () => {
      await versionHistory.saveVersion(testPath, 'x'.repeat(100));
      await new Promise(resolve => setTimeout(resolve, 10));
      await versionHistory.saveVersion(testPath, 'x'.repeat(200));
      await new Promise(resolve => setTimeout(resolve, 10));
      await versionHistory.saveVersion(testPath, 'x'.repeat(300));

      const stats = await versionHistory.getStats(testPath);

      expect(stats.count).toBe(3);
      expect(stats.totalSize).toBe(600);
      expect(stats.oldestVersion).toBeLessThan(stats.newestVersion);
    });

    it('should return zero stats for file with no versions', async () => {
      const stats = await versionHistory.getStats('/nonexistent.md');

      expect(stats.count).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.oldestVersion).toBe(0);
      expect(stats.newestVersion).toBe(0);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup old versions exceeding max count', async () => {
      versionHistory.configure({ maxVersions: 3 });

      for (let i = 0; i < 5; i++) {
        await versionHistory.saveVersion(testPath, `Version ${i}`);
      }

      const versions = await versionHistory.getVersions(testPath);
      expect(versions.length).toBeLessThanOrEqual(3);
    });

    it('should cleanup versions older than max age', async () => {
      versionHistory.configure({ maxAge: 1000 }); // 1 second

      const oldVersion = await versionHistory.saveVersion(testPath, 'Old version');
      
      // Manually set old timestamp
      const stored = localStorage.getItem(`version_${oldVersion.id}`);
      const parsed = JSON.parse(stored!);
      parsed.timestamp = Date.now() - 2000; // 2 seconds ago
      localStorage.setItem(`version_${oldVersion.id}`, JSON.stringify(parsed));

      await versionHistory.saveVersion(testPath, 'New version');

      const versions = await versionHistory.getVersions(testPath);
      const hasOldVersion = versions.some(v => v.id === oldVersion.id);
      expect(hasOldVersion).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should update max versions setting', () => {
      versionHistory.configure({ maxVersions: 100 });
      // Configuration is internal, test via behavior
      expect(() => versionHistory.configure({ maxVersions: 100 })).not.toThrow();
    });

    it('should update max age setting', () => {
      versionHistory.configure({ maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
      expect(() => versionHistory.configure({ maxAge: 30 * 24 * 60 * 60 * 1000 })).not.toThrow();
    });
  });
});
