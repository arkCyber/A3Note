import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ExportOptions, ExportResult } from './types';
import { log } from '../../utils/logger';

/**
 * HTML Exporter Service
 * Converts Markdown to standalone HTML
 */

export class HTMLExporter {
  async export(content: string, options: ExportOptions): Promise<ExportResult> {
    try {
      log.info('[HTMLExporter] Starting HTML export');

      // Convert Markdown to HTML
      const bodyHTML = await this.markdownToHTML(content, options);

      // Create complete HTML document
      const fullHTML = this.createHTMLDocument(bodyHTML, options);

      // Create blob
      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });

      log.info('[HTMLExporter] HTML export completed', { size: blob.size });

      return {
        success: true,
        blob,
        size: blob.size,
      };
    } catch (error) {
      log.error('[HTMLExporter] Export failed', error as Error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async markdownToHTML(content: string, options: ExportOptions): Promise<string> {
    // Configure marked with extensions
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
    });

    // Convert to HTML
    let html = await marked(content);

    // Sanitize HTML
    html = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'em', 'u', 's', 'code', 'pre',
        'a', 'img',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote',
        'div', 'span',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    });

    return html;
  }

  private createHTMLDocument(bodyHTML: string, options: ExportOptions): string {
    const theme = options.cssTheme || 'light';
    const title = options.filename?.replace(/\.[^/.]+$/, '') || 'Document';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="A3Note">
  <title>${this.escapeHTML(title)}</title>
  <style>
    ${this.getStyles(theme)}
  </style>
</head>
<body class="theme-${theme}">
  <div class="container">
    <article class="markdown-body">
      ${bodyHTML}
    </article>
  </div>
</body>
</html>`;
  }

  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private getStyles(theme: string): string {
    const isDark = theme === 'dark';
    
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      :root {
        --bg-color: ${isDark ? '#1e1e1e' : '#ffffff'};
        --text-color: ${isDark ? '#d4d4d4' : '#24292e'};
        --heading-color: ${isDark ? '#ffffff' : '#1a1a1a'};
        --link-color: ${isDark ? '#58a6ff' : '#0366d6'};
        --border-color: ${isDark ? '#3e3e3e' : '#e1e4e8'};
        --code-bg: ${isDark ? '#2d2d2d' : '#f6f8fa'};
        --blockquote-border: ${isDark ? '#58a6ff' : '#dfe2e5'};
        --table-header-bg: ${isDark ? '#2d2d2d' : '#f6f8fa'};
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: var(--text-color);
        background-color: var(--bg-color);
        padding: 0;
        margin: 0;
      }
      
      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
      }
      
      .markdown-body {
        word-wrap: break-word;
      }
      
      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--heading-color);
      }
      
      h1 { 
        font-size: 2em; 
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.3em;
      }
      
      h2 { 
        font-size: 1.5em; 
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.3em;
      }
      
      h3 { font-size: 1.25em; }
      h4 { font-size: 1em; }
      h5 { font-size: 0.875em; }
      h6 { font-size: 0.85em; color: #6a737d; }
      
      /* Paragraphs */
      p {
        margin-top: 0;
        margin-bottom: 16px;
      }
      
      /* Links */
      a {
        color: var(--link-color);
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      /* Code */
      code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: var(--code-bg);
        border-radius: 6px;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      }
      
      pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: var(--code-bg);
        border-radius: 6px;
        margin-bottom: 16px;
      }
      
      pre code {
        display: inline;
        padding: 0;
        margin: 0;
        overflow: visible;
        line-height: inherit;
        background-color: transparent;
        border: 0;
      }
      
      /* Lists */
      ul, ol {
        padding-left: 2em;
        margin-top: 0;
        margin-bottom: 16px;
      }
      
      li {
        margin-top: 0.25em;
      }
      
      li + li {
        margin-top: 0.25em;
      }
      
      /* Blockquotes */
      blockquote {
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid var(--blockquote-border);
        margin: 0 0 16px 0;
      }
      
      blockquote > :first-child {
        margin-top: 0;
      }
      
      blockquote > :last-child {
        margin-bottom: 0;
      }
      
      /* Tables */
      table {
        border-spacing: 0;
        border-collapse: collapse;
        display: block;
        width: max-content;
        max-width: 100%;
        overflow: auto;
        margin-bottom: 16px;
      }
      
      table th {
        font-weight: 600;
        background-color: var(--table-header-bg);
      }
      
      table th,
      table td {
        padding: 6px 13px;
        border: 1px solid var(--border-color);
      }
      
      table tr {
        background-color: var(--bg-color);
        border-top: 1px solid var(--border-color);
      }
      
      /* Images */
      img {
        max-width: 100%;
        height: auto;
        box-sizing: content-box;
        background-color: var(--bg-color);
      }
      
      /* Horizontal Rule */
      hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: var(--border-color);
        border: 0;
      }
      
      /* Strong & Emphasis */
      strong {
        font-weight: 600;
      }
      
      em {
        font-style: italic;
      }
      
      /* Print styles */
      @media print {
        body {
          background-color: white;
          color: black;
        }
        
        .container {
          max-width: 100%;
        }
        
        a {
          color: #0366d6;
        }
      }
    `;
  }
}

export const htmlExporter = new HTMLExporter();
