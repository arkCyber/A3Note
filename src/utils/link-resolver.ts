/**
 * Link Resolver - Aerospace-grade link resolution
 */

import { PathUtils } from './path-utils';

export interface WikilinkParts {
  path: string;
  alias?: string;
  block?: string;
  heading?: string;
}

export interface MarkdownLinkParts {
  url: string;
  text: string;
  title?: string;
}

/**
 * Link resolver for Obsidian-style links
 */
export class LinkResolver {
  /**
   * Resolve a wikilink to absolute path
   */
  static resolveLink(link: string, sourcePath: string, vaultPath: string = '/'): string {
    // Parse wikilink
    const parts = this.parseWikilink(link);
    let targetPath = parts.path;

    // Handle absolute paths
    if (targetPath.startsWith('/')) {
      return PathUtils.normalize(vaultPath + targetPath);
    }

    // Handle relative paths
    const sourceDir = PathUtils.dirname(sourcePath);
    const resolved = PathUtils.join(sourceDir, targetPath);

    // Ensure .md extension
    if (!PathUtils.extname(resolved)) {
      return resolved + '.md';
    }

    return resolved;
  }

  /**
   * Check if text is a wikilink
   */
  static isWikilink(text: string): boolean {
    return /^\[\[.+\]\]$/.test(text.trim());
  }

  /**
   * Parse wikilink into components
   */
  static parseWikilink(text: string): WikilinkParts {
    // Remove [[ and ]]
    let content = text.replace(/^\[\[|\]\]$/g, '').trim();

    const result: WikilinkParts = { path: '' };

    // Extract block reference (^block-id)
    const blockMatch = content.match(/\^([a-zA-Z0-9-]+)$/);
    if (blockMatch) {
      result.block = blockMatch[1];
      content = content.substring(0, blockMatch.index).trim();
    }

    // Extract heading (#heading)
    const headingMatch = content.match(/#([^#|]+)$/);
    if (headingMatch) {
      result.heading = headingMatch[1].trim();
      content = content.substring(0, headingMatch.index).trim();
    }

    // Extract alias (|alias)
    const aliasMatch = content.match(/\|(.+)$/);
    if (aliasMatch) {
      result.alias = aliasMatch[1].trim();
      content = content.substring(0, aliasMatch.index).trim();
    }

    // Remaining is the path
    result.path = content;

    return result;
  }

  /**
   * Format wikilink from components
   */
  static formatWikilink(parts: WikilinkParts): string {
    let link = parts.path;

    if (parts.heading) {
      link += '#' + parts.heading;
    }

    if (parts.block) {
      link += '^' + parts.block;
    }

    if (parts.alias) {
      link += '|' + parts.alias;
    }

    return `[[${link}]]`;
  }

  /**
   * Check if text is a markdown link
   */
  static isMarkdownLink(text: string): boolean {
    return /^\[.+\]\(.+\)$/.test(text.trim());
  }

  /**
   * Parse markdown link into components
   */
  static parseMarkdownLink(text: string): MarkdownLinkParts {
    const match = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    
    if (!match) {
      return { url: '', text: '' };
    }

    const [, linkText, url] = match;

    // Extract title from URL (url "title")
    const urlMatch = url.match(/^([^\s]+)(?:\s+"([^"]+)")?$/);
    
    if (urlMatch) {
      return {
        text: linkText,
        url: urlMatch[1],
        title: urlMatch[2],
      };
    }

    return {
      text: linkText,
      url,
    };
  }

  /**
   * Format markdown link from components
   */
  static formatMarkdownLink(parts: MarkdownLinkParts): string {
    let url = parts.url;
    
    if (parts.title) {
      url += ` "${parts.title}"`;
    }

    return `[${parts.text}](${url})`;
  }

  /**
   * Convert wikilink to markdown link
   */
  static wikilinkToMarkdown(wikilink: string, resolvedPath: string): string {
    const parts = this.parseWikilink(wikilink);
    const text = parts.alias || parts.path;
    
    let url = resolvedPath;
    if (parts.heading) {
      url += '#' + parts.heading.toLowerCase().replace(/\s+/g, '-');
    }
    if (parts.block) {
      url += '#^' + parts.block;
    }

    return this.formatMarkdownLink({ text, url });
  }

  /**
   * Convert markdown link to wikilink
   */
  static markdownToWikilink(markdownLink: string): string {
    const parts = this.parseMarkdownLink(markdownLink);
    
    // Extract path from URL
    let path = parts.url;
    let heading: string | undefined;
    let block: string | undefined;

    // Extract heading or block
    const hashIndex = path.indexOf('#');
    if (hashIndex !== -1) {
      const fragment = path.substring(hashIndex + 1);
      path = path.substring(0, hashIndex);

      if (fragment.startsWith('^')) {
        block = fragment.substring(1);
      } else {
        heading = fragment.replace(/-/g, ' ');
      }
    }

    // Remove .md extension
    path = path.replace(/\.md$/, '');

    const alias = parts.text !== path ? parts.text : undefined;

    return this.formatWikilink({ path, alias, heading, block });
  }

  /**
   * Extract all wikilinks from text
   */
  static extractWikilinks(text: string): string[] {
    const regex = /\[\[([^\]]+)\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      links.push(match[0]);
    }

    return links;
  }

  /**
   * Extract all markdown links from text
   */
  static extractMarkdownLinks(text: string): string[] {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      links.push(match[0]);
    }

    return links;
  }

