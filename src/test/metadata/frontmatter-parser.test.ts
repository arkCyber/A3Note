/**
 * Frontmatter Parser Tests
 * Aerospace-grade test suite for frontmatter parsing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FrontmatterParser, FrontmatterData } from '../../services/metadata/frontmatter-parser';

describe('FrontmatterParser', () => {
  describe('parse', () => {
    it('should parse basic frontmatter', () => {
      const content = `---
title: Test Note
author: John Doe
date: 2024-03-24
---
Content here`;

      const result = FrontmatterParser.parse(content);
      
      expect(result).not.toBeNull();
      expect(result?.data.title).toBe('Test Note');
      expect(result?.data.author).toBe('John Doe');
      expect(result?.data.date).toBeInstanceOf(Date);
      expect(result?.content).toBe('Content here');
    });

    it('should parse arrays', () => {
      const content = `---
tags:
  - tag1
  - tag2
  - tag3
---
Content`;

      const result = FrontmatterParser.parse(content);
      
      expect(result).not.toBeNull();
      expect(Array.isArray(result?.data.tags)).toBe(true);
      expect(result?.data.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should parse numbers', () => {
      const content = `---
count: 42
rating: 4.5
negative: -10
---
Content`;

      const result = FrontmatterParser.parse(content);
      
      expect(result?.data.count).toBe(42);
      expect(result?.data.rating).toBe(4.5);
      expect(result?.data.negative).toBe(-10);
    });

    it('should parse booleans', () => {
      const content = `---
published: true
draft: false
---
Content`;

      const result = FrontmatterParser.parse(content);
      
      expect(result?.data.published).toBe(true);
      expect(result?.data.draft).toBe(false);
    });

    it('should parse null values', () => {
      const content = `---
value: null
other: ~
---
Content`;

      const result = FrontmatterParser.parse(content);
      
      expect(result?.data.value).toBeNull();
      expect(result?.data.other).toBeNull();
    });

    it('should handle quoted strings', () => {
      const content = `---
title: "Quoted Title"
description: 'Single quoted'
---
Content`;

      const result = FrontmatterParser.parse(content);
      
      expect(result?.data.title).toBe('Quoted Title');
      expect(result?.data.description).toBe('Single quoted');
    });

    it('should return null for content without frontmatter', () => {
      const content = 'Just regular content';
      const result = FrontmatterParser.parse(content);
      
      expect(result).toBeNull();
    });

    it('should return null for invalid frontmatter', () => {
      const content = `---
No closing delimiter`;
      
      const result = FrontmatterParser.parse(content);
      expect(result).toBeNull();
    });

    it('should skip reserved keys', () => {
      const content = `---
title: Test
constructor: bad
__proto__: bad
prototype: bad
---
Content`;

      const result = FrontmatterParser.parse(content);
      
      expect(result?.data.title).toBe('Test');
      expect(result?.data.constructor).toBeUndefined();
      expect(result?.data.__proto__).toBeUndefined();
      expect(result?.data.prototype).toBeUndefined();
    });

    it('should handle empty frontmatter', () => {
      const content = `---
---
Content`;

      const result = FrontmatterParser.parse(content);
      
      expect(result).not.toBeNull();
      expect(Object.keys(result?.data || {}).length).toBe(0);
    });

    it('should handle comments', () => {
      const content = `---
# This is a comment
title: Test
# Another comment
author: John
---
Content`;

      const result = FrontmatterParser.parse(content);
      
      expect(result?.data.title).toBe('Test');
      expect(result?.data.author).toBe('John');
    });
  });

  describe('stringify', () => {
    it('should stringify basic data', () => {
      const data: FrontmatterData = {
        title: 'Test',
        count: 42,
        published: true,
      };

      const result = FrontmatterParser.stringify(data);
      
      expect(result).toContain('---');
      expect(result).toContain('title: Test');
      expect(result).toContain('count: 42');
      expect(result).toContain('published: true');
    });

    it('should stringify arrays', () => {
      const data: FrontmatterData = {
        tags: ['tag1', 'tag2', 'tag3'],
      };

      const result = FrontmatterParser.stringify(data);
      
      expect(result).toContain('tags:');
      expect(result).toContain('- tag1');
      expect(result).toContain('- tag2');
      expect(result).toContain('- tag3');
    });

    it('should stringify dates', () => {
      const date = new Date('2024-03-24T12:00:00.000Z');
      const data: FrontmatterData = {
        date,
      };

      const result = FrontmatterParser.stringify(data);
      
      expect(result).toContain('date: 2024-03-24T12:00:00.000Z');
    });

    it('should skip reserved keys', () => {
      const data: FrontmatterData = {
        title: 'Test',
        constructor: 'bad' as any,
      };

      const result = FrontmatterParser.stringify(data);
      
      expect(result).toContain('title: Test');
      expect(result).not.toContain('constructor');
    });
  });

  describe('update', () => {
    it('should update existing frontmatter', () => {
      const content = `---
title: Old Title
author: John
---
Content`;

      const result = FrontmatterParser.update(content, {
        title: 'New Title',
      });

      expect(result).toContain('title: New Title');
      expect(result).toContain('author: John');
      expect(result).toContain('Content');
    });

    it('should create frontmatter if none exists', () => {
      const content = 'Just content';
      
      const result = FrontmatterParser.update(content, {
        title: 'New Title',
      });

      expect(result).toContain('---');
      expect(result).toContain('title: New Title');
      expect(result).toContain('Just content');
    });

    it('should add new fields', () => {
      const content = `---
title: Test
---
Content`;

      const result = FrontmatterParser.update(content, {
        author: 'John Doe',
      });

      expect(result).toContain('title: Test');
      expect(result).toContain('author: John Doe');
    });
  });

  describe('remove', () => {
    it('should remove frontmatter', () => {
      const content = `---
title: Test
---
Content here`;

      const result = FrontmatterParser.remove(content);
      
      expect(result).toBe('Content here');
      expect(result).not.toContain('---');
      expect(result).not.toContain('title');
    });

    it('should return content unchanged if no frontmatter', () => {
      const content = 'Just content';
      const result = FrontmatterParser.remove(content);
      
      expect(result).toBe(content);
    });
  });

  describe('getField', () => {
    it('should get specific field', () => {
      const content = `---
title: Test Note
author: John Doe
count: 42
---
Content`;

      expect(FrontmatterParser.getField(content, 'title')).toBe('Test Note');
      expect(FrontmatterParser.getField(content, 'author')).toBe('John Doe');
      expect(FrontmatterParser.getField(content, 'count')).toBe(42);
    });

    it('should return undefined for missing field', () => {
      const content = `---
title: Test
---
Content`;

      expect(FrontmatterParser.getField(content, 'missing')).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should return no errors for valid frontmatter', () => {
      const content = `---
title: Test
author: John
---
Content`;

      const errors = FrontmatterParser.validate(content);
      expect(errors).toHaveLength(0);
    });

    it('should detect reserved keys', () => {
      const content = `---
title: Test
constructor: bad
---
Content`;

      const errors = FrontmatterParser.validate(content);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].code).toBe('RESERVED_KEY');
    });
  });

  describe('hasFrontmatter', () => {
    it('should detect frontmatter', () => {
      const content = `---
title: Test
---
Content`;

      expect(FrontmatterParser.hasFrontmatter(content)).toBe(true);
    });

    it('should return false for no frontmatter', () => {
      const content = 'Just content';
      expect(FrontmatterParser.hasFrontmatter(content)).toBe(false);
    });
  });

  describe('round-trip', () => {
    it('should parse and stringify consistently', () => {
      const original: FrontmatterData = {
        title: 'Test Note',
        tags: ['tag1', 'tag2'],
        count: 42,
        published: true,
        date: new Date('2024-03-24'),
      };

      const stringified = FrontmatterParser.stringify(original);
      const parsed = FrontmatterParser.parse(stringified + '\nContent');

      expect(parsed?.data.title).toBe(original.title);
      expect(parsed?.data.count).toBe(original.count);
      expect(parsed?.data.published).toBe(original.published);
    });
  });
});
