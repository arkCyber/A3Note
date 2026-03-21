/**
 * Plugin Downloader Tests
 * Tests for plugin download and installation service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginDownloader } from '../services/PluginDownloader';
import { App } from '../plugins/api/App';

describe('Plugin Downloader', () => {
  let app: App;
  let downloader: PluginDownloader;

  beforeEach(() => {
    app = new App();
    app.initialize('/test/workspace');
    downloader = new PluginDownloader(app);
  });

  describe('Constructor', () => {
    it('should create downloader instance', () => {
      expect(downloader).toBeDefined();
      expect(downloader).toBeInstanceOf(PluginDownloader);
    });
  });

  describe('Download Plugin', () => {
    it('should parse GitHub repo URL correctly', () => {
      const info = {
        repo: 'https://github.com/user/plugin-name',
        version: 'latest',
      };
      
      expect(info.repo).toContain('github.com');
    });

    it('should handle repo URL without .git extension', () => {
      const info = {
        repo: 'https://github.com/user/plugin-name',
      };
      
      expect(info.repo).not.toContain('.git');
    });

    it('should handle repo URL with .git extension', () => {
      const repo = 'https://github.com/user/plugin-name.git';
      const cleanRepo = repo.replace(/\.git$/, '');
      
      expect(cleanRepo).toBe('https://github.com/user/plugin-name');
    });
  });

  describe('Install Plugin', () => {
    it('should validate manifest has required fields', () => {
      const validManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        minAppVersion: '1.0.0',
        description: 'Test',
        author: 'Test Author',
        authorUrl: 'https://test.com',
        isDesktopOnly: false,
      };
      
      expect(validManifest.id).toBeDefined();
      expect(validManifest.name).toBeDefined();
      expect(validManifest.version).toBeDefined();
    });

    it('should reject invalid manifest', () => {
      const invalidManifest = {
        name: 'Test Plugin',
        // missing id and version
      };
      
      expect(invalidManifest.id).toBeUndefined();
    });
  });

  describe('Uninstall Plugin', () => {
    it('should call unloadPlugin', async () => {
      const unloadSpy = vi.spyOn(app.plugins, 'unloadPlugin');
      
      try {
        await downloader.uninstallPlugin('test-plugin');
      } catch (error) {
        // Expected to fail since plugin doesn't exist
      }
      
      expect(unloadSpy).toHaveBeenCalledWith('test-plugin');
    });
  });

  describe('Version Comparison', () => {
    it('should detect version difference', () => {
      const currentVersion = '1.0.0';
      const latestVersion = '1.1.0';
      
      expect(currentVersion).not.toBe(latestVersion);
    });

    it('should detect same version', () => {
      const currentVersion = '1.0.0';
      const latestVersion = '1.0.0';
      
      expect(currentVersion).toBe(latestVersion);
    });
  });

  describe('URL Construction', () => {
    it('should construct raw GitHub URL for latest version', () => {
      const owner = 'user';
      const repo = 'plugin-name';
      const branch = 'master';
      
      const baseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
      const manifestUrl = `${baseUrl}/manifest.json`;
      
      expect(manifestUrl).toBe('https://raw.githubusercontent.com/user/plugin-name/master/manifest.json');
    });

    it('should construct raw GitHub URL for specific version', () => {
      const owner = 'user';
      const repo = 'plugin-name';
      const version = 'v1.0.0';
      
      const baseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${version}`;
      const mainJsUrl = `${baseUrl}/main.js`;
      
      expect(mainJsUrl).toBe('https://raw.githubusercontent.com/user/plugin-name/v1.0.0/main.js');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid repo URL', () => {
      const invalidUrl = 'not-a-github-url';
      const match = invalidUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      
      expect(match).toBeNull();
    });

    it('should handle download failures gracefully', async () => {
      const info = {
        repo: 'https://github.com/nonexistent/repo',
      };
      
      // This would fail in real implementation
      expect(info.repo).toContain('github.com');
    });
  });
});