  /**
   * Extract all links (both wikilinks and markdown links)
   */
  static extractAllLinks(text: string): string[] {
    return [
      ...this.extractWikilinks(text),
      ...this.extractMarkdownLinks(text),
    ];
  }

  /**
   * Check if link is external (URL)
   */
  static isExternalLink(link: string): boolean {
    return /^https?:\/\//.test(link) || /^mailto:/.test(link);
  }

  /**
   * Check if link is an embed
   */
  static isEmbed(text: string): boolean {
    return /^!\[\[.+\]\]$/.test(text.trim()) || /^!\[.+\]\(.+\)$/.test(text.trim());
  }

  /**
   * Parse embed link
   */
  static parseEmbed(text: string): WikilinkParts | MarkdownLinkParts {
    const content = text.substring(1); // Remove leading !

    if (this.isWikilink(content)) {
      return this.parseWikilink(content);
    } else if (this.isMarkdownLink(content)) {
      return this.parseMarkdownLink(content);
    }

    return { path: '' };
  }

  /**
   * Normalize link path (remove .md, normalize separators)
   */
  static normalizeLinkPath(path: string): string {
    return PathUtils.normalize(path.replace(/\.md$/, ''));
  }

  /**
   * Get display text for link
   */
  static getDisplayText(link: string): string {
    if (this.isWikilink(link)) {
      const parts = this.parseWikilink(link);
      return parts.alias || parts.path;
    } else if (this.isMarkdownLink(link)) {
      const parts = this.parseMarkdownLink(link);
      return parts.text;
    }

    return link;
  }

  /**
   * Get link target (path/URL)
   */
  static getLinkTarget(link: string): string {
    if (this.isWikilink(link)) {
      const parts = this.parseWikilink(link);
      return parts.path;
    } else if (this.isMarkdownLink(link)) {
      const parts = this.parseMarkdownLink(link);
      return parts.url;
    }

    return link;
  }

  /**
   * Replace link in text
   */
  static replaceLink(text: string, oldLink: string, newLink: string): string {
    return text.replace(oldLink, newLink);
  }

  /**
   * Update all links in text when file is renamed
   */
  static updateLinksOnRename(
    text: string,
    oldPath: string,
    newPath: string,
    sourcePath: string
  ): string {
    let updated = text;

    // Update wikilinks
    const wikilinks = this.extractWikilinks(text);
    for (const link of wikilinks) {
      const parts = this.parseWikilink(link);
      const resolved = this.resolveLink(link, sourcePath);

      if (PathUtils.normalize(resolved) === PathUtils.normalize(oldPath)) {
        const newParts = { ...parts, path: PathUtils.basename(newPath, '.md') };
        const newLink = this.formatWikilink(newParts);
        updated = this.replaceLink(updated, link, newLink);
      }
    }

    return updated;
  }
}
