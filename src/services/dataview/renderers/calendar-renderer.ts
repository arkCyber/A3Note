/**
 * Dataview CALENDAR View Renderer
 * Renders query results as a calendar view with date-based grouping
 */

import { QueryResult } from '../query-engine';

export interface CalendarRenderOptions {
  dateField?: string;
  viewMode?: 'month' | 'week' | 'day';
  showWeekNumbers?: boolean;
  compact?: boolean;
}

export class DataviewCalendarRenderer {
  private currentDate: Date = new Date();
  private viewMode: 'month' | 'week' | 'day' = 'month';

  /**
   * Render query results as a calendar
   */
  render(
    results: QueryResult,
    container: HTMLElement,
    options: CalendarRenderOptions = {}
  ): void {
    // Clear container
    container.innerHTML = '';
    container.className = 'dataview-calendar-container';

    this.viewMode = options.viewMode || 'month';

    if (!results.data || results.data.length === 0) {
      this.renderEmpty(container);
      return;
    }

    // Extract date field
    const dateField = options.dateField || 'date';
    const dateItems = this.extractDateItems(results.data, dateField);

    // Create calendar header
    const header = this.createCalendarHeader(container);
    container.appendChild(header);

    // Create calendar body
    const calendar = this.createCalendar(dateItems, options);
    container.appendChild(calendar);

    // Add metadata footer
    this.renderMetadata(results, container);
  }

  /**
   * Render empty state
   */
  private renderEmpty(container: HTMLElement): void {
    const empty = document.createElement('div');
    empty.className = 'dataview-calendar-empty';
    empty.textContent = 'No dated items found';
    container.appendChild(empty);
  }

  /**
   * Extract items with dates
   */
  private extractDateItems(data: any[], dateField: string): Map<string, any[]> {
    const dateItems = new Map<string, any[]>();

    data.forEach(item => {
      const dateValue = this.getNestedValue(item, dateField);
      if (!dateValue) return;

      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return;

      const dateKey = this.formatDateKey(date);
      if (!dateItems.has(dateKey)) {
        dateItems.set(dateKey, []);
      }
      dateItems.get(dateKey)!.push(item);
    });

    return dateItems;
  }

  /**
   * Create calendar header
   */
  private createCalendarHeader(container: HTMLElement): HTMLElement {
    const header = document.createElement('div');
    header.className = 'dataview-calendar-header';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'calendar-nav-btn prev';
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', () => this.navigatePrevious(container));
    header.appendChild(prevBtn);

    // Current date display
    const title = document.createElement('h3');
    title.className = 'calendar-title';
    title.textContent = this.getCalendarTitle();
    header.appendChild(title);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'calendar-nav-btn next';
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', () => this.navigateNext(container));
    header.appendChild(nextBtn);

    // View mode selector
    const viewSelector = this.createViewSelector(container);
    header.appendChild(viewSelector);

    return header;
  }

  /**
   * Create view mode selector
   */
  private createViewSelector(container: HTMLElement): HTMLElement {
    const selector = document.createElement('div');
    selector.className = 'calendar-view-selector';

    ['month', 'week', 'day'].forEach(mode => {
      const btn = document.createElement('button');
      btn.className = mode === this.viewMode ? 'view-btn active' : 'view-btn';
      btn.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      btn.addEventListener('click', () => {
        this.viewMode = mode as 'month' | 'week' | 'day';
        this.render(
          { data: [], executionTime: 0 },
          container,
          { viewMode: this.viewMode }
        );
      });
      selector.appendChild(btn);
    });

    return selector;
  }

  /**
   * Create calendar
   */
  private createCalendar(
    dateItems: Map<string, any[]>,
    options: CalendarRenderOptions
  ): HTMLElement {
    switch (this.viewMode) {
      case 'month':
        return this.createMonthView(dateItems, options);
      case 'week':
        return this.createWeekView(dateItems, options);
      case 'day':
        return this.createDayView(dateItems, options);
      default:
        return this.createMonthView(dateItems, options);
    }
  }

