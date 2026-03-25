/**
 * File System Utilities Tests - Aerospace-grade testing
 * DO-178C Level A Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatFileSize,
  getFileExtension,
  isMarkdownFile,
  isImageFile,
  isVideoFile,
  isAudioFile,
  getFileName,
  getFileNameWithoutExtension,
  getDirectoryPath,
  joinPaths,
  normalizePath,
  isAbsolutePath,
  makeRelativePath,
  sanitizeFileName,
  generateUniqueFileName,
} from '../../utils/file-system-utils';

describe('File System Utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should format with decimals', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });

    it('should handle large files', () => {
      const result = formatFileSize(1099511627776);
      expect(result).toContain('TB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('document.md')).toBe('md');
      expect(getFileExtension('image.png')).toBe('png');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('file.test.js')).toBe('js');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should handle no extension', () => {
      expect(getFileExtension('README')).toBe('');
      expect(getFileExtension('Makefile')).toBe('');
    });

    it('should be case-insensitive', () => {
      expect(getFileExtension('FILE.TXT')).toBe('txt');
      expect(getFileExtension('Image.PNG')).toBe('png');
    });

    it('should handle paths', () => {
      expect(getFileExtension('/path/to/file.md')).toBe('md');
      expect(getFileExtension('C:\\Users\\file.txt')).toBe('txt');
    });
  });

  describe('File Type Checks', () => {
    describe('isMarkdownFile', () => {
      it('should identify markdown files', () => {
        expect(isMarkdownFile('note.md')).toBe(true);
        expect(isMarkdownFile('README.markdown')).toBe(true);
      });

      it('should reject non-markdown files', () => {
        expect(isMarkdownFile('file.txt')).toBe(false);
        expect(isMarkdownFile('image.png')).toBe(false);
      });
    });

    describe('isImageFile', () => {
      it('should identify image files', () => {
        expect(isImageFile('photo.jpg')).toBe(true);
        expect(isImageFile('image.png')).toBe(true);
        expect(isImageFile('graphic.svg')).toBe(true);
      });

      it('should reject non-image files', () => {
        expect(isImageFile('file.txt')).toBe(false);
        expect(isImageFile('video.mp4')).toBe(false);
      });
    });

    describe('isVideoFile', () => {
      it('should identify video files', () => {
        expect(isVideoFile('movie.mp4')).toBe(true);
        expect(isVideoFile('clip.webm')).toBe(true);
        expect(isVideoFile('video.mkv')).toBe(true);
      });

      it('should reject non-video files', () => {
        expect(isVideoFile('file.txt')).toBe(false);
        expect(isVideoFile('audio.mp3')).toBe(false);
      });
    });

    describe('isAudioFile', () => {
      it('should identify audio files', () => {
        expect(isAudioFile('song.mp3')).toBe(true);
        expect(isAudioFile('audio.wav')).toBe(true);
        expect(isAudioFile('music.flac')).toBe(true);
      });

      it('should reject non-audio files', () => {
        expect(isAudioFile('file.txt')).toBe(false);
        expect(isAudioFile('video.mp4')).toBe(false);
      });
    });
  });

  describe('getFileName', () => {
    it('should extract file name from path', () => {
      expect(getFileName('/path/to/file.txt')).toBe('file.txt');
      expect(getFileName('folder/document.md')).toBe('document.md');
    });

    it('should handle file name only', () => {
      expect(getFileName('file.txt')).toBe('file.txt');
    });

    it('should handle trailing slash', () => {
      expect(getFileName('/path/to/folder/')).toBe('');
    });
  });

  describe('getFileNameWithoutExtension', () => {
    it('should remove extension', () => {
      expect(getFileNameWithoutExtension('file.txt')).toBe('file');
      expect(getFileNameWithoutExtension('document.md')).toBe('document');
    });

    it('should handle multiple dots', () => {
      expect(getFileNameWithoutExtension('file.test.js')).toBe('file.test');
    });

    it('should handle no extension', () => {
      expect(getFileNameWithoutExtension('README')).toBe('README');
    });

    it('should handle paths', () => {
      expect(getFileNameWithoutExtension('/path/to/file.txt')).toBe('file');
    });
  });

  describe('getDirectoryPath', () => {
    it('should extract directory path', () => {
      expect(getDirectoryPath('/path/to/file.txt')).toBe('/path/to');
      expect(getDirectoryPath('folder/file.md')).toBe('folder');
    });

    it('should handle root directory', () => {
      expect(getDirectoryPath('/file.txt')).toBe('');
    });

    it('should handle current directory', () => {
      expect(getDirectoryPath('file.txt')).toBe('');
    });
  });

  describe('joinPaths', () => {
    it('should join paths correctly', () => {
      expect(joinPaths('path', 'to', 'file.txt')).toBe('path/to/file.txt');
      expect(joinPaths('/root', 'folder', 'file.md')).toBe('/root/folder/file.md');
    });

    it('should handle trailing slashes', () => {
      expect(joinPaths('path/', 'to/', 'file.txt')).toBe('path/to/file.txt');
    });

    it('should handle leading slashes', () => {
      expect(joinPaths('path', '/to', '/file.txt')).toBe('path/to/file.txt');
    });

    it('should handle empty parts', () => {
      expect(joinPaths('path', '', 'file.txt')).toBe('path/file.txt');
    });

    it('should handle single path', () => {
      expect(joinPaths('/path/to/file.txt')).toBe('/path/to/file.txt');
    });
  });

  describe('normalizePath', () => {
    it('should remove current directory references', () => {
      expect(normalizePath('./path/to/file.txt')).toBe('path/to/file.txt');
      expect(normalizePath('path/./to/file.txt')).toBe('path/to/file.txt');
    });

    it('should resolve parent directory references', () => {
      expect(normalizePath('path/to/../file.txt')).toBe('path/file.txt');
      expect(normalizePath('path/../to/file.txt')).toBe('to/file.txt');
    });

    it('should handle multiple parent references', () => {
      expect(normalizePath('path/to/../../file.txt')).toBe('file.txt');
    });

    it('should handle already normalized paths', () => {
      expect(normalizePath('path/to/file.txt')).toBe('path/to/file.txt');
    });
  });

  describe('isAbsolutePath', () => {
    it('should identify Unix absolute paths', () => {
      expect(isAbsolutePath('/path/to/file.txt')).toBe(true);
      expect(isAbsolutePath('/root')).toBe(true);
    });

    it('should identify Windows absolute paths', () => {
      expect(isAbsolutePath('C:/path/to/file.txt')).toBe(true);
      expect(isAbsolutePath('D:\\folder')).toBe(true);
    });

    it('should identify relative paths', () => {
      expect(isAbsolutePath('path/to/file.txt')).toBe(false);
      expect(isAbsolutePath('./file.txt')).toBe(false);
      expect(isAbsolutePath('../file.txt')).toBe(false);
    });
  });

  describe('makeRelativePath', () => {
    it('should make path relative to base', () => {
      expect(makeRelativePath('/path/to/file.txt', '/path')).toBe('to/file.txt');
      expect(makeRelativePath('/path/to/file.txt', '/path/to')).toBe('file.txt');
    });

    it('should use parent directory references', () => {
      expect(makeRelativePath('/path/file.txt', '/path/to')).toBe('../file.txt');
      expect(makeRelativePath('/other/file.txt', '/path/to')).toBe('../../other/file.txt');
    });

    it('should handle same path', () => {
      expect(makeRelativePath('/path/to/file.txt', '/path/to/file.txt')).toBe('.');
    });

    it('should handle common prefix', () => {
      expect(makeRelativePath('/path/to/file1.txt', '/path/to/file2.txt')).toBe('../file1.txt');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove invalid characters', () => {
      expect(sanitizeFileName('file<name>.txt')).toBe('filename.txt');
      expect(sanitizeFileName('file:name.txt')).toBe('filename.txt');
      expect(sanitizeFileName('file|name.txt')).toBe('filename.txt');
    });

    it('should remove leading dots', () => {
      expect(sanitizeFileName('...file.txt')).toBe('file.txt');
    });

    it('should trim whitespace', () => {
      expect(sanitizeFileName('  file.txt  ')).toBe('file.txt');
    });

    it('should handle multiple invalid characters', () => {
      expect(sanitizeFileName('file<>:"/\\|?*.txt')).toBe('file.txt');
    });

    it('should preserve valid characters', () => {
      expect(sanitizeFileName('valid-file_name.txt')).toBe('valid-file_name.txt');
    });
  });

  describe('generateUniqueFileName', () => {
    it('should return original name if unique', () => {
      const result = generateUniqueFileName('file.txt', ['other.txt']);
      expect(result).toBe('file.txt');
    });

    it('should add counter for duplicates', () => {
      const result = generateUniqueFileName('file.txt', ['file.txt']);
      expect(result).toBe('file 1.txt');
    });

    it('should increment counter for multiple duplicates', () => {
      const result = generateUniqueFileName('file.txt', ['file.txt', 'file 1.txt']);
      expect(result).toBe('file 2.txt');
    });

    it('should handle files without extension', () => {
      const result = generateUniqueFileName('README', ['README']);
      expect(result).toBe('README 1');
    });

    it('should preserve extension', () => {
      const result = generateUniqueFileName('document.md', ['document.md']);
      expect(result).toBe('document 1.md');
    });

    it('should handle large number of duplicates', () => {
      const existing = Array.from({ length: 100 }, (_, i) => 
        i === 0 ? 'file.txt' : `file ${i}.txt`
      );
      const result = generateUniqueFileName('file.txt', existing);
      expect(result).toBe('file 100.txt');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      expect(getFileExtension('')).toBe('');
      expect(getFileName('')).toBe('');
      expect(sanitizeFileName('')).toBe('');
    });

    it('should handle special characters in paths', () => {
      expect(getFileName('/path/with spaces/file.txt')).toBe('file.txt');
      expect(getFileName('/path/with-dashes/file.txt')).toBe('file.txt');
    });

    it('should handle unicode characters', () => {
      expect(getFileName('/路径/文件.txt')).toBe('文件.txt');
      expect(sanitizeFileName('文件名.txt')).toBe('文件名.txt');
    });

    it('should handle very long paths', () => {
      const longPath = '/a'.repeat(100) + '/file.txt';
      expect(getFileName(longPath)).toBe('file.txt');
    });

    it('should handle paths with only dots', () => {
      expect(normalizePath('././.')).toBe('');
      expect(normalizePath('../..')).toBe('');
    });
  });

  describe('Performance', () => {
    it('should handle large file lists efficiently', () => {
      const existing = Array.from({ length: 1000 }, (_, i) => `file${i}.txt`);

      const start = performance.now();
      generateUniqueFileName('newfile.txt', existing);
      const end = performance.now();

      expect(end - start).toBeLessThan(10);
    });

    it('should normalize paths efficiently', () => {
      const complexPath = Array(100).fill('..').join('/') + '/file.txt';

      const start = performance.now();
      normalizePath(complexPath);
      const end = performance.now();

      expect(end - start).toBeLessThan(5);
    });

    it('should join many paths efficiently', () => {
      const paths = Array.from({ length: 100 }, (_, i) => `part${i}`);

      const start = performance.now();
      joinPaths(...paths);
      const end = performance.now();

      expect(end - start).toBeLessThan(5);
    });
  });
});
