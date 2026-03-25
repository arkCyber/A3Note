/**
 * Inline Field Parser
 * Parses Dataview-style inline fields: [key:: value]
 * Aerospace-grade parsing with strict validation
 */

import { log } from '../../utils/logger';

export interface InlineField {
  key: string;
  value: string;
  rawValue: string;
  position: {
    start: number;
    end: number;
    line: number;
  };
}

export interface ParsedInlineFields {
  fields: InlineField[];
  content: string;
}

/**
 * Inline field patterns
 */
const INLINE_FIELD_PATTERNS = {
  // [key:: value]
  brackets: /\[([^:\]]+)::\s*([^\]]*)\]/g,
  // key:: value (at start of line or after whitespace)
  implicit: /(?:^|\s)([a-zA-Z_][a-zA-Z0-9_-]*)::\s*([^\n]*?)(?=\s*$|\s*\n)/gm,
};

/**
 * Inline Field Parser
 */
export class InlineFieldParser {
  private static readonly MAX_KEY_LENGTH = 100;
  private static readonly MAX_VALUE_LENGTH = 10000;
  private static readonly RESERVED_KEYS = new Set(['constructor', '__proto__', 'prototype']);

  /**
   * Parse all inline fields from content
   */
  static parse(content: string): ParsedInlineFields {
    const fields: InlineField[] = [];
    const lines = content.split('\n');

    try {
      // Parse bracket-style fields [key:: value]
      const bracketFields = this.parseBracketFields(content, lines);
      fields.push(...bracketFields);

      // Parse implicit fields key:: value
      const implicitFields = this.parseImplicitFields(content, lines);
      fields.push(...implicitFields);

      // Sort by position
      fields.sort((a, b) => a.position.start - b.position.start);

      // Remove duplicates (same position)
      const uniqueFields = this.removeDuplicates(fields);

      return {
        fields: uniqueFields,
        content,
      };
    } catch (error) {
      log.error('InlineFieldParser', 'Failed to parse inline fields', error as Error);
      return { fields: [], content };
    }
  }

  /**
   * Parse bracket-style inline fields
   */
  private static parseBracketFields(content: string, lines: string[]): InlineField[] {
    const fields: InlineField[] = [];
    const regex = new RegExp(INLINE_FIELD_PATTERNS.brackets);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const key = match[1].trim();
      const rawValue = match[2].trim();

      // Validate key
      if (!this.validateKey(key)) {
        continue;
      }

      // Validate value length
      if (rawValue.length > this.MAX_VALUE_LENGTH) {
        log.warn('InlineFieldParser', `Value too long for key: ${key}`);
        continue;
      }

      // Find line number
      const lineNumber = this.getLineNumber(content, match.index, lines);

      fields.push({
        key,
        value: this.parseValue(rawValue),
        rawValue,
        position: {
          start: match.index,
          end: match.index + match[0].length,
          line: lineNumber,
        },
      });
    }

