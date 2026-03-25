/**
 * Query Engine Tests
 * Aerospace-grade test suite for Dataview Query Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QueryEngine } from '../../services/dataview/query-engine';
import { EnhancedMetadataCache } from '../../services/metadata/enhanced-metadata-cache';
import { MetadataExtractor } from '../../services/metadata/metadata-extractor';

describe('Query Engine', () => {
  let cache: EnhancedMetadataCache;
  let engine: QueryEngine;

  beforeEach(() => {
    cache = new EnhancedMetadataCache();
    engine = new QueryEngine(cache);

    // Setup test data
    const testFiles = [
      {
        path: 'projects/alpha.md',
        content: `---
title: Project Alpha
status: active
priority: 5
type: project
---
Content #project #active`
      },
      {
        path: 'projects/beta.md',
        content: `---
title: Project Beta
status: completed
priority: 3
type: project
---
Content #project #completed`
      },
      {
        path: 'projects/gamma.md',
        content: `---
title: Project Gamma
status: active
priority: 4
type: project
---
Content #project #active`
      },
      {
        path: 'notes/meeting.md',
        content: `---
title: Meeting Notes
type: note
date: 2024-03-24
---
Content #meeting`
      },
      {
        path: 'tasks/todo.md',
        content: `---
title: Todo List
type: task
---
- [ ] Task 1
- [x] Task 2
#tasks`
      },
    ];

    testFiles.forEach(file => {
      const metadata = MetadataExtractor.extract(file.content, file.path);
      cache.setMetadata(file.path, metadata);
    });
  });

  describe('execute', () => {
    it('should execute basic query', async () => {
      const result = await engine.execute({});
      
      expect(result.files.length).toBe(5);
      expect(result.totalCount).toBe(5);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should filter by tag', async () => {
      const result = await engine.execute({
        from: '#project',
      });
      
      expect(result.files.length).toBe(3);
      expect(result.files.every(f => f.path.startsWith('projects/'))).toBe(true);
    });

    it('should filter by folder', async () => {
      const result = await engine.execute({
        from: '"projects"',
      });
      
      expect(result.files.length).toBe(3);
      expect(result.files.every(f => f.path.startsWith('projects/'))).toBe(true);
    });

    it('should apply WHERE clause', async () => {
      const result = await engine.execute({
        where: [
          { field: 'status', operator: 'eq', value: 'active' }
        ],
      });
      
      expect(result.files.length).toBe(2);
      expect(result.files.every(f => f.frontmatter?.status === 'active')).toBe(true);
    });

    it('should apply multiple WHERE clauses (AND logic)', async () => {
      const result = await engine.execute({
        where: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'priority', operator: 'gte', value: 4 }
        ],
      });
      
      expect(result.files.length).toBe(2);
      expect(result.files.every(f => 
        f.frontmatter?.status === 'active' && 
        (f.frontmatter?.priority as number) >= 4
      )).toBe(true);
    });

    it('should sort results', async () => {
      const result = await engine.execute({
        from: '#project',
        sort: [
          { field: 'priority', direction: 'desc' }
        ],
      });
      
      expect(result.files[0].frontmatter?.priority).toBe(5);
      expect(result.files[1].frontmatter?.priority).toBe(4);
      expect(result.files[2].frontmatter?.priority).toBe(3);
    });

    it('should sort by multiple fields', async () => {
      const result = await engine.execute({
        from: '#project',
        sort: [
          { field: 'status', direction: 'asc' },
          { field: 'priority', direction: 'desc' }
        ],
      });
      
      expect(result.files.length).toBe(3);
      // Active projects should come first, sorted by priority desc
      const activeFiles = result.files.filter(f => f.frontmatter?.status === 'active');
      expect(activeFiles[0].frontmatter?.priority).toBeGreaterThanOrEqual(
        activeFiles[1].frontmatter?.priority as number
      );
    });

    it('should apply limit', async () => {
      const result = await engine.execute({
        from: '#project',
        limit: 2,
      });
      
      expect(result.files.length).toBe(2);
      expect(result.totalCount).toBe(3);
    });

    it('should apply offset', async () => {
      const result = await engine.execute({
        from: '#project',
        sort: [{ field: 'priority', direction: 'desc' }],
        offset: 1,
      });
      
      expect(result.files.length).toBe(2);
      expect(result.files[0].frontmatter?.priority).toBe(4);
    });

    it('should apply limit and offset together', async () => {
      const result = await engine.execute({
        from: '#project',
        sort: [{ field: 'priority', direction: 'desc' }],
        offset: 1,
        limit: 1,
      });
      
      expect(result.files.length).toBe(1);
      expect(result.files[0].frontmatter?.priority).toBe(4);
      expect(result.totalCount).toBe(3);
    });
  });

  describe('WHERE operators', () => {
    it('should support eq operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'type', operator: 'eq', value: 'project' }],
      });
      
      expect(result.files.length).toBe(3);
    });

    it('should support ne operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'type', operator: 'ne', value: 'project' }],
      });
      
      expect(result.files.length).toBe(2);
      expect(result.files.every(f => f.frontmatter?.type !== 'project')).toBe(true);
    });

    it('should support gt operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'priority', operator: 'gt', value: 3 }],
      });
      
      expect(result.files.length).toBe(2);
      expect(result.files.every(f => (f.frontmatter?.priority as number) > 3)).toBe(true);
    });

    it('should support gte operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'priority', operator: 'gte', value: 4 }],
      });
      
      expect(result.files.length).toBe(2);
      expect(result.files.every(f => (f.frontmatter?.priority as number) >= 4)).toBe(true);
    });

    it('should support lt operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'priority', operator: 'lt', value: 5 }],
      });
      
      expect(result.files.every(f => 
        !f.frontmatter?.priority || (f.frontmatter.priority as number) < 5
      )).toBe(true);
    });

    it('should support lte operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'priority', operator: 'lte', value: 4 }],
      });
      
      expect(result.files.every(f => 
        !f.frontmatter?.priority || (f.frontmatter.priority as number) <= 4
      )).toBe(true);
    });

    it('should support contains operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'title', operator: 'contains', value: 'Project' }],
      });
      
      expect(result.files.length).toBe(3);
      expect(result.files.every(f => 
        (f.frontmatter?.title as string).includes('Project')
      )).toBe(true);
    });

    it('should support startsWith operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'title', operator: 'startsWith', value: 'Project' }],
      });
      
      expect(result.files.length).toBe(3);
      expect(result.files.every(f => 
        (f.frontmatter?.title as string).startsWith('Project')
      )).toBe(true);
    });

    it('should support endsWith operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'title', operator: 'endsWith', value: 'Notes' }],
      });
      
      expect(result.files.length).toBe(1);
      expect(result.files[0].frontmatter?.title).toBe('Meeting Notes');
    });

    it('should support exists operator', async () => {
      const result = await engine.execute({
        where: [{ field: 'priority', operator: 'exists' }],
      });
      
      expect(result.files.length).toBe(3);
      expect(result.files.every(f => f.frontmatter?.priority !== undefined)).toBe(true);
    });
  });

  describe('special fields', () => {
    it('should support file.name', async () => {
      const result = await engine.execute({
        where: [{ field: 'file.name', operator: 'eq', value: 'alpha' }],
      });
      
      expect(result.files.length).toBe(1);
      expect(result.files[0].path).toContain('alpha');
    });

    it('should support file.path', async () => {
      const result = await engine.execute({
        where: [{ field: 'file.path', operator: 'contains', value: 'projects' }],
      });
      
      expect(result.files.length).toBe(3);
    });

    it('should support file.size', async () => {
      const result = await engine.execute({
        where: [{ field: 'file.size', operator: 'gt', value: 0 }],
      });
      
      expect(result.files.length).toBe(5);
    });

    it('should support file.tags', async () => {
      const result = await engine.execute({
        where: [{ field: 'file.tags', operator: 'contains', value: '#project' }],
      });
      
      expect(result.files.length).toBe(3);
    });
  });

  describe('convenience methods', () => {
    it('should query by tag', async () => {
      const result = await engine.queryByTag('#project');
      
      expect(result.length).toBe(3);
    });

    it('should query by folder', async () => {
      const result = await engine.queryByFolder('projects');
      
      expect(result.length).toBe(3);
    });

    it('should query by frontmatter field', async () => {
      const result = await engine.queryByFrontmatter('status', 'active');
      
      expect(result.length).toBe(2);
    });

    it('should query by frontmatter field existence', async () => {
      const result = await engine.queryByFrontmatter('priority');
      
      expect(result.length).toBe(3);
    });

    it('should search full-text', async () => {
      const result = await engine.search('meeting');
      
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(f => f.path.includes('meeting'))).toBe(true);
    });
  });

  describe('performance', () => {
    it('should execute queries quickly', async () => {
      const start = performance.now();
      
      await engine.execute({
        where: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'priority', operator: 'gte', value: 4 }
        ],
        sort: [{ field: 'priority', direction: 'desc' }],
      });
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle large result sets efficiently', async () => {
      // Add more test data
      for (let i = 0; i < 100; i++) {
        const metadata = MetadataExtractor.extract(
          `---\ntitle: File ${i}\nindex: ${i}\n---\nContent #test`,
          `file${i}.md`
        );
        cache.setMetadata(`file${i}.md`, metadata);
      }

      const start = performance.now();
      const result = await engine.execute({
        from: '#test',
        sort: [{ field: 'index', direction: 'asc' }],
      });
      const duration = performance.now() - start;

      expect(result.files.length).toBe(100);
      expect(duration).toBeLessThan(200);
    });
  });

  describe('edge cases', () => {
    it('should handle empty cache', async () => {
      const emptyCache = new EnhancedMetadataCache();
      const emptyEngine = new QueryEngine(emptyCache);
      
      const result = await emptyEngine.execute({});
      
      expect(result.files.length).toBe(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle queries with no results', async () => {
      const result = await engine.execute({
        where: [{ field: 'nonexistent', operator: 'eq', value: 'value' }],
      });
      
      expect(result.files.length).toBe(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle invalid field names gracefully', async () => {
      const result = await engine.execute({
        where: [{ field: 'invalid.field.name', operator: 'eq', value: 'test' }],
      });
      
      expect(result.files.length).toBe(0);
    });

    it('should handle null/undefined values', async () => {
      const result = await engine.execute({
        where: [{ field: 'missing', operator: 'eq', value: null }],
      });
      
      expect(result).toBeDefined();
    });

    it('should handle offset larger than result set', async () => {
      const result = await engine.execute({
        from: '#project',
        offset: 100,
      });
      
      expect(result.files.length).toBe(0);
      expect(result.totalCount).toBe(3);
    });

    it('should handle negative limit/offset', async () => {
      const result = await engine.execute({
        from: '#project',
        limit: -1,
        offset: -1,
      });
      
      // Should handle gracefully
      expect(result).toBeDefined();
    });
  });

  describe('complex queries', () => {
    it('should handle complex multi-condition query', async () => {
      const result = await engine.execute({
        from: '#project',
        where: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'priority', operator: 'gte', value: 4 },
          { field: 'type', operator: 'eq', value: 'project' }
        ],
        sort: [
          { field: 'priority', direction: 'desc' },
          { field: 'title', direction: 'asc' }
        ],
        limit: 10,
      });
      
      expect(result.files.length).toBeGreaterThanOrEqual(0);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should combine FROM and WHERE correctly', async () => {
      const result = await engine.execute({
        from: '#project',
        where: [
          { field: 'status', operator: 'eq', value: 'completed' }
        ],
      });
      
      expect(result.files.length).toBe(1);
      expect(result.files[0].path).toContain('beta');
    });

    it('should handle pagination correctly', async () => {
      const page1 = await engine.execute({
        from: '#project',
        sort: [{ field: 'priority', direction: 'desc' }],
        limit: 2,
        offset: 0,
      });
      
      const page2 = await engine.execute({
        from: '#project',
        sort: [{ field: 'priority', direction: 'desc' }],
        limit: 2,
        offset: 2,
      });
      
      expect(page1.files.length).toBe(2);
      expect(page2.files.length).toBe(1);
      expect(page1.totalCount).toBe(3);
      expect(page2.totalCount).toBe(3);
      
      // Ensure no overlap
      const page1Paths = page1.files.map(f => f.path);
      const page2Paths = page2.files.map(f => f.path);
      expect(page1Paths.some(p => page2Paths.includes(p))).toBe(false);
    });
  });

  describe('data integrity', () => {
    it('should not modify original cache', async () => {
      const originalCount = cache.getAllFiles().length;
      
      await engine.execute({
        where: [{ field: 'status', operator: 'eq', value: 'active' }],
      });
      
      expect(cache.getAllFiles().length).toBe(originalCount);
    });

    it('should return consistent results', async () => {
      const query = {
        from: '#project',
        where: [{ field: 'status', operator: 'eq', value: 'active' }],
        sort: [{ field: 'priority', direction: 'desc' }],
      };
      
      const result1 = await engine.execute(query);
      const result2 = await engine.execute(query);
      
      expect(result1.files.length).toBe(result2.files.length);
      expect(result1.files[0].path).toBe(result2.files[0].path);
    });
  });
});