  /**
   * Create month view
   */
  private createMonthView(
    dateItems: Map<string, any[]>,
    options: CalendarRenderOptions
  ): HTMLElement {
    const calendar = document.createElement('div');
    calendar.className = 'dataview-calendar month-view';

    // Day headers
    const dayHeaders = document.createElement('div');
    dayHeaders.className = 'calendar-day-headers';

    if (options.showWeekNumbers) {
      const weekHeader = document.createElement('div');
      weekHeader.className = 'calendar-day-header week-number';
      weekHeader.textContent = 'Wk';
      dayHeaders.appendChild(weekHeader);
    }

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-day-header';
      header.textContent = day;
      dayHeaders.appendChild(header);
    });

    calendar.appendChild(dayHeaders);

    // Calendar grid
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    let currentWeek = document.createElement('div');
    currentWeek.className = 'calendar-week';

    if (options.showWeekNumbers) {
      const weekNum = this.getWeekNumber(startDate);
      const weekCell = document.createElement('div');
      weekCell.className = 'calendar-day week-number';
      weekCell.textContent = String(weekNum);
      currentWeek.appendChild(weekCell);
    }

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const dayCell = this.createDayCell(date, dateItems, month);
      currentWeek.appendChild(dayCell);

      if ((i + 1) % 7 === 0) {
        grid.appendChild(currentWeek);
        currentWeek = document.createElement('div');
        currentWeek.className = 'calendar-week';

        if (options.showWeekNumbers && i < 41) {
          const weekNum = this.getWeekNumber(new Date(date.getTime() + 86400000));
          const weekCell = document.createElement('div');
          weekCell.className = 'calendar-day week-number';
          weekCell.textContent = String(weekNum);
          currentWeek.appendChild(weekCell);
        }
      }

      if (date >= lastDay && (i + 1) % 7 === 0) break;
    }

    calendar.appendChild(grid);
    return calendar;
  }

  /**
   * Create week view
   */
  private createWeekView(
    dateItems: Map<string, any[]>,
    _options: CalendarRenderOptions
  ): HTMLElement {
    const calendar = document.createElement('div');
    calendar.className = 'dataview-calendar week-view';

    const startOfWeek = this.getStartOfWeek(this.currentDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);

      const dayColumn = this.createDayColumn(date, dateItems);
      calendar.appendChild(dayColumn);
    }

    return calendar;
  }

  /**
   * Create day view
   */
  private createDayView(
    dateItems: Map<string, any[]>,
    _options: CalendarRenderOptions
  ): HTMLElement {
    const calendar = document.createElement('div');
    calendar.className = 'dataview-calendar day-view';

    const dayColumn = this.createDayColumn(this.currentDate, dateItems);
    calendar.appendChild(dayColumn);

    return calendar;
  }

  /**
   * Create day cell
   */
  private createDayCell(
    date: Date,
    dateItems: Map<string, any[]>,
    currentMonth: number
  ): HTMLElement {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';

    if (date.getMonth() !== currentMonth) {
      cell.classList.add('other-month');
    }

    if (this.isToday(date)) {
      cell.classList.add('today');
    }

    const dateKey = this.formatDateKey(date);
    const items = dateItems.get(dateKey);

    // Day number
    const dayNum = document.createElement('div');
    dayNum.className = 'day-number';
    dayNum.textContent = String(date.getDate());
    cell.appendChild(dayNum);

    // Items
    if (items && items.length > 0) {
      cell.classList.add('has-items');

      const itemCount = document.createElement('div');
      itemCount.className = 'item-count';
      itemCount.textContent = String(items.length);
      cell.appendChild(itemCount);

      // Add click handler to show items
      cell.addEventListener('click', () => {
        this.showDayItems(date, items);
      });
    }

    return cell;
  }

  /**
   * Create day column
   */
  private createDayColumn(date: Date, dateItems: Map<string, any[]>): HTMLElement {
    const column = document.createElement('div');
    column.className = 'calendar-day-column';

    const header = document.createElement('div');
    header.className = 'day-column-header';
    header.textContent = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    column.appendChild(header);

    const dateKey = this.formatDateKey(date);
    const items = dateItems.get(dateKey);

    if (items && items.length > 0) {
      const itemList = document.createElement('ul');
      itemList.className = 'day-items';

      items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'day-item';

        if (item.file) {
          const link = document.createElement('a');
          link.href = `#${item.file.path}`;
          link.textContent = item.file.name || item.file.path;
          link.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleFileClick(item.file.path);
          });
          li.appendChild(link);
        }

        itemList.appendChild(li);
      });

      column.appendChild(itemList);
    }

    return column;
  }

  /**
   * Get calendar title
   */
  private getCalendarTitle(): string {
    switch (this.viewMode) {
      case 'month':
        return this.currentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });
      case 'week':
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} - ${endOfWeek.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`;
      case 'day':
        return this.currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      default:
        return '';
    }
  }

  /**
   * Navigate to previous period
   */
  private navigatePrevious(container: HTMLElement): void {
    switch (this.viewMode) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        break;
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        break;
    }
    this.render({ data: [], executionTime: 0 }, container, { viewMode: this.viewMode });
  }

  /**
   * Navigate to next period
   */
  private navigateNext(container: HTMLElement): void {
    switch (this.viewMode) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        break;
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        break;
    }
    this.render({ data: [], executionTime: 0 }, container, { viewMode: this.viewMode });
  }

  /**
   * Helper methods
   */
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return this.formatDateKey(date) === this.formatDateKey(today);
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

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

  private showDayItems(date: Date, items: any[]): void {
    const event = new CustomEvent('dataview:show-day-items', {
      detail: { date, items },
      bubbles: true,
    });
    window.dispatchEvent(event);
  }

  private handleFileClick(path: string): void {
    const event = new CustomEvent('dataview:open-file', {
      detail: { path },
      bubbles: true,
    });
    window.dispatchEvent(event);
  }

  private renderMetadata(results: QueryResult, container: HTMLElement): void {
    const footer = document.createElement('div');
    footer.className = 'dataview-calendar-metadata';

    const count = document.createElement('span');
    count.textContent = `${results.data.length} item${results.data.length !== 1 ? 's' : ''}`;

    footer.appendChild(count);
    container.appendChild(footer);
  }
}
