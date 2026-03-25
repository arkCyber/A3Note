/**
 * Unlinked Mentions Service Tests - Aerospace-grade testing
 * DO-178C Level A Testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UnlinkedMentionsService } from '../../services/UnlinkedMentionsService';

describe('UnlinkedMentionsService', () => {
  let service: UnlinkedMentionsService;

  beforeEach(() => {
    service = new UnlinkedMentionsService();
  });

  describe('Find Unlinked Mentions', () => {
    it('should find unlinked mentions in files', async () => {
      const targetFile = '/notes/Project.md';
      const files = ['/notes/Meeting.md', '/notes/Tasks.md'];
      
      const getContent = async (path: string) => {
        if (path === '/notes/Meeting.md') {
          return 'Discussed the Project with team.';
        }
        if (path === '/notes/Tasks.md') {
          return 'Need to update Project documentation.';
        }
        return '';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBe(2);
      expect(result.mentions).toHaveLength(2);
      expect(result.searchedFiles).toBe(2);
    });

    it('should skip target file itself', async () => {
      const targetFile = '/notes/Project.md';
      const files = ['/notes/Project.md', '/notes/Other.md'];
      
      const getContent = async (path: string) => {
        return 'Mention of Project here.';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.searchedFiles).toBe(1);
    });

    it('should not find mentions that are already linked', async () => {
      const targetFile = '/notes/Project.md';
      const files = ['/notes/Meeting.md'];
      
      const getContent = async () => {
        return 'See [[Project]] for details.';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBe(0);
    });

    it('should not find markdown linked mentions', async () => {
      const targetFile = '/notes/Project.md';
      const files = ['/notes/Meeting.md'];
      
      const getContent = async () => {
        return 'See [Project](Project.md) for details.';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBe(0);
    });

    it('should handle file read errors gracefully', async () => {
      const targetFile = '/notes/Project.md';
      const files = ['/notes/Error.md', '/notes/Valid.md'];
      
      const getContent = async (path: string) => {
        if (path === '/notes/Error.md') {
          throw new Error('File read error');
        }
        return 'Project mention here.';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBe(1);
      expect(result.searchedFiles).toBe(2);
    });

    it('should find multiple mentions in same file', async () => {
      const targetFile = '/notes/Project.md';
      const files = ['/notes/Meeting.md'];
      
      const getContent = async () => {
        return 'Project started. Project ongoing. Project deadline.';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBe(3);
    });

    it('should provide context for each mention', async () => {
      const targetFile = '/notes/Project.md';
      const files = ['/notes/Meeting.md'];
      
      const getContent = async () => {
        return 'We discussed the Project implementation yesterday.';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.mentions[0].context).toContain('Project');
      expect(result.mentions[0].context.length).toBeGreaterThan(0);
    });
  });

  describe('File Name Variants', () => {
    it('should match different case variants', async () => {
      const targetFile = '/notes/MyProject.md';
      const files = ['/notes/Test.md'];
      
      const getContent = async () => {
        return 'myproject and MYPROJECT and MyProject';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBeGreaterThan(0);
    });

    it('should match space/hyphen/underscore variants', async () => {
      const targetFile = '/notes/My Project.md';
      const files = ['/notes/Test.md'];
      
      const getContent = async () => {
        return 'My-Project and My_Project and My Project';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBeGreaterThan(0);
    });
  });

  describe('Grouping and Sorting', () => {
    it('should group mentions by file', () => {
      const mentions = [
        { file: '/a.md', line: 1, column: 0, context: '', matchedText: 'test' },
        { file: '/a.md', line: 2, column: 0, context: '', matchedText: 'test' },
        { file: '/b.md', line: 1, column: 0, context: '', matchedText: 'test' },
      ];

      const grouped = service.groupByFile(mentions);

      expect(grouped.size).toBe(2);
      expect(grouped.get('/a.md')).toHaveLength(2);
      expect(grouped.get('/b.md')).toHaveLength(1);
    });

    it('should sort mentions by relevance', () => {
      const mentions = [
        { file: '/b.md', line: 1, column: 0, context: '', matchedText: 'Test' },
        { file: '/a.md', line: 1, column: 0, context: '', matchedText: 'test' },
      ];

      const sorted = service.sortByRelevance(mentions);

      expect(sorted[0].file).toBe('/a.md');
    });
  });

  describe('Filtering', () => {
    it('should filter by context length', () => {
      const mentions = [
        { file: '/a.md', line: 1, column: 0, context: 'short', matchedText: 'test' },
        { file: '/b.md', line: 1, column: 0, context: 'this is a longer context', matchedText: 'test' },
      ];

      const filtered = service.filterByContextLength(mentions, 10);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].file).toBe('/b.md');
    });
  });

  describe('Statistics', () => {
    it('should calculate statistics', () => {
      const result = {
        mentions: [
          { file: '/a.md', line: 1, column: 0, context: '', matchedText: 'test' },
          { file: '/a.md', line: 2, column: 0, context: '', matchedText: 'test' },
          { file: '/b.md', line: 1, column: 0, context: '', matchedText: 'test' },
        ],
        totalCount: 3,
        searchedFiles: 10,
      };

      const stats = service.getStatistics(result);

      expect(stats.totalMentions).toBe(3);
      expect(stats.uniqueFiles).toBe(2);
      expect(stats.averageMentionsPerFile).toBe(1.5);
      expect(stats.searchedFiles).toBe(10);
    });

    it('should handle empty results', () => {
      const result = {
        mentions: [],
        totalCount: 0,
        searchedFiles: 5,
      };

      const stats = service.getStatistics(result);

      expect(stats.totalMentions).toBe(0);
      expect(stats.uniqueFiles).toBe(0);
      expect(stats.averageMentionsPerFile).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list', async () => {
      const result = await service.findUnlinkedMentions(
        '/notes/Project.md',
        [],
        async () => ''
      );

      expect(result.totalCount).toBe(0);
      expect(result.searchedFiles).toBe(0);
    });

    it('should handle files with no content', async () => {
      const result = await service.findUnlinkedMentions(
        '/notes/Project.md',
        ['/notes/Empty.md'],
        async () => ''
      );

      expect(result.totalCount).toBe(0);
    });

    it('should handle special characters in file names', async () => {
      const targetFile = '/notes/Project (2024).md';
      const files = ['/notes/Test.md'];
      
      const getContent = async () => {
        return 'Mentioned Project (2024) here.';
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBeGreaterThan(0);
    });

    it('should handle very long file names', async () => {
      const longName = 'A'.repeat(200);
      const targetFile = `/notes/${longName}.md`;
      const files = ['/notes/Test.md'];
      
      const getContent = async () => {
        return `Mentioned ${longName} here.`;
      };

      const result = await service.findUnlinkedMentions(targetFile, files, getContent);

      expect(result.totalCount).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large number of files efficiently', async () => {
      const targetFile = '/notes/Project.md';
      const files: string[] = [];
      for (let i = 0; i < 100; i++) {
        files.push(`/notes/file${i}.md`);
      }

      const getContent = async () => 'Some content without Project mention.';

      const start = performance.now();
      await service.findUnlinkedMentions(targetFile, files, getContent);
      const end = performance.now();

      expect(end - start).toBeLessThan(1000); // Should complete in reasonable time
    });

    it('should handle large file content efficiently', async () => {
      const targetFile = '/notes/Project.md';
      const files = ['/notes/Large.md'];
      
      const largeContent = 'Some text. '.repeat(10000) + 'Project mention.';
      const getContent = async () => largeContent;

      const start = performance.now();
      const result = await service.findUnlinkedMentions(targetFile, files, getContent);
      const end = performance.now();

      expect(end - start).toBeLessThan(500);
      expect(result.totalCount).toBeGreaterThan(0);
    });
  });
});
