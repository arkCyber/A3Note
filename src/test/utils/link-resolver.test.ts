/**
 * LinkResolver Tests - Aerospace-grade test suite
 * 70+ comprehensive test cases
 */

import { describe, it, expect } from 'vitest';
import { LinkResolver } from '../../utils/link-resolver';

describe('LinkResolver - Aerospace-grade Tests', () => {
  describe('isWikilink()', () => {
    it('should detect valid wikilinks', () => {
      expect(LinkResolver.isWikilink('[[note]]')).toBe(true);
      expect(LinkResolver.isWikilink('[[path/to/note]]')).toBe(true);
      expect(LinkResolver.isWikilink('[[note|alias]]')).toBe(true);
    });

    it('should reject invalid wikilinks', () => {
      expect(LinkResolver.isWikilink('[note]')).toBe(false);
      expect(LinkResolver.isWikilink('[[note')).toBe(false);
      expect(LinkResolver.isWikilink('note]]')).toBe(false);
      expect(LinkResolver.isWikilink('note')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(LinkResolver.isWikilink('  [[note]]  ')).toBe(true);
    });
  });

  describe('parseWikilink()', () => {
    it('should parse simple wikilink', () => {
      const result = LinkResolver.parseWikilink('[[note]]');
      expect(result.path).toBe('note');
      expect(result.alias).toBeUndefined();
      expect(result.heading).toBeUndefined();
      expect(result.block).toBeUndefined();
    });

    it('should parse wikilink with alias', () => {
      const result = LinkResolver.parseWikilink('[[note|My Note]]');
      expect(result.path).toBe('note');
      expect(result.alias).toBe('My Note');
    });

    it('should parse wikilink with heading', () => {
      const result = LinkResolver.parseWikilink('[[note#Section]]');
      expect(result.path).toBe('note');
      expect(result.heading).toBe('Section');
    });

    it('should parse wikilink with block', () => {
      const result = LinkResolver.parseWikilink('[[note^block-id]]');
      expect(result.path).toBe('note');
      expect(result.block).toBe('block-id');
    });

    it('should parse complex wikilink', () => {
      const result = LinkResolver.parseWikilink('[[note#Section^block-id|Alias]]');
      expect(result.path).toBe('note');
      expect(result.heading).toBe('Section');
      expect(result.block).toBe('block-id');
      expect(result.alias).toBe('Alias');
    });

    it('should handle paths', () => {
      const result = LinkResolver.parseWikilink('[[folder/subfolder/note]]');
      expect(result.path).toBe('folder/subfolder/note');
    });

    it('should handle whitespace', () => {
      const result = LinkResolver.parseWikilink('[[ note | alias ]]');
      expect(result.path).toBe('note');
      expect(result.alias).toBe('alias');
    });
  });

  describe('formatWikilink()', () => {
    it('should format simple wikilink', () => {
      expect(LinkResolver.formatWikilink({ path: 'note' })).toBe('[[note]]');
    });

    it('should format wikilink with alias', () => {
      expect(LinkResolver.formatWikilink({ path: 'note', alias: 'My Note' })).toBe('[[note|My Note]]');
    });

    it('should format wikilink with heading', () => {
      expect(LinkResolver.formatWikilink({ path: 'note', heading: 'Section' })).toBe('[[note#Section]]');
    });

    it('should format wikilink with block', () => {
      expect(LinkResolver.formatWikilink({ path: 'note', block: 'block-id' })).toBe('[[note^block-id]]');
    });

    it('should format complex wikilink', () => {
      const result = LinkResolver.formatWikilink({
        path: 'note',
        heading: 'Section',
        block: 'block-id',
        alias: 'Alias',
      });
      expect(result).toBe('[[note#Section^block-id|Alias]]');
    });
  });

  describe('isMarkdownLink()', () => {
    it('should detect valid markdown links', () => {
      expect(LinkResolver.isMarkdownLink('[text](url)')).toBe(true);
      expect(LinkResolver.isMarkdownLink('[link](http://example.com)')).toBe(true);
    });

    it('should reject invalid markdown links', () => {
      expect(LinkResolver.isMarkdownLink('[text]')).toBe(false);
      expect(LinkResolver.isMarkdownLink('(url)')).toBe(false);
      expect(LinkResolver.isMarkdownLink('[text]()')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(LinkResolver.isMarkdownLink('  [text](url)  ')).toBe(true);
    });
  });

  describe('parseMarkdownLink()', () => {
    it('should parse simple markdown link', () => {
      const result = LinkResolver.parseMarkdownLink('[text](url)');
      expect(result.text).toBe('text');
      expect(result.url).toBe('url');
      expect(result.title).toBeUndefined();
    });

    it('should parse markdown link with title', () => {
      const result = LinkResolver.parseMarkdownLink('[text](url "title")');
      expect(result.text).toBe('text');
      expect(result.url).toBe('url');
      expect(result.title).toBe('title');
    });

    it('should handle complex URLs', () => {
      const result = LinkResolver.parseMarkdownLink('[link](https://example.com/path?query=1)');
      expect(result.url).toBe('https://example.com/path?query=1');
    });

    it('should handle invalid format', () => {
      const result = LinkResolver.parseMarkdownLink('[text]');
      expect(result.url).toBe('');
      expect(result.text).toBe('');
    });
  });

  describe('formatMarkdownLink()', () => {
    it('should format simple markdown link', () => {
      expect(LinkResolver.formatMarkdownLink({ text: 'text', url: 'url' })).toBe('[text](url)');
    });

    it('should format markdown link with title', () => {
      const result = LinkResolver.formatMarkdownLink({
        text: 'text',
        url: 'url',
        title: 'title',
      });
      expect(result).toBe('[text](url "title")');
    });
  });

  describe('resolveLink()', () => {
    it('should resolve relative wikilink', () => {
      const result = LinkResolver.resolveLink('[[note]]', '/folder/source.md', '/vault');
      expect(result).toBe('/folder/note.md');
    });

    it('should resolve absolute wikilink', () => {
      const result = LinkResolver.resolveLink('[[/other/note]]', '/folder/source.md', '/vault');
      expect(result).toBe('/vault/other/note.md');
    });

    it('should add .md extension', () => {
      const result = LinkResolver.resolveLink('[[note]]', '/source.md');
      expect(result).toContain('.md');
    });

    it('should handle existing extension', () => {
      const result = LinkResolver.resolveLink('[[note.md]]', '/source.md');
      expect(result).toBe('note.md');
    });

    it('should handle nested paths', () => {
      const result = LinkResolver.resolveLink('[[../other/note]]', '/folder/source.md');
      expect(result).toBe('other/note.md');
    });
  });

  describe('wikilinkToMarkdown()', () => {
    it('should convert simple wikilink', () => {
      const result = LinkResolver.wikilinkToMarkdown('[[note]]', 'note.md');
      expect(result).toBe('[note](note.md)');
    });

    it('should use alias as text', () => {
      const result = LinkResolver.wikilinkToMarkdown('[[note|My Note]]', 'note.md');
      expect(result).toBe('[My Note](note.md)');
    });

    it('should convert heading to anchor', () => {
      const result = LinkResolver.wikilinkToMarkdown('[[note#Section]]', 'note.md');
      expect(result).toBe('[note](note.md#section)');
    });

    it('should handle block reference', () => {
      const result = LinkResolver.wikilinkToMarkdown('[[note^block-id]]', 'note.md');
      expect(result).toBe('[note](note.md#^block-id)');
    });
  });

  describe('markdownToWikilink()', () => {
    it('should convert simple markdown link', () => {
      const result = LinkResolver.markdownToWikilink('[text](note.md)');
      expect(result).toBe('[[note|text]]');
    });

    it('should handle same text and path', () => {
      const result = LinkResolver.markdownToWikilink('[note](note.md)');
      expect(result).toBe('[[note]]');
    });

    it('should convert anchor to heading', () => {
      const result = LinkResolver.markdownToWikilink('[text](note.md#section)');
      expect(result).toBe('[[note#section|text]]');
    });

    it('should convert block reference', () => {
      const result = LinkResolver.markdownToWikilink('[text](note.md#^block-id)');
      expect(result).toBe('[[note^block-id|text]]');
    });
  });

  describe('extractWikilinks()', () => {
    it('should extract single wikilink', () => {
      const result = LinkResolver.extractWikilinks('Some text [[note]] more text');
      expect(result).toEqual(['[[note]]']);
    });

    it('should extract multiple wikilinks', () => {
      const result = LinkResolver.extractWikilinks('[[note1]] and [[note2]] and [[note3]]');
      expect(result).toEqual(['[[note1]]', '[[note2]]', '[[note3]]']);
    });

    it('should extract complex wikilinks', () => {
      const result = LinkResolver.extractWikilinks('[[note#section|alias]] and [[other^block]]');
      expect(result).toEqual(['[[note#section|alias]]', '[[other^block]]']);
    });

    it('should return empty for no links', () => {
      const result = LinkResolver.extractWikilinks('No links here');
      expect(result).toEqual([]);
    });
  });

  describe('extractMarkdownLinks()', () => {
    it('should extract single markdown link', () => {
      const result = LinkResolver.extractMarkdownLinks('Some [text](url) here');
      expect(result).toEqual(['[text](url)']);
    });

    it('should extract multiple markdown links', () => {
      const result = LinkResolver.extractMarkdownLinks('[link1](url1) and [link2](url2)');
      expect(result).toEqual(['[link1](url1)', '[link2](url2)']);
    });

    it('should return empty for no links', () => {
      const result = LinkResolver.extractMarkdownLinks('No links here');
      expect(result).toEqual([]);
    });
  });

  describe('extractAllLinks()', () => {
    it('should extract both wikilinks and markdown links', () => {
      const text = '[[wikilink]] and [markdown](url)';
      const result = LinkResolver.extractAllLinks(text);
      expect(result).toEqual(['[[wikilink]]', '[markdown](url)']);
    });

    it('should handle mixed content', () => {
      const text = 'Text [[note1]] more [link](url) and [[note2]]';
      const result = LinkResolver.extractAllLinks(text);
      expect(result.length).toBe(3);
    });
  });

  describe('isExternalLink()', () => {
    it('should detect HTTP links', () => {
      expect(LinkResolver.isExternalLink('http://example.com')).toBe(true);
      expect(LinkResolver.isExternalLink('https://example.com')).toBe(true);
    });

    it('should detect mailto links', () => {
      expect(LinkResolver.isExternalLink('mailto:test@example.com')).toBe(true);
    });

    it('should reject internal links', () => {
      expect(LinkResolver.isExternalLink('note.md')).toBe(false);
      expect(LinkResolver.isExternalLink('/path/to/note')).toBe(false);
    });
  });

  describe('isEmbed()', () => {
    it('should detect wikilink embeds', () => {
      expect(LinkResolver.isEmbed('![[image.png]]')).toBe(true);
      expect(LinkResolver.isEmbed('![[note]]')).toBe(true);
    });

    it('should detect markdown embeds', () => {
      expect(LinkResolver.isEmbed('![alt](image.png)')).toBe(true);
    });

    it('should reject non-embeds', () => {
      expect(LinkResolver.isEmbed('[[note]]')).toBe(false);
      expect(LinkResolver.isEmbed('[text](url)')).toBe(false);
    });
  });

  describe('parseEmbed()', () => {
    it('should parse wikilink embed', () => {
      const result = LinkResolver.parseEmbed('![[image.png]]');
      expect(result).toHaveProperty('path');
      expect((result as any).path).toBe('image.png');
    });

    it('should parse markdown embed', () => {
      const result = LinkResolver.parseEmbed('![alt](image.png)');
      expect(result).toHaveProperty('url');
      expect((result as any).url).toBe('image.png');
    });
  });

  describe('normalizeLinkPath()', () => {
    it('should remove .md extension', () => {
      expect(LinkResolver.normalizeLinkPath('note.md')).toBe('note');
      expect(LinkResolver.normalizeLinkPath('path/to/note.md')).toBe('path/to/note');
    });

    it('should normalize path', () => {
      expect(LinkResolver.normalizeLinkPath('a/./b/../c.md')).toBe('a/c');
    });
  });

  describe('getDisplayText()', () => {
    it('should get display text from wikilink', () => {
      expect(LinkResolver.getDisplayText('[[note]]')).toBe('note');
      expect(LinkResolver.getDisplayText('[[note|Alias]]')).toBe('Alias');
    });

    it('should get display text from markdown link', () => {
      expect(LinkResolver.getDisplayText('[text](url)')).toBe('text');
    });

    it('should return original for non-link', () => {
      expect(LinkResolver.getDisplayText('plain text')).toBe('plain text');
    });
  });

  describe('getLinkTarget()', () => {
    it('should get target from wikilink', () => {
      expect(LinkResolver.getLinkTarget('[[note]]')).toBe('note');
      expect(LinkResolver.getLinkTarget('[[path/to/note]]')).toBe('path/to/note');
    });

    it('should get target from markdown link', () => {
      expect(LinkResolver.getLinkTarget('[text](url)')).toBe('url');
    });

    it('should return original for non-link', () => {
      expect(LinkResolver.getLinkTarget('plain text')).toBe('plain text');
    });
  });

  describe('replaceLink()', () => {
    it('should replace link in text', () => {
      const result = LinkResolver.replaceLink('Text [[old]] more', '[[old]]', '[[new]]');
      expect(result).toBe('Text [[new]] more');
    });

    it('should replace all occurrences', () => {
      const result = LinkResolver.replaceLink('[[link]] and [[link]]', '[[link]]', '[[new]]');
      expect(result).toBe('[[new]] and [[new]]');
    });
  });

  describe('updateLinksOnRename()', () => {
    it('should update links when file is renamed', () => {
      const text = 'Link to [[note]] here';
      const result = LinkResolver.updateLinksOnRename(
        text,
        '/folder/note.md',
        '/folder/renamed.md',
        '/folder/source.md'
      );
      expect(result).toContain('[[renamed]]');
    });

    it('should not update unrelated links', () => {
      const text = '[[note1]] and [[note2]]';
      const result = LinkResolver.updateLinksOnRename(
        text,
        '/note1.md',
        '/renamed.md',
        '/source.md'
      );
      expect(result).toContain('[[renamed]]');
      expect(result).toContain('[[note2]]');
    });

    it('should preserve link components', () => {
      const text = '[[note#section|alias]]';
      const result = LinkResolver.updateLinksOnRename(
        text,
        '/note.md',
        '/renamed.md',
        '/source.md'
      );
      expect(result).toContain('[[renamed#section|alias]]');
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle empty strings', () => {
      expect(LinkResolver.parseWikilink('[[]]').path).toBe('');
      expect(LinkResolver.extractWikilinks('')).toEqual([]);
    });

    it('should handle special characters in links', () => {
      const result = LinkResolver.parseWikilink('[[note-with_special.chars]]');
      expect(result.path).toBe('note-with_special.chars');
    });

    it('should handle unicode in links', () => {
      const result = LinkResolver.parseWikilink('[[中文笔记]]');
      expect(result.path).toBe('中文笔记');
    });

    it('should handle nested brackets', () => {
      const result = LinkResolver.parseWikilink('[[note [with] brackets]]');
      expect(result.path).toBe('note [with] brackets');
    });

    it('should handle multiple hashes', () => {
      const result = LinkResolver.parseWikilink('[[note#section#subsection]]');
      expect(result.heading).toBe('section');
    });

    it('should handle very long links', () => {
      const longPath = 'a/'.repeat(50) + 'note';
      const result = LinkResolver.parseWikilink(`[[${longPath}]]`);
      expect(result.path).toBe(longPath);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large text efficiently', () => {
      const text = '[[link]] '.repeat(1000);
      const start = performance.now();
      
      const links = LinkResolver.extractWikilinks(text);
      
      const duration = performance.now() - start;
      expect(links.length).toBe(1000);
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });

    it('should parse many links efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        LinkResolver.parseWikilink(`[[note${i}#section|alias]]`);
        LinkResolver.parseMarkdownLink(`[text${i}](url${i})`);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50); // Should complete in <50ms
    });
  });
});
