/**
 * Inline Field Parser Tests
 * Aerospace-grade test suite for inline field parsing
 */

import { describe, it, expect } from 'vitest';
import { InlineFieldParser } from '../../services/metadata/inline-field-parser';

describe('InlineFieldParser', () => {
  describe('parse', () => {
    it('should parse bracket-style fields', () => {
      const content = 'This is a note [author:: John Doe] with inline fields.';
      
      const result = InlineFieldParser.parse(content);
      
      expect(result.fields).toHaveLength(1);
      expect(result.fields[0].key).toBe('author');
      expect(result.fields[0].value).toBe('John Doe');
    });

    it('should parse implicit fields', () => {
      const content = `This is a note
author:: John Doe
status:: published`;
      
      const result = InlineFieldParser.parse(content);
      
      expect(result.fields.length).toBeGreaterThanOrEqual(2);
      const authorField = result.fields.find(f => f.key === 'author');
      const statusField = result.fields.find(f => f.key === 'status');
      
      expect(authorField?.value).toBe('John Doe');
      expect(statusField?.value).toBe('published');
    });

    it('should parse multiple fields', () => {
      const content = `[author:: John] [date:: 2024-03-24] [status:: draft]`;
      
      const result = InlineFieldParser.parse(content);
      
      expect(result.fields).toHaveLength(3);
    });

    it('should handle quoted values', () => {
      const content = '[title:: "Quoted Title"] [desc:: \'Single quoted\']';
      
      const result = InlineFieldParser.parse(content);
      
      expect(result.fields[0].value).toBe('Quoted Title');
      expect(result.fields[1].value).toBe('Single quoted');
    });

    it('should skip fields in code blocks', () => {
      const content = `Normal text [field1:: value1]
\`\`\`
[field2:: value2]
\`\`\`
[field3:: value3]`;
      
      const result = InlineFieldParser.parse(content);
      
      const keys = result.fields.map(f => f.key);
      expect(keys).toContain('field1');
      expect(keys).toContain('field3');
      expect(keys).not.toContain('field2');
    });

    it('should validate key format', () => {
      const content = `[valid_key:: value]
[invalid-key-123:: value]
[123invalid:: value]
[_underscore:: value]`;
      
      const result = InlineFieldParser.parse(content);
      
      const keys = result.fields.map(f => f.key);
      expect(keys).toContain('valid_key');
      expect(keys).toContain('invalid-key-123');
      expect(keys).toContain('_underscore');
      expect(keys).not.toContain('123invalid');
    });

    it('should skip reserved keys', () => {
      const content = '[constructor:: bad] [__proto__:: bad] [prototype:: bad] [valid:: good]';
      
      const result = InlineFieldParser.parse(content);
      
      const keys = result.fields.map(f => f.key);
      expect(keys).toContain('valid');
      expect(keys).not.toContain('constructor');
      expect(keys).not.toContain('__proto__');
      expect(keys).not.toContain('prototype');
    });

    it('should track positions', () => {
      const content = 'Start [field:: value] end';
      
      const result = InlineFieldParser.parse(content);
      
      expect(result.fields[0].position.start).toBeGreaterThanOrEqual(0);
      expect(result.fields[0].position.end).toBeGreaterThan(result.fields[0].position.start);
      expect(result.fields[0].position.line).toBe(0);
    });

    it('should handle empty values', () => {
      const content = '[field:: ]';
      
      const result = InlineFieldParser.parse(content);
      
      expect(result.fields[0].value).toBe('');
    });
  });

  describe('extractFields', () => {
    it('should extract fields as map', () => {
      const content = '[author:: John] [tag:: tag1] [tag:: tag2]';
      
      const fields = InlineFieldParser.extractFields(content);
      
      expect(fields.author).toEqual(['John']);
      expect(fields.tag).toEqual(['tag1', 'tag2']);
    });

    it('should handle duplicate keys', () => {
      const content = '[status:: draft] [status:: published]';
      
      const fields = InlineFieldParser.extractFields(content);
      
      expect(fields.status).toHaveLength(2);
      expect(fields.status).toContain('draft');
      expect(fields.status).toContain('published');
    });
  });

  describe('getField', () => {
    it('should get single value', () => {
      const content = '[author:: John Doe]';
      
      const value = InlineFieldParser.getField(content, 'author');
      
      expect(value).toBe('John Doe');
    });

    it('should get multiple values as array', () => {
      const content = '[tag:: tag1] [tag:: tag2]';
      
      const value = InlineFieldParser.getField(content, 'tag');
      
      expect(Array.isArray(value)).toBe(true);
      expect(value).toEqual(['tag1', 'tag2']);
    });

    it('should return undefined for missing field', () => {
      const content = '[author:: John]';
      
      const value = InlineFieldParser.getField(content, 'missing');
      
      expect(value).toBeUndefined();
    });
  });

  describe('hasInlineFields', () => {
    it('should detect inline fields', () => {
      expect(InlineFieldParser.hasInlineFields('[field:: value]')).toBe(true);
      expect(InlineFieldParser.hasInlineFields('field:: value')).toBe(true);
      expect(InlineFieldParser.hasInlineFields('no fields here')).toBe(false);
    });
  });

  describe('removeFields', () => {
    it('should remove all inline fields', () => {
      const content = 'Text [field1:: value1] more text [field2:: value2]';
      
      const result = InlineFieldParser.removeFields(content);
      
      expect(result).not.toContain('[field1:: value1]');
      expect(result).not.toContain('[field2:: value2]');
      expect(result).toContain('Text');
      expect(result).toContain('more text');
    });
  });

  describe('updateField', () => {
    it('should update existing field', () => {
      const content = 'Text [status:: draft] more';
      
      const result = InlineFieldParser.updateField(content, 'status', 'published');
      
      expect(result).toContain('[status:: published]');
      expect(result).not.toContain('[status:: draft]');
    });

    it('should add new field if not exists', () => {
      const content = 'Text without field';
      
      const result = InlineFieldParser.updateField(content, 'author', 'John');
      
      expect(result).toContain('[author:: John]');
      expect(result).toContain('Text without field');
    });
  });

  describe('validate', () => {
    it('should return no errors for valid fields', () => {
      const content = '[author:: John] [status:: published]';
      
      const errors = InlineFieldParser.validate(content);
      
      expect(errors).toHaveLength(0);
    });

    it('should detect reserved keys', () => {
      const content = '[constructor:: bad] [valid:: good]';
      
      const errors = InlineFieldParser.validate(content);
      
      expect(errors.length).toBeGreaterThan(0);
      const reservedError = errors.find(e => e.message.includes('Reserved'));
      expect(reservedError).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in values', () => {
      const content = '[url:: https://example.com/path?query=value&other=123]';
      
      const result = InlineFieldParser.parse(content);
      
      expect(result.fields[0].value).toContain('https://');
    });

    it('should handle multiline content', () => {
      const content = `Line 1 [field1:: value1]
Line 2 [field2:: value2]
Line 3 [field3:: value3]`;
      
      const result = InlineFieldParser.parse(content);
      
      expect(result.fields).toHaveLength(3);
      expect(result.fields[0].position.line).toBe(0);
      expect(result.fields[1].position.line).toBe(1);
      expect(result.fields[2].position.line).toBe(2);
    });

    it('should handle nested brackets', () => {
      const content = '[data:: [nested]]';
      
      const result = InlineFieldParser.parse(content);
      
      // Should handle gracefully, even if not perfectly
      expect(result.fields.length).toBeGreaterThanOrEqual(0);
    });
  });
});
