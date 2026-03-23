import html2pdf from 'html2pdf.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ExportOptions, ExportResult } from './types';
import { log } from '../../utils/logger';

/**
 * PDF Exporter Service
 * Converts Markdown to PDF using html2pdf.js
 */

export class PDFExporter {
  async export(content: string, options: ExportOptions): Promise<ExportResult> {
    try {
      log.info('[PDFExporter] Starting PDF export');

      // Convert Markdown to HTML
      const html = await this.markdownToHTML(content, options);

      // Configure PDF options
      const pdfOptions = {
        margin: options.margins || { top: 20, right: 20, bottom: 20, left: 20 },
        filename: options.filename || 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: options.pageSize?.toLowerCase() || 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate PDF
      const element = this.createHTMLElement(html, options);
      const pdfBlob = await html2pdf()
        .set(pdfOptions)
        .from(element)
        .outputPdf('blob');

      // Clean up
      document.body.removeChild(element);

      log.info('[PDFExporter] PDF export completed', { size: pdfBlob.size });

      return {
        success: true,
        blob: pdfBlob,
        size: pdfBlob.size,
      };
    } catch (error) {
      log.error('[PDFExporter] Export failed', error as Error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async markdownToHTML(content: string, options: ExportOptions): Promise<string> {
    // Configure marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Convert to HTML
    let html = await marked(content);

    // Sanitize HTML
    html = DOMPurify.sanitize(html);

    // Add table of contents if requested
    if (options.includeTOC) {
      const toc = this.generateTOC(content);
      html = toc + html;
    }

    return html;
  }

  private generateTOC(content: string): string {
    const headings: Array<{ level: number; text: string; id: string }> = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = `heading-${index}`;
        headings.push({ level, text, id });
      }
    });

    if (headings.length === 0) return '';

    let toc = '<div class="table-of-contents"><h2>Table of Contents</h2><ul>';
    headings.forEach(heading => {
      const indent = '  '.repeat(heading.level - 1);
      toc += `${indent}<li><a href="#${heading.id}">${heading.text}</a></li>`;
    });
    toc += '</ul></div>';

    return toc;
  }

  private createHTMLElement(html: string, options: ExportOptions): HTMLElement {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '210mm'; // A4 width
    element.style.padding = '20mm';
    element.style.backgroundColor = 'white';
    element.style.color = 'black';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '12pt';
    element.style.lineHeight = '1.6';

    // Add CSS styles
    const styles = this.getStyles(options);
    element.innerHTML = `<style>${styles}</style>${html}`;

    document.body.appendChild(element);
    return element;
  }

  private getStyles(options: ExportOptions): string {
    const theme = options.cssTheme || 'light';
    
    return `
      * {
        box-sizing: border-box;
      }
      
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: bold;
        line-height: 1.3;
        page-break-after: avoid;
      }
      
      h1 { font-size: 2em; border-bottom: 2px solid #333; padding-bottom: 0.3em; }
      h2 { font-size: 1.5em; border-bottom: 1px solid #666; padding-bottom: 0.3em; }
      h3 { font-size: 1.25em; }
      h4 { font-size: 1.1em; }
      h5 { font-size: 1em; }
      h6 { font-size: 0.9em; color: #666; }
      
      p {
        margin: 0.8em 0;
        text-align: justify;
      }
      
      code {
        background-color: #f4f4f4;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
      }
      
      pre {
        background-color: #f4f4f4;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
        page-break-inside: avoid;
      }
      
      pre code {
        background-color: transparent;
        padding: 0;
      }
      
      blockquote {
        border-left: 4px solid #ddd;
        padding-left: 1em;
        margin: 1em 0;
        color: #666;
        font-style: italic;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
        page-break-inside: avoid;
      }
      
      th, td {
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }
      
      th {
        background-color: #f4f4f4;
        font-weight: bold;
      }
      
      ul, ol {
        margin: 0.8em 0;
        padding-left: 2em;
      }
      
      li {
        margin: 0.3em 0;
      }
      
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1em auto;
        page-break-inside: avoid;
      }
      
      a {
        color: #0066cc;
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      .table-of-contents {
        background-color: #f9f9f9;
        padding: 1em;
        border-radius: 5px;
        margin-bottom: 2em;
        page-break-after: always;
      }
      
      .table-of-contents h2 {
        margin-top: 0;
        border-bottom: none;
      }
      
      .table-of-contents ul {
        list-style-type: none;
        padding-left: 0;
      }
      
      .table-of-contents li {
        margin: 0.3em 0;
      }
      
      .table-of-contents a {
        color: #333;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `;
  }
}

export const pdfExporter = new PDFExporter();
