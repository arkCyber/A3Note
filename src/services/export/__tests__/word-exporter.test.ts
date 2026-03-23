import { describe, it, expect, beforeEach } from 'vitest';
import { WordExporter } from '../word-exporter';

describe('WordExporter', () => {
  let exporter: WordExporter;

  beforeEach(() => {
    exporter = new WordExporter();
  });

  it('should create WordExporter instance', () => {
    expect(exporter).toBeInstanceOf(WordExporter);
  });

  it('should have export method', () => {
    expect(exporter.export).toBeDefined();
    expect(typeof exporter.export).toBe('function');
  });

  it('should export simple markdown', async () => {
    const content = '# Hello World\n\nThis is a test.';
    const options = {
      format: 'docx' as const,
      filename: 'test.docx',
    };

    const result = await exporter.export(content, options);
    
    expect(result.success).toBe(true);
    expect(result.blob).toBeDefined();
    expect(result.size).toBeGreaterThan(0);
  });

  it('should handle headings', async () => {
    const content = '# H1\n## H2\n### H3';
    const options = {
      format: 'docx' as const,
    };

    const result = await exporter.export(content, options);
    expect(result.success).toBe(true);
  });

  it('should handle lists', async () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    const options = {
      format: 'docx' as const,
    };

    const result = await exporter.export(content, options);
    expect(result.success).toBe(true);
  });

  it('should handle code blocks', async () => {
    const content = '```javascript\nconst x = 1;\n```';
    const options = {
      format: 'docx' as const,
    };

    const result = await exporter.export(content, options);
    expect(result.success).toBe(true);
  });
});
