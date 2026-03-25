/**
 * Frontmatter Parser
 * Aerospace-grade YAML frontmatter parsing with strict validation
 */

import { log } from '../../utils/logger';

export interface FrontmatterData {
  [key: string]: FrontmatterValue;
}

export type FrontmatterValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | string[] 
  | number[] 
  | FrontmatterData 
  | null;

export interface ParseResult {
  data: FrontmatterData;
  content: string;
  raw: string;
  position: {
    start: number;
    end: number;
  };
}

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
  code: string;
}

/**
 * Frontmatter Parser with strict validation
 */
export class FrontmatterParser {
  private static readonly DELIMITER = '---';
  private static readonly MAX_FRONTMATTER_SIZE = 100000; // 100KB limit
  private static readonly RESERVED_KEYS = new Set(['constructor', '__proto__', 'prototype']);

  /**
   * Parse frontmatter from markdown content
   */
  static parse(content: string): ParseResult | null {
    try {
      // Validate input
      if (!content || typeof content !== 'string') {
        return null;
      }

      // Check if content starts with delimiter
      if (!content.trimStart().startsWith(this.DELIMITER)) {
        return null;
      }

      // Find frontmatter boundaries
      const lines = content.split('\n');
      let startLine = -1;
      let endLine = -1;

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        
        if (trimmed === this.DELIMITER) {
          if (startLine === -1) {
            startLine = i;
          } else {
            endLine = i;
            break;
          }
        }
      }

      // Validate frontmatter structure
      if (startLine === -1 || endLine === -1 || endLine <= startLine + 1) {
        return null;
      }

      // Extract frontmatter content
      const frontmatterLines = lines.slice(startLine + 1, endLine);
      const raw = frontmatterLines.join('\n');

      // Size validation
      if (raw.length > this.MAX_FRONTMATTER_SIZE) {
        log.warn('FrontmatterParser', `Frontmatter exceeds size limit: ${raw.length} bytes`);
        return null;
      }

      // Parse YAML
      const data = this.parseYAML(raw);

      // Calculate positions
      const startPos = lines.slice(0, startLine).join('\n').length + (startLine > 0 ? 1 : 0);
      const endPos = lines.slice(0, endLine + 1).join('\n').length;
      const remainingContent = lines.slice(endLine + 1).join('\n');

      return {
        data,
        content: remainingContent,
        raw,
        position: {
          start: startPos,
          end: endPos,
        },
      };
    } catch (error) {
      log.error('FrontmatterParser', 'Failed to parse frontmatter', error as Error);
      return null;
    }
  }

  /**
   * Parse YAML content into structured data
   */
  private static parseYAML(yaml: string): FrontmatterData {
    const data: FrontmatterData = {};
    const lines = yaml.split('\n');
    let currentKey: string | null = null;
    let arrayMode = false;
    let currentArray: FrontmatterValue[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Handle array items
      if (trimmed.startsWith('-')) {
        const value = trimmed.substring(1).trim();
        
        if (arrayMode && currentKey) {
          currentArray.push(this.parseValue(value));
        } else {
          // Start new array
          arrayMode = true;
          currentArray = [this.parseValue(value)];
        }
        continue;
      }

      // Handle key-value pairs
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        // Save previous array if exists
        if (arrayMode && currentKey && currentArray.length > 0) {
          data[currentKey] = currentArray.length === 1 ? currentArray[0] : currentArray as FrontmatterValue;
          arrayMode = false;
          currentArray = [];
        }

        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        // Validate key
        if (this.RESERVED_KEYS.has(key)) {
          log.warn('FrontmatterParser', `Skipping reserved key: ${key}`);
          continue;
        }

        currentKey = key;

        if (value) {
          // Direct value
          data[key] = this.parseValue(value);
          arrayMode = false;
        } else {
          // Possible array or object following
          arrayMode = false;
        }
      }
    }

    // Save final array if exists
    if (arrayMode && currentKey && currentArray.length > 0) {
      data[currentKey] = currentArray.length === 1 ? currentArray[0] : currentArray as FrontmatterValue;
    }

    return data;
  }

  /**
   * Parse individual value with type inference
   */
  private static parseValue(value: string): FrontmatterValue {
    const trimmed = value.trim();

    // Null
    if (trimmed === 'null' || trimmed === '~') {
      return null;
    }

    // Boolean
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // Number
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (!isNaN(num) && isFinite(num)) {
        return num;
      }
    }

    // Date (ISO 8601)
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(trimmed)) {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // String (remove quotes if present)
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.substring(1, trimmed.length - 1);
    }

    // Default to string
    return trimmed;
  }

  /**
   * Stringify frontmatter data to YAML
   */
  static stringify(data: FrontmatterData): string {
    try {
      const lines: string[] = [this.DELIMITER];

      for (const [key, value] of Object.entries(data)) {
        // Skip reserved keys
        if (this.RESERVED_KEYS.has(key)) {
          continue;
        }

        lines.push(this.stringifyKeyValue(key, value, 0));
      }

      lines.push(this.DELIMITER);
      return lines.join('\n');
    } catch (error) {
      log.error('FrontmatterParser', 'Failed to stringify frontmatter', error as Error);
      return '';
    }
  }

  /**
   * Stringify key-value pair
   */
  private static stringifyKeyValue(key: string, value: FrontmatterValue, indent: number): string {
    const spaces = ' '.repeat(indent);

    if (value === null) {
      return `${spaces}${key}: null`;
    }

    if (typeof value === 'boolean') {
      return `${spaces}${key}: ${value}`;
    }

    if (typeof value === 'number') {
      return `${spaces}${key}: ${value}`;
    }

    if (value instanceof Date) {
      return `${spaces}${key}: ${value.toISOString()}`;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return `${spaces}${key}: []`;
      }

      const lines = [`${spaces}${key}:`];
      for (const item of value) {
        if (typeof item === 'string') {
          lines.push(`${spaces}  - ${this.escapeString(item)}`);
        } else {
          lines.push(`${spaces}  - ${item}`);
        }
      }
      return lines.join('\n');
    }

    if (typeof value === 'object') {
      const lines = [`${spaces}${key}:`];
      for (const [subKey, subValue] of Object.entries(value)) {
        lines.push(this.stringifyKeyValue(subKey, subValue, indent + 2));
      }
      return lines.join('\n');
    }

    // String
    return `${spaces}${key}: ${this.escapeString(String(value))}`;
  }

  /**
   * Escape string for YAML
   */
  private static escapeString(str: string): string {
    // Quote if contains special characters
    if (/[:\[\]{},&*#?|\-<>=!%@`]/.test(str) || str.includes('\n')) {
      return `"${str.replace(/"/g, '\\"')}"`;
    }
    return str;
  }

  /**
   * Update frontmatter in content
   */
  static update(content: string, updates: Partial<FrontmatterData>): string {
    const parsed = this.parse(content);

    if (!parsed) {
      // No existing frontmatter, create new
      const newFrontmatter = this.stringify(updates as FrontmatterData);
      return `${newFrontmatter}\n${content}`;
    }

    // Merge updates (filter out undefined values)
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    ) as FrontmatterData;
    const merged = { ...parsed.data, ...filtered };
    const newFrontmatter = this.stringify(merged);

    // Replace old frontmatter
    return content.substring(0, parsed.position.start) +
           newFrontmatter +
           content.substring(parsed.position.end);
  }

  /**
   * Remove frontmatter from content
   */
  static remove(content: string): string {
    const parsed = this.parse(content);
    if (!parsed) {
      return content;
    }
    return parsed.content;
  }

  /**
   * Validate frontmatter structure
   */
  static validate(content: string): ParseError[] {
    const errors: ParseError[] = [];

    try {
      const parsed = this.parse(content);
      if (!parsed) {
        return errors;
      }

      // Check for reserved keys
      for (const key of Object.keys(parsed.data)) {
        if (this.RESERVED_KEYS.has(key)) {
          errors.push({
            message: `Reserved key not allowed: ${key}`,
            code: 'RESERVED_KEY',
          });
        }
      }

      // Check size
      if (parsed.raw.length > this.MAX_FRONTMATTER_SIZE) {
        errors.push({
          message: `Frontmatter exceeds maximum size of ${this.MAX_FRONTMATTER_SIZE} bytes`,
          code: 'SIZE_LIMIT',
        });
      }

    } catch (error) {
      errors.push({
        message: (error as Error).message,
        code: 'PARSE_ERROR',
      });
    }

    return errors;
  }

  /**
   * Extract specific field from frontmatter
   */
  static getField(content: string, field: string): FrontmatterValue | undefined {
    const parsed = this.parse(content);
    if (!parsed) {
      return undefined;
    }
    return parsed.data[field];
  }

  /**
   * Check if content has frontmatter
   */
  static hasFrontmatter(content: string): boolean {
    return content.trimStart().startsWith(this.DELIMITER);
  }
}

/**
 * Convenience functions
 */
export function parseFrontmatter(content: string): ParseResult | null {
  return FrontmatterParser.parse(content);
}

export function stringifyFrontmatter(data: FrontmatterData): string {
  return FrontmatterParser.stringify(data);
}

export function updateFrontmatter(content: string, updates: Partial<FrontmatterData>): string {
  return FrontmatterParser.update(content, updates);
}

export function removeFrontmatter(content: string): string {
  return FrontmatterParser.remove(content);
}

export function getFrontmatterField(content: string, field: string): FrontmatterValue | undefined {
  return FrontmatterParser.getField(content, field);
}
