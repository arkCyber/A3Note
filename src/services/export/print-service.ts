import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { log } from '../../utils/logger';

/**
 * Print Service
 * Handles document printing with proper styling
 * 
 * @aerospace-grade
 * Features:
 * - Print preview
 * - Custom print styles
 * - Page break control
 * - Header/footer support
 * - Margin configuration
 */

export interface PrintOptions {
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  cssTheme?: 'light' | 'dark';
}

export class PrintService {
  private printWindow: Window | null = null;

  /**
   * Print markdown content
   */
  async print(content: string, options: PrintOptions = {}): Promise<void> {
    try {
      log.info('[PrintService] Starting print');

      // Convert Markdown to HTML
      const html = await this.markdownToHTML(content);

      // Create print window
      await this.openPrintWindow(html, options);

      log.info('[PrintService] Print dialog opened');
    } catch (error) {
      log.error('[PrintService] Print failed', error as Error);
      throw error;
    }
  }

  /**
   * Show print preview
   */
  async preview(content: string, options: PrintOptions = {}): Promise<void> {
    try {
      log.info('[PrintService] Opening print preview');

      const html = await this.markdownToHTML(content);
      await this.openPrintWindow(html, options, true);

      log.info('[PrintService] Print preview opened');
    } catch (error) {
      log.error('[PrintService] Preview failed', error as Error);
      throw error;
    }
  }

  private async markdownToHTML(content: string): Promise<string> {
    // Configure marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Convert to HTML
    let html = await marked(content);

    // Sanitize HTML
    html = DOMPurify.sanitize(html);

    return html;
  }

  private async openPrintWindow(
    html: string,
    options: PrintOptions,
    previewOnly = false
  ): Promise<void> {
    const printContent = this.createPrintDocument(html, options);

    // Create new window for printing
    this.printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!this.printWindow) {
      throw new Error('Failed to open print window. Please allow popups.');
    }

    // Write content
    this.printWindow.document.write(printContent);
    this.printWindow.document.close();

    // Wait for content to load
    await new Promise(resolve => {
      if (this.printWindow) {
        this.printWindow.onload = resolve;
      }
    });

    // Trigger print dialog
    if (!previewOnly) {
      setTimeout(() => {
        if (this.printWindow) {
          this.printWindow.print();
          // Close window after printing
          this.printWindow.onafterprint = () => {
            this.printWindow?.close();
          };
        }
      }, 250);
    }
  }

  private createPrintDocument(html: string, options: PrintOptions): string {
    const title = options.title || 'Document';
    const pageSize = options.pageSize || 'A4';
    const orientation = options.orientation || 'portrait';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(title)}</title>
  <style>
    ${this.getPrintStyles(options)}
  </style>
</head>
<body>
  ${options.showHeader ? this.createHeader(title) : ''}
  <main class="content">
    ${html}
  </main>
  ${options.showFooter ? this.createFooter() : ''}
</body>
</html>`;
  }

  private getPrintStyles(options: PrintOptions): string {
    const margins = options.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    const isDark = options.cssTheme === 'dark';

    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      @page {
        size: ${options.pageSize || 'A4'} ${options.orientation || 'portrait'};
        margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        color: ${isDark ? '#d4d4d4' : '#24292e'};
        background-color: ${isDark ? '#1e1e1e' : '#ffffff'};
      }

      .content {
        max-width: 100%;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.25;
        page-break-after: avoid;
      }

      h1 { font-size: 2em; border-bottom: 2px solid #333; padding-bottom: 0.3em; }
      h2 { font-size: 1.5em; border-bottom: 1px solid #666; padding-bottom: 0.3em; }
      h3 { font-size: 1.25em; }
      h4 { font-size: 1.1em; }
      h5 { font-size: 1em; }
      h6 { font-size: 0.9em; }

      /* Paragraphs */
      p {
        margin: 0.8em 0;
        orphans: 3;
        widows: 3;
      }

      /* Code */
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
        margin: 1em 0;
      }

      pre code {
        background-color: transparent;
        padding: 0;
      }

      /* Lists */
      ul, ol {
        margin: 0.8em 0;
        padding-left: 2em;
      }

      li {
        margin: 0.3em 0;
      }

      /* Tables */
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

      /* Blockquotes */
      blockquote {
        border-left: 4px solid #ddd;
        padding-left: 1em;
        margin: 1em 0;
        color: #666;
        font-style: italic;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        page-break-inside: avoid;
        display: block;
        margin: 1em auto;
      }

      /* Links */
      a {
        color: #0066cc;
        text-decoration: none;
      }

      a[href]:after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
        color: #666;
      }

      /* Horizontal Rule */
      hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 2em 0;
      }

      /* Header & Footer */
      .print-header {
        text-align: center;
        padding-bottom: 1em;
        border-bottom: 1px solid #ddd;
        margin-bottom: 2em;
      }

      .print-footer {
        text-align: center;
        padding-top: 1em;
        border-top: 1px solid #ddd;
        margin-top: 2em;
        font-size: 0.9em;
        color: #666;
      }

      /* Page breaks */
      .page-break {
        page-break-after: always;
      }

      /* Print-specific */
      @media print {
        body {
          background-color: white;
          color: black;
        }

        a[href]:after {
          content: " (" attr(href) ")";
        }

        .no-print {
          display: none;
        }
      }

      @media screen {
        body {
          padding: 2em;
          max-width: 210mm;
          margin: 0 auto;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
      }
    `;
  }

  private createHeader(title: string): string {
    return `
      <header class="print-header">
        <h1>${this.escapeHTML(title)}</h1>
        <p>${new Date().toLocaleDateString()}</p>
      </header>
    `;
  }

  private createFooter(): string {
    return `
      <footer class="print-footer">
        <p>Generated by A3Note</p>
      </footer>
    `;
  }

  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Close print window
   */
  closePrintWindow(): void {
    if (this.printWindow && !this.printWindow.closed) {
      this.printWindow.close();
      this.printWindow = null;
    }
  }
}

export const printService = new PrintService();
