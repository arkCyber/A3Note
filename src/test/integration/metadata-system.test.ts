/**
 * Metadata System Integration Tests
 * Aerospace-grade integration tests for the complete metadata system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FrontmatterParser } from '../../services/metadata/frontmatter-parser';
import { InlineFieldParser } from '../../services/metadata/inline-field-parser';
import { MetadataExtractor } from '../../services/metadata/metadata-extractor';
import { EnhancedMetadataCache, getMetadataCache, resetMetadataCache } from '../../services/metadata/enhanced-metadata-cache';
import { createQueryEngine } from '../../services/dataview/query-engine';

describe('Metadata System Integration', () => {
  let cache: EnhancedMetadataCache;

  beforeEach(() => {
    resetMetadataCache();
    cache = getMetadataCache();
  });

  describe('Complete Workflow', () => {
    it('should extract and cache metadata from markdown file', async () => {
      const content = `---
title: Project Alpha
status: active
priority: 5
tags: [project, important]
---

This is a project note [author:: John Doe] about #development.

## Overview

The project aims to [[related-note]] improve performance.

- [ ] Task 1
- [x] Task 2

![[diagram.png]]

Some text ^block-id
`;

      // Extract metadata
      const metadata = MetadataExtractor.extract(content, 'projects/alpha.md');

      // Verify frontmatter
      expect(metadata.frontmatter).not.toBeNull();
      expect(metadata.frontmatter?.title).toBe('Project Alpha');
      expect(metadata.frontmatter?.status).toBe('active');
      expect(metadata.frontmatter?.priority).toBe(5);

      // Verify inline fields
      expect(metadata.inlineFields.author).toEqual(['John Doe']);

      // Verify tags
      expect(metadata.tags.length).toBeGreaterThan(0);
      expect(metadata.tags.some(t => t.tag === '#development')).toBe(true);

      // Verify links
      expect(metadata.links.length).toBeGreaterThan(0);
      expect(metadata.links.some(l => l.target === 'related-note')).toBe(true);

      // Verify embeds
      expect(metadata.embeds.length).toBeGreaterThan(0);
      expect(metadata.embeds.some(e => e.target === 'diagram.png')).toBe(true);

      // Verify headings
      expect(metadata.headings.length).toBeGreaterThan(0);
      expect(metadata.headings.some(h => h.text === 'Overview')).toBe(true);

      // Verify blocks
      expect(metadata.blocks.length).toBeGreaterThan(0);
      expect(metadata.blocks.some(b => b.id === 'block-id')).toBe(true);

      // Verify list items
      expect(metadata.listItems.length).toBe(2);
      expect(metadata.listItems.some(li => li.task && li.checked)).toBe(true);

      // Cache the metadata
      cache.setMetadata('projects/alpha.md', metadata);

      // Verify cached
      const cached = cache.getMetadata('projects/alpha.md');
      expect(cached).not.toBeNull();
      expect(cached?.frontmatter?.title).toBe('Project Alpha');
    });

    it('should build indexes automatically', async () => {
      const content1 = `---
tags: [project, active]
---
Content with #development tag and [[link-to-beta]]`;

      const content2 = `---
tags: [project, archived]
---
Content with #testing tag and [[link-to-alpha]]`;

      const metadata1 = MetadataExtractor.extract(content1, 'alpha.md');
      const metadata2 = MetadataExtractor.extract(content2, 'beta.md');

      cache.setMetadata('alpha.md', metadata1);
      cache.setMetadata('beta.md', metadata2);

      // Test tag index
      const projectFiles = cache.getFilesWithTag('#project');
      expect(projectFiles.length).toBe(0); // Tags from frontmatter are not indexed as #tags

      const devFiles = cache.getFilesWithTag('#development');
      expect(devFiles).toContain('alpha.md');

      const testFiles = cache.getFilesWithTag('#testing');
      expect(testFiles).toContain('beta.md');

      // Test backlink index
      const backlinksToAlpha = cache.getBacklinks('link-to-alpha.md');
      expect(backlinksToAlpha.some(bl => bl.sourcePath === 'beta.md')).toBe(true);

      const backlinksToBeta = cache.getBacklinks('link-to-beta.md');
      expect(backlinksToBeta.some(bl => bl.sourcePath === 'alpha.md')).toBe(true);
    });

    it('should support complex queries', async () => {
      // Create test files
      const files = [
        {
          path: 'project1.md',
          content: `---
title: Project 1
status: active
priority: 5
---
Content #project`
        },
        {
          path: 'project2.md',
          content: `---
title: Project 2
status: active
priority: 3
---
Content #project`
        },
        {
          path: 'project3.md',
          content: `---
title: Project 3
status: completed
priority: 4
---
Content #project`
        },
      ];

      // Extract and cache all files
      for (const file of files) {
        const metadata = MetadataExtractor.extract(file.content, file.path);
        cache.setMetadata(file.path, metadata);
      }

      // Create query engine
      const engine = createQueryEngine(cache);

      // Query: active projects with priority >= 4
      const result = await engine.execute({
        from: '#project',
        where: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'priority', operator: 'gte', value: 4 }
        ],
        sort: [
          { field: 'priority', direction: 'desc' }
        ]
      });

      expect(result.files.length).toBe(1);
      expect(result.files[0].path).toBe('project1.md');
      expect(result.files[0].frontmatter?.priority).toBe(5);
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch updates efficiently', async () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        path: `file${i}.md`,
        content: `---
title: File ${i}
index: ${i}
---
Content #tag${i % 10}`
      }));

      const start = performance.now();
      await cache.batchUpdate(files);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete in < 5s
      expect(cache.getAllFiles().length).toBe(100);
    });

    it('should maintain consistency during batch operations', async () => {
      const files = [
        { path: 'a.md', content: '[[b]] [[c]]' },
        { path: 'b.md', content: '[[a]] [[c]]' },
        { path: 'c.md', content: '[[a]] [[b]]' },
      ];

      await cache.batchUpdate(files);

      // Verify bidirectional links
      const backlinksA = cache.getBacklinks('a.md');
      const backlinksB = cache.getBacklinks('b.md');
      const backlinksC = cache.getBacklinks('c.md');

      expect(backlinksA.length).toBe(2);
      expect(backlinksB.length).toBe(2);
      expect(backlinksC.length).toBe(2);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle daily notes with templates', async () => {
      const dailyNote = `---
date: 2024-03-24
type: daily-note
mood: productive
---

# Daily Note - 2024-03-24

## Tasks
- [x] Morning standup
- [ ] Code review [[PR-123]]
- [ ] Meeting with [[John Doe]]

## Notes
Today I worked on [project:: A3Note] and made good progress.

#daily-note #work

## Links
- [[2024-03-23]] (Previous)
- [[2024-03-25]] (Next)
`;

      const metadata = MetadataExtractor.extract(dailyNote, '2024-03-24.md');
      cache.setMetadata('2024-03-24.md', metadata);

      // Verify all metadata types
      expect(metadata.frontmatter?.date).toBeDefined();
      expect(metadata.frontmatter?.mood).toBe('productive');
      expect(metadata.inlineFields.project).toEqual(['A3Note']);
      expect(metadata.tags.some(t => t.tag === '#daily-note')).toBe(true);
      expect(metadata.links.some(l => l.target === 'PR-123')).toBe(true);
      expect(metadata.listItems.some(li => li.task)).toBe(true);
    });

    it('should handle knowledge base with complex relationships', async () => {
      const files = [
        {
          path: 'concepts/programming.md',
          content: `---
type: concept
category: computer-science
---
# Programming
Related: [[algorithms]], [[data-structures]]
#concept`
        },
        {
          path: 'concepts/algorithms.md',
          content: `---
type: concept
category: computer-science
difficulty: advanced
---
# Algorithms
Part of [[programming]]
#concept #advanced`
        },
        {
          path: 'concepts/data-structures.md',
          content: `---
type: concept
category: computer-science
difficulty: intermediate
---
# Data Structures
Part of [[programming]]
#concept #intermediate`
        },
      ];

      for (const file of files) {
        const metadata = MetadataExtractor.extract(file.content, file.path);
        cache.setMetadata(file.path, metadata);
      }

      // Query all concepts
      const engine = createQueryEngine(cache);
      const concepts = await engine.execute({
        from: '#concept',
        sort: [{ field: 'file.name', direction: 'asc' }]
      });

      expect(concepts.files.length).toBe(3);

      // Query by difficulty
      const advanced = await engine.execute({
        where: [
          { field: 'difficulty', operator: 'eq', value: 'advanced' }
        ]
      });

      expect(advanced.files.length).toBe(1);
      expect(advanced.files[0].path).toContain('algorithms');

      // Check backlinks
      const programmingBacklinks = cache.getBacklinks('concepts/programming.md');
      expect(programmingBacklinks.length).toBe(2);
    });

    it('should handle project management workflow', async () => {
      const projectNote = `---
title: Website Redesign
status: in-progress
priority: high
deadline: 2024-04-01
team: [Alice, Bob, Charlie]
---

# Website Redesign Project

## Objectives
Redesign the company website [budget:: $50000]

## Tasks
- [x] Research phase [[research-notes]]
- [x] Design mockups [[design-mockups]]
- [ ] Development [[dev-tasks]]
- [ ] Testing [[test-plan]]
- [ ] Deployment

## Team
- Lead: [[Alice]]
- Design: [[Bob]]
- Dev: [[Charlie]]

## Related
- [[marketing-strategy]]
- [[brand-guidelines]]

#project #website #high-priority
`;

      const metadata = MetadataExtractor.extract(projectNote, 'projects/website-redesign.md');
      cache.setMetadata('projects/website-redesign.md', metadata);

      // Verify comprehensive metadata
      expect(metadata.frontmatter?.status).toBe('in-progress');
      expect(metadata.frontmatter?.priority).toBe('high');
      expect(Array.isArray(metadata.frontmatter?.team)).toBe(true);
      expect(metadata.inlineFields.budget).toEqual(['$50000']);
      expect(metadata.tags.length).toBeGreaterThanOrEqual(3);
      expect(metadata.links.length).toBeGreaterThanOrEqual(7);
      expect(metadata.listItems.filter(li => li.task).length).toBe(5);
      expect(metadata.listItems.filter(li => li.checked).length).toBe(2);

      // Query by status and priority
      const engine = createQueryEngine(cache);
      const highPriorityProjects = await engine.execute({
        where: [
          { field: 'status', operator: 'eq', value: 'in-progress' },
          { field: 'priority', operator: 'eq', value: 'high' }
        ]
      });

      expect(highPriorityProjects.files.length).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed frontmatter gracefully', async () => {
      const content = `---
title: Test
invalid yaml: [unclosed
---
Content`;

      const metadata = MetadataExtractor.extract(content, 'test.md');
      
      // Should still extract other metadata
      expect(metadata.path).toBe('test.md');
      expect(metadata.tags).toBeDefined();
      expect(metadata.links).toBeDefined();
    });

    it('should handle very large files', async () => {
      const largeContent = `---
title: Large File
---
${Array(10000).fill('Line of content with [[link]] and #tag\n').join('')}`;

      const start = performance.now();
      const metadata = MetadataExtractor.extract(largeContent, 'large.md');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in < 1s
      expect(metadata.links.length).toBeGreaterThan(0);
      expect(metadata.tags.length).toBeGreaterThan(0);
    });

    it('should handle concurrent updates', async () => {
      const updates = Array.from({ length: 50 }, (_, i) => 
        cache.updateMetadata(`file${i}.md`, `# File ${i}\n#tag${i}`)
      );

      await Promise.all(updates);

      expect(cache.getAllFiles().length).toBe(50);
    });
  });

  describe('Cache Integrity', () => {
    it('should maintain index consistency', async () => {
      const content = `---
title: Test
---
Content with #tag1 and [[link1]]`;

      const metadata = MetadataExtractor.extract(content, 'test.md');
      cache.setMetadata('test.md', metadata);

      // Validate cache
      const errors = cache.validate();
      expect(errors.length).toBe(0);
    });

    it('should handle cache export and import', () => {
      const files = [
        { path: 'a.md', content: '# A\n#tag' },
        { path: 'b.md', content: '# B\n#tag' },
      ];

      files.forEach(f => {
        const metadata = MetadataExtractor.extract(f.content, f.path);
        cache.setMetadata(f.path, metadata);
      });

      // Export
      const exported = cache.export();
      expect(exported).toBeTruthy();

      // Clear and import
      cache.clear();
      expect(cache.getAllFiles().length).toBe(0);

      cache.import(exported);
      expect(cache.getAllFiles().length).toBe(2);
    });
  });
});
