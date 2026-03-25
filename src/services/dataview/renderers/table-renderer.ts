/**
 * Dataview TABLE View Renderer
 * Renders query results as a table with sorting and column customization
 */

import { QueryResult } from '../query-engine';

export interface TableRenderOptions {
  columns?: string[];
  sortable?: boolean;
  compact?: boolean;
  showRowNumbers?: boolean;
  maxRows?: number;
}

export class DataviewTableRenderer {
  private sortColumn: string | null = null;
  private sortDirection: 'asc' | 'desc' = 'asc';

  /**
   * Render query results as a table
   */
  render(
    results: QueryResult,
    container: HTMLElement,
    options: TableRenderOptions = {}
  ): void {
    // Clear container
    container.innerHTML = '';
    container.className = 'dataview-table-container';

    if (!results.data || results.data.length === 0) {
      this.renderEmpty(container);
      return;
    }

    // Determine columns
    const columns = options.columns || this.inferColumns(results.data);

    // Create table
    const table = document.createElement('table');
    table.className = options.compact ? 'dataview-table compact' : 'dataview-table';

    // Create header
    const thead = this.createTableHeader(columns, options);
    table.appendChild(thead);

    // Create body
    const tbody = this.createTableBody(results.data, columns, options);
    table.appendChild(tbody);

    container.appendChild(table);

    // Add metadata footer
    this.renderMetadata(results, container, options);
  }

  /**
   * Render empty state
   */
  private renderEmpty(container: HTMLElement): void {
    const empty = document.createElement('div');
    empty.className = 'dataview-table-empty';
    empty.textContent = 'No results found';
    container.appendChild(empty);
  }

  /**
   * Infer columns from data
   */
  private inferColumns(data: any[]): string[] {
    const columnSet = new Set<string>();

    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'file' && key !== 'path') {
          columnSet.add(key);
        }
      });
    });

    // Always include file as first column
    return ['file', ...Array.from(columnSet)];
  }

  /**
   * Create table header
   */
  private createTableHeader(
    columns: string[],
    options: TableRenderOptions
  ): HTMLTableSectionElement {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    // Row number column
    if (options.showRowNumbers) {
      const th = document.createElement('th');
      th.className = 'dataview-table-header row-number';
      th.textContent = '#';
      tr.appendChild(th);
    }

    // Data columns
    columns.forEach(column => {
      const th = document.createElement('th');
      th.className = 'dataview-table-header';
      th.textContent = this.formatColumnName(column);
      th.setAttribute('data-column', column);

      // Make sortable
      if (options.sortable) {
        th.classList.add('sortable');
        th.addEventListener('click', () => this.handleSort(column, th));

        // Add sort indicator
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        th.appendChild(indicator);
      }

      tr.appendChild(th);
    });

    thead.appendChild(tr);
    return thead;
  }

  /**
   * Create table body
   */
  private createTableBody(
    data: any[],
    columns: string[],
    options: TableRenderOptions
  ): HTMLTableSectionElement {
    const tbody = document.createElement('tbody');

    // Apply max rows limit
    const displayData = options.maxRows ? data.slice(0, options.maxRows) : data;

    displayData.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = 'dataview-table-row';

      // Row number
      if (options.showRowNumbers) {
        const td = document.createElement('td');
        td.className = 'dataview-table-cell row-number';
        td.textContent = String(index + 1);
        tr.appendChild(td);
      }

      // Data cells
      columns.forEach(column => {
        const td = this.createTableCell(item, column);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    return tbody;
  }

  /**
   * Create table cell
   */
  private createTableCell(item: any, column: string): HTMLTableCellElement {
    const td = document.createElement('td');
    td.className = 'dataview-table-cell';
    td.setAttribute('data-column', column);

    const value = this.getNestedValue(item, column);

    // Special handling for file column
    if (column === 'file' && item.file) {
      const link = this.createFileLink(item.file);
      td.appendChild(link);
    } else {
      td.innerHTML = this.formatCellValue(value);
    }

    return td;
  }

  /**
   * Create file link
   */
  private createFileLink(file: any): HTMLAnchorElement {
    const link = document.createElement('a');
    link.className = 'dataview-file-link';
    link.href = `#${file.path}`;
    link.textContent = file.name || file.path;
    link.setAttribute('data-path', file.path);

    link.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleFileClick(file.path);
    });

    return link;
  }

  /**
   * Format column name
   */
  private formatColumnName(column: string): string {
    return column
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format cell value
   */
  private formatCellValue(value: any): string {
    if (value === null || value === undefined) return '<em>-</em>';
    if (Array.isArray(value)) {
      return value.map(v => this.formatSingleValue(v)).join(', ');
    }
    return this.formatSingleValue(value);
  }

  /**
   * Format single value
   */
  private formatSingleValue(value: any): string {
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'object' && value.path) {
      return `<a href="#${value.path}">${value.name || value.path}</a>`;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Handle column sort
   */
  private handleSort(column: string, header: HTMLTableHeaderCellElement): void {
    // Toggle sort direction
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Update UI
    const container = header.closest('.dataview-table-container');
    if (!container) return;

    // Remove all sort indicators
    container.querySelectorAll('.dataview-table-header').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });

    // Add sort indicator to current column
    header.classList.add(`sort-${this.sortDirection}`);

    // Sort table rows
    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = Array.from(header.parentElement!.children).indexOf(header);

    rows.sort((a, b) => {
      const aCell = a.children[columnIndex] as HTMLTableCellElement;
      const bCell = b.children[columnIndex] as HTMLTableCellElement;

      const aValue = aCell.textContent || '';
      const bValue = bCell.textContent || '';

      const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
  }

  /**
   * Render metadata footer
   */
  private renderMetadata(
    results: QueryResult,
    container: HTMLElement,
    options: TableRenderOptions
  ): void {
    const footer = document.createElement('div');
    footer.className = 'dataview-table-metadata';

    const count = document.createElement('span');
    count.className = 'dataview-result-count';

    const displayCount = options.maxRows
      ? Math.min(results.data.length, options.maxRows)
      : results.data.length;

    count.textContent = `Showing ${displayCount} of ${results.data.length} result${
      results.data.length !== 1 ? 's' : ''
    }`;

    if (results.executionTime) {
      const time = document.createElement('span');
      time.className = 'dataview-execution-time';
      time.textContent = ` (${results.executionTime.toFixed(2)}ms)`;
      count.appendChild(time);
    }

    footer.appendChild(count);
    container.appendChild(footer);
  }

  /**
   * Handle file click
   */
  private handleFileClick(path: string): void {
    const event = new CustomEvent('dataview:open-file', {
      detail: { path },
      bubbles: true,
    });
    window.dispatchEvent(event);
  }
}
