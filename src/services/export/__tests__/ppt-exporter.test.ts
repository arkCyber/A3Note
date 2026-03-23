import { describe, it, expect, beforeEach } from 'vitest';
import { PPTExporter } from '../ppt-exporter';

describe('PPTExporter', () => {
  let exporter: PPTExporter;

  beforeEach(() => {
    exporter = new PPTExporter();
  });

  it('should create PPTExporter instance', () => {
    expect(exporter).toBeInstanceOf(PPTExporter);
  });

  it('should have export method', () => {
    expect(exporter.export).toBeDefined();
    expect(typeof exporter.export).toBe('function');
  });

  it('should export simple markdown to slides', async () => {
    const content = '# Title\n\nContent here\n\n## Slide 2\n\nMore content';
    const options = {
      format: 'pptx' as const,
      filename: 'test.pptx',
    };

    const result = await exporter.export(content, options);
    
    expect(result.success).toBe(true);
    expect(result.blob).toBeDefined();
    expect(result.size).toBeGreaterThan(0);
  });

  it('should create title slide from H1', async () => {
    const content = '# My Presentation';
    const options = {
      format: 'pptx' as const,
    };

    const result = await exporter.export(content, options);
    expect(result.success).toBe(true);
  });

  it('should create content slides from H2/H3', async () => {
    const content = '## Slide 1\n\nContent\n\n### Slide 2\n\nMore content';
    const options = {
      format: 'pptx' as const,
    };

    const result = await exporter.export(content, options);
    expect(result.success).toBe(true);
  });
});
