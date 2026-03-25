/**
 * End-to-End Workflow Tests
 * Aerospace-grade complete workflow testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getMetadataCache, resetMetadataCache } from '../../services/metadata/enhanced-metadata-cache';
import { createQueryEngine } from '../../services/dataview/query-engine';
import { MetadataExtractor } from '../../services/metadata/metadata-extractor';
import { getFileManager, resetFileManager } from '../../plugins/api/FileManager';
import { getSettings, resetSettings } from '../../plugins/api/Settings';
import { getHotkeys, resetHotkeys } from '../../plugins/api/Hotkeys';

describe('End-to-End Workflow Tests', () => {
  beforeEach(() => {
    resetMetadataCache();
    resetFileManager();
    resetSettings();
    resetHotkeys();
  });

  afterEach(() => {
    resetMetadataCache();
    resetFileManager();
    resetSettings();
    resetHotkeys();
  });

  describe('Complete Note Management Workflow', () => {
    it('should handle complete note lifecycle', async () => {
      const fileManager = getFileManager();
      const cache = getMetadataCache();
      const engine = createQueryEngine(cache);

      // 1. Create a new note
      const content = `---
title: Project Planning
status: active
priority: 5
tags: [project, planning]
created: 2024-03-24
---

# Project Planning

## Overview
This project aims to [goal:: improve user experience] by implementing new features.

## Tasks
- [ ] Research phase [[research-notes]]
- [ ] Design mockups [[design-files]]
- [x] Initial planning
- [ ] Implementation

## Team
- Lead: [[Alice]]
- Design: [[Bob]]
- Dev: [[Charlie]]

## Budget
Total budget: [budget:: $50000]
Spent: [spent:: $15000]

#project #active #high-priority

Some important text ^key-point
`;

      const file = await fileManager.createFile('projects/planning.md', content);
      expect(file.path).toBe('projects/planning.md');

      // 2. Extract metadata
      const metadata = MetadataExtractor.extract(content, file.path);
      
      // Verify frontmatter
      expect(metadata.frontmatter?.title).toBe('Project Planning');
      expect(metadata.frontmatter?.status).toBe('active');
      expect(metadata.frontmatter?.priority).toBe(5);
      expect(metadata.frontmatter?.tags).toEqual(['project', 'planning']);

      // Verify inline fields
      expect(metadata.inlineFields.goal).toEqual(['improve user experience']);
      expect(metadata.inlineFields.budget).toEqual(['$50000']);
      expect(metadata.inlineFields.spent).toEqual(['$15000']);

      // Verify tags
      expect(metadata.tags.length).toBeGreaterThanOrEqual(3);
      expect(metadata.tags.some(t => t.tag === '#project')).toBe(true);
      expect(metadata.tags.some(t => t.tag === '#active')).toBe(true);

      // Verify links
      expect(metadata.links.length).toBeGreaterThanOrEqual(5);
      expect(metadata.links.some(l => l.target === 'research-notes')).toBe(true);
      expect(metadata.links.some(l => l.target === 'Alice')).toBe(true);

      // Verify headings
      expect(metadata.headings.length).toBeGreaterThanOrEqual(4);
      expect(metadata.headings.some(h => h.text === 'Overview')).toBe(true);

      // Verify blocks
      expect(metadata.blocks.some(b => b.id === 'key-point')).toBe(true);

      // Verify list items
      expect(metadata.listItems.length).toBe(4);
      expect(metadata.listItems.filter(li => li.task).length).toBe(4);
      expect(metadata.listItems.filter(li => li.checked).length).toBe(1);

      // 3. Cache metadata
      cache.setMetadata(file.path, metadata);

      // 4. Query by tag
      const projectFiles = await engine.execute({
        from: '#project'
      });
      expect(projectFiles.files.length).toBe(1);
      expect(projectFiles.files[0].path).toBe('projects/planning.md');

      // 5. Query by status and priority
      const activeHighPriority = await engine.execute({
        where: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'priority', operator: 'gte', value: 5 }
        ]
      });
      expect(activeHighPriority.files.length).toBe(1);

      // 6. Update file
      const updatedContent = content.replace('status: active', 'status: completed');
      await fileManager.processFile(file, updatedContent);
      
      const updatedMetadata = MetadataExtractor.extract(updatedContent, file.path);
      cache.setMetadata(file.path, updatedMetadata);

      // 7. Verify update
      const completedProjects = await engine.execute({
        where: [{ field: 'status', operator: 'eq', value: 'completed' }]
      });
      expect(completedProjects.files.length).toBe(1);

      // 8. Delete file
      await fileManager.deleteFile(file);
      cache.deleteMetadata(file.path);

      // 9. Verify deletion
      const allFiles = await engine.execute({});
      expect(allFiles.files.length).toBe(0);
    });

    it('should handle multiple related notes', async () => {
      const fileManager = getFileManager();
      const cache = getMetadataCache();
      const engine = createQueryEngine(cache);

      // Create related notes
      const notes = [
        {
          path: 'notes/main.md',
          content: `---
title: Main Note
type: index
---
# Main Note
Links to [[sub1]] and [[sub2]]
#main`
        },
        {
          path: 'notes/sub1.md',
          content: `---
title: Sub Note 1
type: detail
parent: main
---
# Sub Note 1
Back to [[main]]
#sub #detail`
        },
        {
          path: 'notes/sub2.md',
          content: `---
title: Sub Note 2
type: detail
parent: main
---
# Sub Note 2
Back to [[main]]
Also links to [[sub1]]
#sub #detail`
        }
      ];

      // Create all notes
      for (const note of notes) {
        const file = await fileManager.createFile(note.path, note.content);
        const metadata = MetadataExtractor.extract(note.content, note.path);
        cache.setMetadata(note.path, metadata);
      }

      // Verify backlinks
      const mainBacklinks = cache.getBacklinks('notes/main.md');
      expect(mainBacklinks.length).toBe(2);
      expect(mainBacklinks.some(bl => bl.sourcePath === 'notes/sub1.md')).toBe(true);
      expect(mainBacklinks.some(bl => bl.sourcePath === 'notes/sub2.md')).toBe(true);

      // Query by type
      const detailNotes = await engine.execute({
        where: [{ field: 'type', operator: 'eq', value: 'detail' }]
      });
      expect(detailNotes.files.length).toBe(2);

      // Query by tag
      const subNotes = await engine.execute({
        from: '#sub'
      });
      expect(subNotes.files.length).toBe(2);
    });
  });

  describe('Settings and Hotkeys Integration', () => {
    it('should manage settings throughout workflow', async () => {
      const settings = getSettings();

      // Set defaults
      settings.setDefault('theme', 'dark');
      settings.setDefault('fontSize', 16);
      settings.setDefault('autoSave', true);

      // Get values
      expect(settings.get('theme')).toBe('dark');
      expect(settings.get('fontSize')).toBe(16);
      expect(settings.get('autoSave')).toBe(true);

      // Update values
      settings.set('theme', 'light');
      settings.set('fontSize', 18);

      // Save and load
      await settings.saveSettings();
      
      const newSettings = getSettings();
      await newSettings.loadSettings();
      
      expect(newSettings.get('theme')).toBe('light');
      expect(newSettings.get('fontSize')).toBe(18);

      // Export and import
      const exported = settings.export();
      expect(exported).toContain('light');
      expect(exported).toContain('18');

      settings.set('theme', 'dark');
      settings.import(exported);
      expect(settings.get('theme')).toBe('light');
    });

    it('should manage hotkeys throughout workflow', async () => {
      const hotkeys = getHotkeys();

      // Register hotkeys
      let boldCalled = false;
      let saveCalled = false;

      hotkeys.registerHotkey(
        'editor:bold',
        { modifiers: ['Mod'], key: 'b' },
        () => { boldCalled = true; }
      );

      hotkeys.registerHotkey(
        'editor:save',
        { modifiers: ['Mod'], key: 's' },
        () => { saveCalled = true; }
      );

      // Verify registration
      const boldHotkeys = hotkeys.getHotkeys('editor:bold');
      expect(boldHotkeys.length).toBe(1);
      expect(boldHotkeys[0].key).toBe('b');

      // Check availability
      const isAvailable = hotkeys.isHotkeyAvailable({
        modifiers: ['Mod'],
        key: 'x'
      });
      expect(isAvailable).toBe(true);

      const isNotAvailable = hotkeys.isHotkeyAvailable({
        modifiers: ['Mod'],
        key: 'b'
      });
      expect(isNotAvailable).toBe(false);

      // Custom hotkeys
      hotkeys.setHotkey('editor:save', [
        { modifiers: ['Mod', 'Shift'], key: 's' }
      ]);

      const customHotkeys = hotkeys.getHotkeys('editor:save');
      expect(customHotkeys[0].modifiers).toContain('Shift');
    });
  });

  describe('Performance Under Load', () => {
    it('should handle large number of files efficiently', async () => {
      const fileManager = getFileManager();
      const cache = getMetadataCache();
      const engine = createQueryEngine(cache);

      const startTime = performance.now();

      // Create 100 files
      const files = [];
      for (let i = 0; i < 100; i++) {
        const content = `---
title: File ${i}
index: ${i}
category: ${i % 5}
---
# File ${i}
Content #tag${i % 10}`;

        const file = await fileManager.createFile(`files/file${i}.md`, content);
        const metadata = MetadataExtractor.extract(content, file.path);
        cache.setMetadata(file.path, metadata);
        files.push(file);
      }

      const createTime = performance.now() - startTime;
      expect(createTime).toBeLessThan(5000); // Should create 100 files in < 5s

      // Query performance
      const queryStart = performance.now();
      const result = await engine.execute({
        where: [{ field: 'category', operator: 'eq', value: 2 }],
        sort: [{ field: 'index', direction: 'asc' }]
      });
      const queryTime = performance.now() - queryStart;

      expect(result.files.length).toBe(20);
      expect(queryTime).toBeLessThan(200); // Should query in < 200ms

      // Batch update performance
      const updateStart = performance.now();
      for (let i = 0; i < 50; i++) {
        const updatedContent = `---
title: Updated File ${i}
index: ${i}
category: ${i % 5}
updated: true
---
# Updated File ${i}
Content #tag${i % 10}`;

        const metadata = MetadataExtractor.extract(updatedContent, files[i].path);
        cache.setMetadata(files[i].path, metadata);
      }
      const updateTime = performance.now() - updateStart;

      expect(updateTime).toBeLessThan(1000); // Should update 50 files in < 1s
    });

    it('should handle complex queries efficiently', async () => {
      const cache = getMetadataCache();
      const engine = createQueryEngine(cache);

      // Setup test data
      for (let i = 0; i < 200; i++) {
        const content = `---
title: Note ${i}
status: ${i % 3 === 0 ? 'active' : i % 3 === 1 ? 'completed' : 'pending'}
priority: ${(i % 5) + 1}
category: cat${i % 10}
---
Content #tag${i % 20}`;

        const metadata = MetadataExtractor.extract(content, `note${i}.md`);
        cache.setMetadata(`note${i}.md`, metadata);
      }

      const queryStart = performance.now();

      // Complex query with multiple conditions
      const result = await engine.execute({
        where: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'priority', operator: 'gte', value: 3 },
          { field: 'category', operator: 'contains', value: 'cat' }
        ],
        sort: [
          { field: 'priority', direction: 'desc' },
          { field: 'title', direction: 'asc' }
        ],
        limit: 20,
        offset: 10
      });

      const queryTime = performance.now() - queryStart;

      expect(result.files.length).toBeLessThanOrEqual(20);
      expect(queryTime).toBeLessThan(300); // Should complete in < 300ms
    });
  });

  describe('Error Recovery', () => {
    it('should recover from malformed content', async () => {
      const cache = getMetadataCache();

      // Malformed frontmatter
      const badContent1 = `---
title: Test
invalid: [unclosed
---
Content`;

      const metadata1 = MetadataExtractor.extract(badContent1, 'bad1.md');
      expect(metadata1.path).toBe('bad1.md');
      expect(metadata1.frontmatter).toBeDefined();

      // Missing frontmatter close
      const badContent2 = `---
title: Test
Content without close`;

      const metadata2 = MetadataExtractor.extract(badContent2, 'bad2.md');
      expect(metadata2.path).toBe('bad2.md');

      // Empty content
      const emptyContent = '';
      const metadata3 = MetadataExtractor.extract(emptyContent, 'empty.md');
      expect(metadata3.path).toBe('empty.md');
      expect(metadata3.tags).toEqual([]);
      expect(metadata3.links).toEqual([]);
    });

    it('should handle cache corruption gracefully', () => {
      const cache = getMetadataCache();

      // Add valid data
      const content = '# Test\n#tag';
      const metadata = MetadataExtractor.extract(content, 'test.md');
      cache.setMetadata('test.md', metadata);

      // Validate
      const errors = cache.validate();
      expect(errors.length).toBe(0);

      // Export and verify
      const exported = cache.export();
      expect(exported).toBeTruthy();

      // Clear and import
      cache.clear();
      cache.import(exported);

      const retrieved = cache.getMetadata('test.md');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.tags.some(t => t.tag === '#tag')).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent file operations', async () => {
      const fileManager = getFileManager();
      const cache = getMetadataCache();

      // Create files concurrently
      const promises = Array.from({ length: 20 }, (_, i) =>
        (async () => {
          const content = `# File ${i}\n#tag${i}`;
          const file = await fileManager.createFile(`concurrent/file${i}.md`, content);
          const metadata = MetadataExtractor.extract(content, file.path);
          cache.setMetadata(file.path, metadata);
          return file;
        })()
      );

      const files = await Promise.all(promises);
      expect(files.length).toBe(20);

      // Verify all files are in cache
      const allFiles = cache.getAllFiles();
      expect(allFiles.length).toBe(20);
    });

    it('should handle concurrent queries', async () => {
      const cache = getMetadataCache();
      const engine = createQueryEngine(cache);

      // Setup data
      for (let i = 0; i < 50; i++) {
        const content = `---
title: Note ${i}
value: ${i}
---
#tag${i % 5}`;
        const metadata = MetadataExtractor.extract(content, `note${i}.md`);
        cache.setMetadata(`note${i}.md`, metadata);
      }

      // Run multiple queries concurrently
      const queries = [
        engine.execute({ from: '#tag0' }),
        engine.execute({ from: '#tag1' }),
        engine.execute({ from: '#tag2' }),
        engine.execute({ where: [{ field: 'value', operator: 'gt', value: 25 }] }),
        engine.execute({ sort: [{ field: 'value', direction: 'desc' }], limit: 10 })
      ];

      const results = await Promise.all(queries);

      expect(results[0].files.length).toBe(10); // tag0
      expect(results[1].files.length).toBe(10); // tag1
      expect(results[2].files.length).toBe(10); // tag2
      expect(results[3].files.length).toBe(24); // value > 25
      expect(results[4].files.length).toBe(10); // top 10
    });
  });
});
