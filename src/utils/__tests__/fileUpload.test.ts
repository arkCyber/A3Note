import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isValidMediaType,
  isValidFileSize,
  generateUniqueFileName,
  sanitizeFileName,
  validateMediaFile,
  getMediaSyntax,
} from '../fileUpload';

describe('fileUpload', () => {
  describe('isValidMediaType', () => {
    it('should accept valid image types', () => {
      expect(isValidMediaType('image/png')).toBe(true);
      expect(isValidMediaType('image/jpeg')).toBe(true);
      expect(isValidMediaType('image/gif')).toBe(true);
      expect(isValidMediaType('image/webp')).toBe(true);
    });

    it('should accept valid video types', () => {
      expect(isValidMediaType('video/mp4')).toBe(true);
      expect(isValidMediaType('video/webm')).toBe(true);
      expect(isValidMediaType('video/ogg')).toBe(true);
    });

    it('should accept valid audio types', () => {
      expect(isValidMediaType('audio/mpeg')).toBe(true);
      expect(isValidMediaType('audio/wav')).toBe(true);
      expect(isValidMediaType('audio/ogg')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(isValidMediaType('application/pdf')).toBe(false);
      expect(isValidMediaType('text/plain')).toBe(false);
      expect(isValidMediaType('application/zip')).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should accept files within size limit', () => {
      expect(isValidFileSize(1024)).toBe(true);
      expect(isValidFileSize(1024 * 1024)).toBe(true);
      expect(isValidFileSize(50 * 1024 * 1024)).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      expect(isValidFileSize(101 * 1024 * 1024)).toBe(false);
      expect(isValidFileSize(200 * 1024 * 1024)).toBe(false);
    });

    it('should reject zero or negative sizes', () => {
      expect(isValidFileSize(0)).toBe(false);
      expect(isValidFileSize(-1)).toBe(false);
    });
  });

  describe('generateUniqueFileName', () => {
    it('should generate unique file names', () => {
      const name1 = generateUniqueFileName('test.png');
      const name2 = generateUniqueFileName('test.png');
      
      expect(name1).not.toBe(name2);
      expect(name1).toMatch(/test-\d+-[a-z0-9]+\.png/);
    });

    it('should preserve file extension', () => {
      const name = generateUniqueFileName('image.jpg');
      expect(name).toMatch(/\.jpg$/);
    });

    it('should handle files without extension', () => {
      const name = generateUniqueFileName('noext');
      expect(name).toMatch(/noext-\d+-[a-z0-9]+$/);
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove invalid characters', () => {
      expect(sanitizeFileName('test file.png')).toBe('test_file.png');
      expect(sanitizeFileName('test@#$file.png')).toBe('test___file.png');
    });

    it('should collapse multiple underscores', () => {
      expect(sanitizeFileName('test___file.png')).toBe('test_file.png');
    });

    it('should trim leading/trailing underscores', () => {
      expect(sanitizeFileName('_test_.png')).toBe('test_.png');
    });

    it('should preserve valid characters', () => {
      expect(sanitizeFileName('test-file_123.png')).toBe('test-file_123.png');
    });
  });

  describe('validateMediaFile', () => {
    it('should validate correct image files', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      const result = validateMediaFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid file types', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      const result = validateMediaFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    it('should reject files exceeding size limit', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 101 * 1024 * 1024 });
      
      const result = validateMediaFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });
  });

  describe('getMediaSyntax', () => {
    it('should generate correct syntax for images', () => {
      const syntax = getMediaSyntax('attachments/image.png', 'image.png');
      expect(syntax).toBe('![[attachments/image.png]]');
    });

    it('should generate correct syntax for videos', () => {
      const syntax = getMediaSyntax('attachments/video.mp4', 'video.mp4');
      expect(syntax).toBe('![[attachments/video.mp4]]');
    });

    it('should generate correct syntax for audio', () => {
      const syntax = getMediaSyntax('attachments/audio.mp3', 'audio.mp3');
      expect(syntax).toBe('![[attachments/audio.mp3]]');
    });

    it('should handle unknown file types', () => {
      const syntax = getMediaSyntax('attachments/file.txt', 'file.txt');
      expect(syntax).toBe('[file.txt](attachments/file.txt)');
    });
  });
});
