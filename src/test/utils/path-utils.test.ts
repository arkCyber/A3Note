/**
 * PathUtils Tests - Aerospace-grade test suite
 * 60+ comprehensive test cases
 */

import { describe, it, expect } from 'vitest';
import { PathUtils } from '../../utils/path-utils';

describe('PathUtils - Aerospace-grade Tests', () => {
  describe('normalize()', () => {
    it('should normalize simple paths', () => {
      expect(PathUtils.normalize('a/b/c')).toBe('a/b/c');
      expect(PathUtils.normalize('/a/b/c')).toBe('/a/b/c');
    });

    it('should remove redundant separators', () => {
      expect(PathUtils.normalize('a//b///c')).toBe('a/b/c');
      expect(PathUtils.normalize('/a//b/c')).toBe('/a/b/c');
    });

    it('should resolve . references', () => {
      expect(PathUtils.normalize('a/./b/./c')).toBe('a/b/c');
      expect(PathUtils.normalize('./a/b')).toBe('a/b');
    });

    it('should resolve .. references', () => {
      expect(PathUtils.normalize('a/b/../c')).toBe('a/c');
      expect(PathUtils.normalize('a/../b')).toBe('b');
      expect(PathUtils.normalize('../a/b')).toBe('../a/b');
    });

    it('should handle complex paths', () => {
      expect(PathUtils.normalize('a/b/../../c')).toBe('c');
      expect(PathUtils.normalize('/a/b/../c/./d')).toBe('/a/c/d');
    });

    it('should preserve leading slash', () => {
      expect(PathUtils.normalize('/a/b')).toBe('/a/b');
      expect(PathUtils.normalize('a/b')).toBe('a/b');
    });

    it('should preserve trailing slash', () => {
      expect(PathUtils.normalize('a/b/')).toBe('a/b/');
      expect(PathUtils.normalize('/a/b/')).toBe('/a/b/');
    });

    it('should handle empty and edge cases', () => {
      expect(PathUtils.normalize('')).toBe('.');
      expect(PathUtils.normalize('.')).toBe('.');
      expect(PathUtils.normalize('..')).toBe('..');
      expect(PathUtils.normalize('/')).toBe('/');
    });
  });

  describe('join()', () => {
    it('should join path segments', () => {
      expect(PathUtils.join('a', 'b', 'c')).toBe('a/b/c');
      expect(PathUtils.join('/a', 'b', 'c')).toBe('/a/b/c');
    });

    it('should handle empty segments', () => {
      expect(PathUtils.join('a', '', 'b')).toBe('a/b');
      expect(PathUtils.join('', 'a', 'b')).toBe('a/b');
    });

    it('should normalize joined paths', () => {
      expect(PathUtils.join('a', './b', 'c')).toBe('a/b/c');
      expect(PathUtils.join('a', 'b/..', 'c')).toBe('a/c');
    });

    it('should handle no arguments', () => {
      expect(PathUtils.join()).toBe('.');
    });

    it('should handle single argument', () => {
      expect(PathUtils.join('a/b')).toBe('a/b');
    });
  });

  describe('dirname()', () => {
    it('should get directory name', () => {
      expect(PathUtils.dirname('a/b/c')).toBe('a/b');
      expect(PathUtils.dirname('/a/b/c')).toBe('/a/b');
    });

    it('should handle root directory', () => {
      expect(PathUtils.dirname('/a')).toBe('/');
      expect(PathUtils.dirname('/')).toBe('/');
    });

    it('should handle no directory', () => {
      expect(PathUtils.dirname('file.txt')).toBe('.');
      expect(PathUtils.dirname('')).toBe('.');
    });

    it('should handle complex paths', () => {
      expect(PathUtils.dirname('a/b/../c/d')).toBe('a/c');
    });
  });

  describe('basename()', () => {
    it('should get base name', () => {
      expect(PathUtils.basename('a/b/c.txt')).toBe('c.txt');
      expect(PathUtils.basename('/a/b/c.txt')).toBe('c.txt');
    });

    it('should handle extension parameter', () => {
      expect(PathUtils.basename('a/b/c.txt', '.txt')).toBe('c');
      expect(PathUtils.basename('file.md', '.md')).toBe('file');
    });

    it('should handle no directory', () => {
      expect(PathUtils.basename('file.txt')).toBe('file.txt');
    });

    it('should handle empty path', () => {
      expect(PathUtils.basename('')).toBe('');
    });

    it('should handle trailing slash', () => {
      expect(PathUtils.basename('a/b/')).toBe('b');
    });
  });

  describe('extname()', () => {
    it('should get file extension', () => {
      expect(PathUtils.extname('file.txt')).toBe('.txt');
      expect(PathUtils.extname('file.md')).toBe('.md');
    });

    it('should handle multiple dots', () => {
      expect(PathUtils.extname('file.tar.gz')).toBe('.gz');
      expect(PathUtils.extname('my.file.txt')).toBe('.txt');
    });

    it('should handle no extension', () => {
      expect(PathUtils.extname('file')).toBe('');
      expect(PathUtils.extname('path/to/file')).toBe('');
    });

    it('should handle hidden files', () => {
      expect(PathUtils.extname('.gitignore')).toBe('');
      expect(PathUtils.extname('.config.json')).toBe('.json');
    });

    it('should handle empty path', () => {
      expect(PathUtils.extname('')).toBe('');
    });
  });

  describe('relative()', () => {
    it('should compute relative path', () => {
      expect(PathUtils.relative('a/b', 'a/c')).toBe('../c');
      expect(PathUtils.relative('a/b/c', 'a/d')).toBe('../../d');
    });

    it('should handle same path', () => {
      expect(PathUtils.relative('a/b', 'a/b')).toBe('.');
    });

    it('should handle child path', () => {
      expect(PathUtils.relative('a', 'a/b/c')).toBe('b/c');
    });

    it('should handle parent path', () => {
      expect(PathUtils.relative('a/b/c', 'a')).toBe('../..');
    });

    it('should handle completely different paths', () => {
      expect(PathUtils.relative('a/b', 'c/d')).toBe('../../c/d');
    });
  });

  describe('isAbsolute()', () => {
    it('should detect absolute paths', () => {
      expect(PathUtils.isAbsolute('/a/b')).toBe(true);
      expect(PathUtils.isAbsolute('/file.txt')).toBe(true);
    });

    it('should detect relative paths', () => {
      expect(PathUtils.isAbsolute('a/b')).toBe(false);
      expect(PathUtils.isAbsolute('./a/b')).toBe(false);
      expect(PathUtils.isAbsolute('../a/b')).toBe(false);
    });
  });

  describe('resolve()', () => {
    it('should resolve to absolute path', () => {
      expect(PathUtils.resolve('a', 'b', 'c')).toBe('/a/b/c');
    });

    it('should use first absolute path', () => {
      expect(PathUtils.resolve('a', '/b', 'c')).toBe('/b/c');
      expect(PathUtils.resolve('/a', 'b', '/c')).toBe('/c');
    });

    it('should handle empty segments', () => {
      expect(PathUtils.resolve('', 'a', 'b')).toBe('/a/b');
    });

    it('should normalize result', () => {
      expect(PathUtils.resolve('a', './b', '../c')).toBe('/a/c');
    });
  });

  describe('parse()', () => {
    it('should parse path components', () => {
      const parsed = PathUtils.parse('/a/b/file.txt');
      expect(parsed.root).toBe('/');
      expect(parsed.dir).toBe('/a/b');
      expect(parsed.base).toBe('file.txt');
      expect(parsed.ext).toBe('.txt');
      expect(parsed.name).toBe('file');
    });

    it('should parse relative path', () => {
      const parsed = PathUtils.parse('a/b/file.md');
      expect(parsed.root).toBe('');
      expect(parsed.dir).toBe('a/b');
      expect(parsed.base).toBe('file.md');
      expect(parsed.ext).toBe('.md');
      expect(parsed.name).toBe('file');
    });

    it('should parse path without extension', () => {
      const parsed = PathUtils.parse('a/b/file');
      expect(parsed.ext).toBe('');
      expect(parsed.name).toBe('file');
    });
  });

  describe('format()', () => {
    it('should format from components', () => {
      expect(PathUtils.format({ dir: 'a/b', base: 'file.txt' })).toBe('a/b/file.txt');
      expect(PathUtils.format({ root: '/', dir: '/a/b', base: 'file.txt' })).toBe('/a/b/file.txt');
    });

    it('should use name and ext if no base', () => {
      expect(PathUtils.format({ dir: 'a', name: 'file', ext: '.txt' })).toBe('a/file.txt');
    });

    it('should handle minimal components', () => {
      expect(PathUtils.format({ name: 'file', ext: '.txt' })).toBe('file.txt');
    });
  });

  describe('isChild()', () => {
    it('should detect child paths', () => {
      expect(PathUtils.isChild('a/b/c', 'a/b')).toBe(true);
      expect(PathUtils.isChild('/a/b/c', '/a')).toBe(true);
    });

    it('should reject non-child paths', () => {
      expect(PathUtils.isChild('a/b', 'a/b')).toBe(false);
      expect(PathUtils.isChild('a/b', 'a/c')).toBe(false);
      expect(PathUtils.isChild('a', 'a/b')).toBe(false);
    });
  });

  describe('commonBase()', () => {
    it('should find common base path', () => {
      expect(PathUtils.commonBase('a/b/c', 'a/b/d')).toBe('/a/b');
      expect(PathUtils.commonBase('a/b', 'a/c', 'a/d')).toBe('/a');
    });

    it('should handle no common base', () => {
      expect(PathUtils.commonBase('a/b', 'c/d')).toBe('/');
    });

    it('should handle single path', () => {
      expect(PathUtils.commonBase('a/b/c')).toBe('a/b');
    });

    it('should handle empty array', () => {
      expect(PathUtils.commonBase()).toBe('');
    });
  });

  describe('ensureExtension()', () => {
    it('should add extension if missing', () => {
      expect(PathUtils.ensureExtension('file', '.txt')).toBe('file.txt');
      expect(PathUtils.ensureExtension('file', 'txt')).toBe('file.txt');
    });

    it('should not add if already present', () => {
      expect(PathUtils.ensureExtension('file.txt', '.txt')).toBe('file.txt');
    });

    it('should handle different extensions', () => {
      expect(PathUtils.ensureExtension('file.md', '.txt')).toBe('file.md.txt');
    });
  });

  describe('removeExtension()', () => {
    it('should remove extension', () => {
      expect(PathUtils.removeExtension('file.txt')).toBe('file');
      expect(PathUtils.removeExtension('path/to/file.md')).toBe('path/to/file');
    });

    it('should handle no extension', () => {
      expect(PathUtils.removeExtension('file')).toBe('file');
    });

    it('should handle multiple dots', () => {
      expect(PathUtils.removeExtension('file.tar.gz')).toBe('file.tar');
    });
  });

  describe('changeExtension()', () => {
    it('should change extension', () => {
      expect(PathUtils.changeExtension('file.txt', '.md')).toBe('file.md');
      expect(PathUtils.changeExtension('file.txt', 'md')).toBe('file.md');
    });

    it('should add extension if missing', () => {
      expect(PathUtils.changeExtension('file', '.txt')).toBe('file.txt');
    });

    it('should handle paths', () => {
      expect(PathUtils.changeExtension('a/b/file.txt', '.md')).toBe('a/b/file.md');
    });
  });

  describe('sanitize()', () => {
    it('should remove invalid characters', () => {
      expect(PathUtils.sanitize('file<name>.txt')).toBe('filename.txt');
      expect(PathUtils.sanitize('file:name')).toBe('filename');
      expect(PathUtils.sanitize('file|name')).toBe('filename');
    });

    it('should convert backslashes', () => {
      expect(PathUtils.sanitize('a\\b\\c')).toBe('a/b/c');
    });

    it('should remove duplicate slashes', () => {
      expect(PathUtils.sanitize('a//b///c')).toBe('a/b/c');
    });

    it('should remove leading/trailing slashes', () => {
      expect(PathUtils.sanitize('/a/b/')).toBe('a/b');
    });
  });

  describe('isValid()', () => {
    it('should validate correct paths', () => {
      expect(PathUtils.isValid('a/b/c')).toBe(true);
      expect(PathUtils.isValid('file.txt')).toBe(true);
      expect(PathUtils.isValid('my-file_123.md')).toBe(true);
    });

    it('should reject invalid paths', () => {
      expect(PathUtils.isValid('file<name>')).toBe(false);
      expect(PathUtils.isValid('file:name')).toBe(false);
      expect(PathUtils.isValid('file|name')).toBe(false);
      expect(PathUtils.isValid('file?name')).toBe(false);
      expect(PathUtils.isValid('file*name')).toBe(false);
      expect(PathUtils.isValid('file\\name')).toBe(false);
    });
  });

  describe('getUniquePath()', () => {
    it('should return original if not exists', () => {
      expect(PathUtils.getUniquePath('file.txt', [])).toBe('file.txt');
      expect(PathUtils.getUniquePath('file.txt', ['other.txt'])).toBe('file.txt');
    });

    it('should add counter if exists', () => {
      expect(PathUtils.getUniquePath('file.txt', ['file.txt'])).toBe('file 1.txt');
      expect(PathUtils.getUniquePath('file.txt', ['file.txt', 'file 1.txt'])).toBe('file 2.txt');
    });

    it('should handle paths without extension', () => {
      expect(PathUtils.getUniquePath('file', ['file'])).toBe('file 1');
    });

    it('should increment until unique', () => {
      const existing = ['file.txt', 'file 1.txt', 'file 2.txt', 'file 3.txt'];
      expect(PathUtils.getUniquePath('file.txt', existing)).toBe('file 4.txt');
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle very long paths', () => {
      const longPath = 'a/'.repeat(100) + 'file.txt';
      expect(PathUtils.normalize(longPath)).toContain('file.txt');
    });

    it('should handle special characters in names', () => {
      expect(PathUtils.basename('file-name_123.txt')).toBe('file-name_123.txt');
      expect(PathUtils.basename('file (1).txt')).toBe('file (1).txt');
    });

    it('should handle unicode characters', () => {
      expect(PathUtils.normalize('文件/路径/文档.txt')).toBe('文件/路径/文档.txt');
      expect(PathUtils.basename('路径/文档.md')).toBe('文档.md');
    });

    it('should handle mixed separators', () => {
      expect(PathUtils.normalize('a/b\\c/d')).toBe('a/b\\c/d');
    });

    it('should handle consecutive dots', () => {
      expect(PathUtils.normalize('a/../../b')).toBe('../b');
      expect(PathUtils.normalize('./././a')).toBe('a');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of operations efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        PathUtils.normalize(`a/b/../c/d/e/f/g/h/${i}`);
        PathUtils.join('a', 'b', 'c', String(i));
        PathUtils.dirname(`a/b/c/${i}/file.txt`);
        PathUtils.basename(`file${i}.txt`);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
