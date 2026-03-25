/**
 * Dataview LIST View Renderer
 * Renders query results as a list view with grouping support
 */

import { QueryResult } from '../query-engine';

export interface ListRenderOptions {
  groupBy?: string;
  showMetadata?: boolean;
  ordered?: boolean;
  compact?: boolean;
}

export class DataviewListRenderer {
  /**
   * Render query results as a list
   */
  render(
    results: QueryResult,
    container: HTMLElement,
    options: ListRenderOptions = {}
  ): void {
    // Clear container
    container.innerHTML = '';
    container.className = 'dataview-list-container';

    if (!results.data || results.data.length === 0) {
      this.renderEmpty(container);
      return;
    }

    // Group results if needed
    if (options.groupBy) {
      this.renderGrouped(results, container, options);
    } else {
      this.renderFlat(results, container, options);
    }

    // Add metadata footer
    if (options.showMetadata) {
      this.renderMetadata(results, container);
    }
  }

  /**
   * Render empty state
   */
  private renderEmpty(container: HTMLElement): void {
    const empty = document.createElement('div');
    empty.className = 'dataview-list-empty';
    empty.textContent = 'No results found';
    container.appendChild(empty);
  }

  /**
   * Render flat list
   */
  private renderFlat(
    results: QueryResult,
    container: HTMLElement,
    options: ListRenderOptions
  ): void {
    const list = document.createElement(options.ordered ? 'ol' : 'ul');
    list.className = options.compact ? 'dataview-list compact' : 'dataview-list';

    results.data.forEach(item => {
      const li = this.createListItem(item, options);
      list.appendChild(li);
    });

    container.appendChild(list);
  }

  /**
   * Render grouped list
   */
  private renderGrouped(
    results: QueryResult,
    container: HTMLElement,
    options: ListRenderOptions
  ): void {
    const groupBy = options.groupBy!;
    const groups = this.groupResults(results.data, groupBy);

    Object.entries(groups).forEach(([groupName, items]) => {
      // Group header
      const header = document.createElement('h3');
      header.className = 'dataview-list-group-header';
      header.textContent = groupName || '(No Group)';
      container.appendChild(header);

      // Group list
      const list = document.createElement(options.ordered ? 'ol' : 'ul');
      list.className = options.compact ? 'dataview-list compact' : 'dataview-list';

      items.forEach(item => {
        const li = this.createListItem(item, options);
        list.appendChild(li);
      });

      container.appendChild(list);
    });
  }

  /**
   * Create a list item
   */
  private createListItem(item: any, options: ListRenderOptions): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'dataview-list-item';

    // Main content
    const content = document.createElement('div');
    content.className = 'dataview-list-item-content';

    // File link
    if (item.file) {
      const link = this.createFileLink(item.file);
      content.appendChild(link);
    }

    // Additional fields
    if (options.showMetadata && item.metadata) {
      const metadata = this.createMetadataDisplay(item.metadata);
      content.appendChild(metadata);
    }

    li.appendChild(content);
    return li;
  }

  /**
   * Create file link element
   */
  private createFileLink(file: any): HTMLAnchorElement {
    const link = document.createElement('a');
    link.className = 'dataview-file-link';
    link.href = `#${file.path}`;
    link.textContent = file.name || file.path;
    link.setAttribute('data-path', file.path);

    // Click handler
    link.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleFileClick(file.path);
    });

    return link;
  }

  /**
   * Create metadata display
   */
  private createMetadataDisplay(metadata: Record<string, any>): HTMLElement {
    const metaDiv = document.createElement('div');
    metaDiv.className = 'dataview-list-item-metadata';

    Object.entries(metadata).forEach(([key, value]) => {
      if (key === 'file' || key === 'path') return;

      const field = document.createElement('span');
      field.className = 'dataview-metadata-field';
      field.innerHTML = `<strong>${key}:</strong> ${this.formatValue(value)}`;
      metaDiv.appendChild(field);
    });

    return metaDiv;
  }

  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    return String(value);
  }

  /**
   * Group results by field
   */
  private groupResults(data: any[], groupBy: string): Record<string, any[]> {
    const groups: Record<string, any[]> = {};

    data.forEach(item => {
      const groupValue = this.getNestedValue(item, groupBy) || '(No Group)';
      const groupKey = String(groupValue);

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
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
   * Render metadata footer
   */
  private renderMetadata(results: QueryResult, container: HTMLElement): void {
    const footer = document.createElement('div');
    footer.className = 'dataview-list-metadata';

    const count = document.createElement('span');
    count.className = 'dataview-result-count';
    count.textContent = `${results.data.length} result${results.data.length !== 1 ? 's' : ''}`;

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
    // Trigger custom event for file opening
    const event = new CustomEvent('dataview:open-file', {
      detail: { path },
      bubbles: true,
    });
    window.dispatchEvent(event);
  }
}