    return fields;
  }

  /**
   * Parse implicit inline fields
   */
  private static parseImplicitFields(content: string, lines: string[]): InlineField[] {
    const fields: InlineField[] = [];
    const regex = new RegExp(INLINE_FIELD_PATTERNS.implicit);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const key = match[1].trim();
      const rawValue = match[2].trim();

      // Validate key
      if (!this.validateKey(key)) {
        continue;
      }

      // Validate value length
      if (rawValue.length > this.MAX_VALUE_LENGTH) {
        log.warn('InlineFieldParser', `Value too long for key: ${key}`);
        continue;
      }

      // Find line number
      const lineNumber = this.getLineNumber(content, match.index, lines);

      // Skip if inside code block
      if (this.isInsideCodeBlock(content, match.index)) {
        continue;
      }

      fields.push({
        key,
        value: this.parseValue(rawValue),
        rawValue,
        position: {
          start: match.index,
          end: match.index + match[0].length,
          line: lineNumber,
        },
      });
    }

    return fields;
  }

  /**
   * Validate field key
   */
  private static validateKey(key: string): boolean {
    // Check length
    if (key.length === 0 || key.length > this.MAX_KEY_LENGTH) {
      return false;
    }

    // Check reserved keys
    if (this.RESERVED_KEYS.has(key)) {
      return false;
    }

    // Check format (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key)) {
      return false;
    }

    return true;
  }

  /**
   * Parse field value with type inference
   */
  private static parseValue(value: string): string {
    const trimmed = value.trim();

    // Remove surrounding quotes if present
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.substring(1, trimmed.length - 1);
    }

    return trimmed;
  }

  /**
   * Get line number from position
   */
  private static getLineNumber(content: string, position: number, lines: string[]): number {
    let currentPos = 0;
    for (let i = 0; i < lines.length; i++) {
      currentPos += lines[i].length + 1; // +1 for newline
      if (currentPos > position) {
        return i;
      }
    }
    return lines.length - 1;
  }

  /**
   * Check if position is inside code block
   */
  private static isInsideCodeBlock(content: string, position: number): boolean {
    const beforeContent = content.substring(0, position);
    const codeBlockMatches = beforeContent.match(/```/g);
    
    if (!codeBlockMatches) {
      return false;
    }

    // Odd number of ``` means we're inside a code block
    return codeBlockMatches.length % 2 === 1;
  }

  /**
   * Remove duplicate fields (same position)
   */
  private static removeDuplicates(fields: InlineField[]): InlineField[] {
    const seen = new Set<number>();
    return fields.filter(field => {
      if (seen.has(field.position.start)) {
        return false;
      }
      seen.add(field.position.start);
      return true;
    });
  }

  /**
   * Extract fields as key-value map
   */
  static extractFields(content: string): Record<string, string[]> {
    const parsed = this.parse(content);
    const map: Record<string, string[]> = {};

    for (const field of parsed.fields) {
      if (!map[field.key]) {
        map[field.key] = [];
      }
      map[field.key].push(field.value);
    }

    return map;
  }

  /**
   * Get field value by key
   */
  static getField(content: string, key: string): string | string[] | undefined {
    const fields = this.extractFields(content);
    const values = fields[key];

    if (!values || values.length === 0) {
      return undefined;
    }

    return values.length === 1 ? values[0] : values;
  }

  /**
   * Check if content has inline fields
   */
  static hasInlineFields(content: string): boolean {
    return INLINE_FIELD_PATTERNS.brackets.test(content) ||
           INLINE_FIELD_PATTERNS.implicit.test(content);
  }

  /**
   * Remove all inline fields from content
   */
  static removeFields(content: string): string {
    let result = content;

    // Remove bracket-style fields
    result = result.replace(INLINE_FIELD_PATTERNS.brackets, '');

    // Remove implicit fields
    result = result.replace(INLINE_FIELD_PATTERNS.implicit, '');

    return result;
  }

  /**
   * Update or add inline field
   */
  static updateField(content: string, key: string, value: string): string {
    const parsed = this.parse(content);
    const existingField = parsed.fields.find(f => f.key === key);

    if (existingField) {
      // Update existing field
      const before = content.substring(0, existingField.position.start);
      const after = content.substring(existingField.position.end);
      return `${before}[${key}:: ${value}]${after}`;
    } else {
      // Add new field at the end
      return `${content}\n[${key}:: ${value}]`;
    }
  }

  /**
   * Validate inline field syntax
   */
  static validate(content: string): Array<{ message: string; line: number }> {
    const errors: Array<{ message: string; line: number }> = [];
    const parsed = this.parse(content);

    for (const field of parsed.fields) {
      // Check key length
      if (field.key.length > this.MAX_KEY_LENGTH) {
        errors.push({
          message: `Key too long: ${field.key}`,
          line: field.position.line,
        });
      }

      // Check value length
      if (field.rawValue.length > this.MAX_VALUE_LENGTH) {
        errors.push({
          message: `Value too long for key: ${field.key}`,
          line: field.position.line,
        });
      }

      // Check reserved keys
      if (this.RESERVED_KEYS.has(field.key)) {
        errors.push({
          message: `Reserved key not allowed: ${field.key}`,
          line: field.position.line,
        });
      }
    }

    return errors;
  }
}

/**
 * Convenience functions
 */
export function parseInlineFields(content: string): ParsedInlineFields {
  return InlineFieldParser.parse(content);
}

export function extractInlineFields(content: string): Record<string, string[]> {
  return InlineFieldParser.extractFields(content);
}

export function getInlineField(content: string, key: string): string | string[] | undefined {
  return InlineFieldParser.getField(content, key);
}

export function removeInlineFields(content: string): string {
  return InlineFieldParser.removeFields(content);
}

export function updateInlineField(content: string, key: string, value: string): string {
  return InlineFieldParser.updateField(content, key, value);
}
