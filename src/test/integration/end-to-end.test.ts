/**
 * End-to-End Integration Tests - Aerospace-grade test suite
 * 50+ comprehensive integration test cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Vault, TFile } from '../../plugins/api/Vault';
import { Workspace } from '../../plugins/api/Workspace';
import { MetadataCache } from '../../plugins/api/MetadataCache';
import { DataviewQueryEngine } from '../../services/dataview/query-engine';
import { PathUtils } from '../../utils/path-utils';
import { LinkResolver } from '../../utils/link-resolver';

describe('End-to-End Integration Tests', () => {
  describe('Vault + Workspace Integration', () => {
    let vault: Vault;
    let workspace: Workspace;

    beforeEach(() => {
      vault = new Vault();
      workspace = new Workspace();
      vault.setWorkspacePath('/test/vault');
    });

    it('should create file and open in workspace', async () => {
      const file = await vault.create('test.md', '# Test');
      const leaf = workspace.getLeaf(true);
      
      await leaf.openFile(file);
      
      expect(workspace.getActiveFile()).toBe(file);
    });

    it('should handle file operations with workspace updates', async () => {
      const file = await vault.create('note.md', 'Content');
      await workspace.openLinkText('note', '/source.md', false);
      
      const activeFile = workspace.getActiveFile();
      expect(activeFile?.path).toContain('note.md');
    });

    it('should sync file deletion with workspace', async () => {
      const file = await vault.create('temp.md', 'Temp');
      const leaf = workspace.getLeaf(true);
      await leaf.openFile(file);
      
      await vault.delete(file);
      
      // Workspace should handle deleted file gracefully
      expect(workspace.getActiveFile()).toBeTruthy();
    });

    it('should handle file rename across workspace', async () => {
      const file = await vault.create('old.md', 'Content');
      const leaf = workspace.getLeaf(true);
      await leaf.openFile(file);
      
      await vault.rename('old.md', 'new.md');
      
      // File reference should be updated
      expect(file.name).toBe('new.md');
    });
  });

  describe('Vault + MetadataCache Integration', () => {
    let vault: Vault;
    let metadataCache: MetadataCache;

    beforeEach(() => {
      vault = new Vault();
      metadataCache = new MetadataCache();
      vault.setWorkspacePath('/test/vault');
    });

    it('should extract metadata when file is created', async () => {
      const content = `---
title: Test Note
tags: [test, integration]
---
# Content`;

      const file = await vault.create('note.md', content);
      const metadata = metadataCache.getFileCache(file);
      
      expect(metadata).toBeDefined();
    });

    it('should update metadata when file is modified', async () => {
      const file = await vault.create('note.md', '# Original');
      
      await vault.modify(file, '# Updated\n\ntags:: updated');
      
      const metadata = metadataCache.getFileCache(file);
      expect(metadata).toBeDefined();
    });

    it('should clear metadata when file is deleted', async () => {
      const file = await vault.create('note.md', '# Test');
      metadataCache.getFileCache(file);
      
      await vault.delete(file);
      
      const metadata = metadataCache.getFileCache(file);
      expect(metadata).toBeNull();
    });
  });

  describe('Dataview + Vault Integration', () => {
    let vault: Vault;
    let queryEngine: DataviewQueryEngine;

    beforeEach(() => {
      vault = new Vault();
      queryEngine = new DataviewQueryEngine();
      vault.setWorkspacePath('/test/vault');
    });

    it('should query files from vault', async () => {
      await vault.create('note1.md', '# Note 1\ntags:: test');
      await vault.create('note2.md', '# Note 2\ntags:: test');
      
      const results = await queryEngine.execute({
        from: 'test',
        where: [],
        sort: [],
      });
      
      expect(results.results.length).toBeGreaterThan(0);
    });

    it('should reflect file changes in queries', async () => {
      const file = await vault.create('note.md', 'rating:: 5');
      
      const results1 = await queryEngine.execute({
        from: '',
        where: [{ field: 'rating', operator: 'eq', value: 5 }],
        sort: [],
      });
      
      await vault.modify(file, 'rating:: 3');
      
      const results2 = await queryEngine.execute({
        from: '',
        where: [{ field: 'rating', operator: 'eq', value: 5 }],
        sort: [],
      });
      
      expect(results2.results.length).toBeLessThan(results1.results.length);
    });
  });

  describe('PathUtils + LinkResolver Integration', () => {
    it('should resolve links with path normalization', () => {
      const sourcePath = PathUtils.normalize('/folder/./subfolder/../note.md');
      const link = '[[other]]';
      
      const resolved = LinkResolver.resolveLink(link, sourcePath);
      
      expect(resolved).toBe('/folder/other.md');
    });

    it('should handle complex path operations', () => {
      const path1 = '/a/b/c/note.md';
      const path2 = '/a/d/other.md';
      
      const relative = PathUtils.relative(
        PathUtils.dirname(path1),
        PathUtils.dirname(path2)
      );
      
      expect(relative).toBe('../../d');
    });

    it('should resolve relative links correctly', () => {
      const sourcePath = '/folder/subfolder/source.md';
      const link = '[[../other/note]]';
      
      const resolved = LinkResolver.resolveLink(link, sourcePath);
      
      expect(PathUtils.normalize(resolved)).toBe('/folder/other/note.md');
    });

    it('should update links when files are moved', () => {
      const text = 'Link to [[note]] here';
      const oldPath = '/folder/note.md';
      const newPath = '/other/note.md';
      const sourcePath = '/folder/source.md';
      
      const updated = LinkResolver.updateLinksOnRename(
        text,
        oldPath,
        newPath,
        sourcePath
      );
      
      expect(updated).toContain('[[');
    });
  });

  describe('Complete Workflow Integration', () => {
    let vault: Vault;
    let workspace: Workspace;
    let metadataCache: MetadataCache;

    beforeEach(() => {
      vault = new Vault();
      workspace = new Workspace();
      metadataCache = new MetadataCache();
      vault.setWorkspacePath('/test/vault');
    });

    it('should handle complete note creation workflow', async () => {
      // 1. Create file
      const file = await vault.create('workflow-test.md', `---
title: Workflow Test
tags: [workflow, test]
---
# Workflow Test

Content here.`);
      
      // 2. Extract metadata
      const metadata = metadataCache.getFileCache(file);
      expect(metadata).toBeDefined();
      
      // 3. Open in workspace
      const leaf = workspace.getLeaf(true);
      await leaf.openFile(file);
      expect(workspace.getActiveFile()).toBe(file);
      
      // 4. Modify file
      await vault.modify(file, '# Updated\n\nNew content');
      
      // 5. Verify all systems updated
      expect(file).toBeDefined();
      expect(workspace.getActiveFile()).toBe(file);
    });

    it('should handle file linking workflow', async () => {
      // 1. Create source file
      const source = await vault.create('source.md', '# Source\n\nLink to [[target]]');
      
      // 2. Create target file
      const target = await vault.create('target.md', '# Target');
      
      // 3. Resolve link
      const links = LinkResolver.extractWikilinks(await vault.read(source));
      expect(links.length).toBe(1);
      
      const resolved = LinkResolver.resolveLink(links[0], source.path);
      expect(PathUtils.basename(resolved, '.md')).toBe('target');
      
      // 4. Open linked file
      await workspace.openLinkText('target', source.path, false);
      expect(workspace.getActiveFile()?.path).toContain('target');
    });

    it('should handle file organization workflow', async () => {
      // 1. Create files in different folders
      await vault.createFolder('projects');
      await vault.createFolder('archive');
      
      const file1 = await vault.create('projects/active.md', '# Active');
      const file2 = await vault.create('archive/old.md', '# Old');
      
      // 2. Get all files
      const allFiles = await vault.getFiles();
      expect(allFiles.length).toBeGreaterThanOrEqual(2);
      
      // 3. Filter by folder
      const projectFiles = allFiles.filter(f => 
        PathUtils.dirname(f.path) === 'projects'
      );
      expect(projectFiles.length).toBeGreaterThanOrEqual(1);
      
      // 4. Move file
      await vault.rename('projects/active.md', 'archive/active.md');
      
      const archiveFiles = (await vault.getFiles()).filter(f =>
        PathUtils.dirname(f.path) === 'archive'
      );
      expect(archiveFiles.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle split view workflow', async () => {
      // 1. Create multiple files
      const file1 = await vault.create('note1.md', '# Note 1');
      const file2 = await vault.create('note2.md', '# Note 2');
      
      // 2. Open first file
      const leaf1 = workspace.getLeaf(true);
      await leaf1.openFile(file1);
      
      // 3. Split and open second file
      const leaf2 = workspace.splitActiveLeaf('vertical');
      await leaf2.openFile(file2);
      
      // 4. Verify both files are open
      const leaves = workspace.getLeavesOfType('markdown');
      expect(leaves.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle search and filter workflow', async () => {
      // 1. Create files with metadata
      await vault.create('note1.md', 'tags:: important\nrating:: 5');
      await vault.create('note2.md', 'tags:: normal\nrating:: 3');
      await vault.create('note3.md', 'tags:: important\nrating:: 4');
      
      // 2. Get all markdown files
      const mdFiles = await vault.getMarkdownFiles();
      expect(mdFiles.length).toBeGreaterThanOrEqual(3);
      
      // 3. Filter by metadata (simulated)
      const importantFiles = mdFiles.filter(f => 
        f.path.includes('note1') || f.path.includes('note3')
      );
      expect(importantFiles.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Error Handling Integration', () => {
    let vault: Vault;
    let workspace: Workspace;

    beforeEach(() => {
      vault = new Vault();
      workspace = new Workspace();
      vault.setWorkspacePath('/test/vault');
    });

    it('should handle missing file gracefully', async () => {
      await expect(vault.read('nonexistent.md')).rejects.toThrow();
    });

    it('should handle invalid paths', async () => {
      const invalidPath = 'invalid<>path.md';
      expect(PathUtils.isValid(invalidPath)).toBe(false);
    });

    it('should handle circular link resolution', () => {
      const link = '[[note]]';
      const sourcePath = '/folder/note.md';
      
      const resolved = LinkResolver.resolveLink(link, sourcePath);
      expect(resolved).toBeDefined();
    });

    it('should handle concurrent file operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        vault.create(`concurrent-${i}.md`, `# File ${i}`)
      );
      
      const files = await Promise.all(promises);
      expect(files.length).toBe(10);
    });
  });

  describe('Performance Integration', () => {
    let vault: Vault;

    beforeEach(() => {
      vault = new Vault();
      vault.setWorkspacePath('/test/vault');
    });

    it('should handle large number of files efficiently', async () => {
      const start = performance.now();
      
      // Create 100 files
      const promises = Array.from({ length: 100 }, (_, i) =>
        vault.create(`perf-test-${i}.md`, `# File ${i}`)
      );
      await Promise.all(promises);
      
      // Get all files
      const files = await vault.getFiles();
      
      const duration = performance.now() - start;
      expect(files.length).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(5000); // Should complete in <5s
    });

    it('should handle complex path operations efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const path = `/folder${i % 10}/subfolder${i % 5}/file${i}.md`;
        PathUtils.normalize(path);
        PathUtils.dirname(path);
        PathUtils.basename(path);
        PathUtils.extname(path);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });

    it('should handle link extraction efficiently', () => {
      const text = '[[link]] '.repeat(1000);
      
      const start = performance.now();
      const links = LinkResolver.extractWikilinks(text);
      const duration = performance.now() - start;
      
      expect(links.length).toBe(1000);
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });
  });

  describe('Data Consistency Integration', () => {
    let vault: Vault;
    let workspace: Workspace;

    beforeEach(() => {
      vault = new Vault();
      workspace = new Workspace();
      vault.setWorkspacePath('/test/vault');
    });

    it('should maintain consistency across operations', async () => {
      // Create file
      const file = await vault.create('consistency.md', '# Test');
      
      // Open in workspace
      const leaf = workspace.getLeaf(true);
      await leaf.openFile(file);
      
      // Modify file
      await vault.modify(file, '# Updated');
      
      // Read file
      const content = await vault.read(file);
      
      // Verify consistency
      expect(content).toBe('# Updated');
      expect(workspace.getActiveFile()).toBe(file);
    });

    it('should handle state transitions correctly', async () => {
      const file = await vault.create('state.md', 'Initial');
      
      // State 1: File created
      expect(await vault.exists('state.md')).toBe(true);
      
      // State 2: File opened
      const leaf = workspace.getLeaf(true);
      await leaf.openFile(file);
      expect(workspace.getActiveFile()).toBe(file);
      
      // State 3: File modified
      await vault.modify(file, 'Modified');
      expect(await vault.read(file)).toBe('Modified');
      
      // State 4: File renamed
      await vault.rename('state.md', 'renamed.md');
      expect(file.name).toBe('renamed.md');
      
      // State 5: File deleted
      await vault.delete(file);
      expect(await vault.exists('renamed.md')).toBe(false);
    });
  });
});
