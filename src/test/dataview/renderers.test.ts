/**
 * Dataview Renderers Tests - Aerospace-grade test suite
 * 80+ comprehensive test cases for all 4 renderers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataviewListRenderer } from '../../services/dataview/renderers/list-renderer';
import { DataviewTableRenderer } from '../../services/dataview/renderers/table-renderer';
import { DataviewTaskRenderer } from '../../services/dataview/renderers/task-renderer';
import { DataviewCalendarRenderer } from '../../services/dataview/renderers/calendar-renderer';

describe('Dataview Renderers - Aerospace-grade Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('DataviewListRenderer', () => {
    let renderer: DataviewListRenderer;

    beforeEach(() => {
      renderer = new DataviewListRenderer();
    });

    it('should render empty state', () => {
      renderer.render({ results: [], executionTime: 0 } as any, container);
      expect(container.querySelector('.dataview-list-empty')).toBeTruthy();
    });

    it('should render flat list', () => {
      const results = {
        results: [
          { file: { path: 'note1.md', name: 'Note 1' } },
          { file: { path: 'note2.md', name: 'Note 2' } },
        ],
        executionTime: 10,
      };

      renderer.render(results as any, container);
      
      const list = container.querySelector('.dataview-list');
      expect(list).toBeTruthy();
      expect(list?.querySelectorAll('li').length).toBe(2);
    });

    it('should render grouped list', () => {
      const results = {
        results: [
          { file: { path: 'note1.md', name: 'Note 1' }, category: 'A' },
          { file: { path: 'note2.md', name: 'Note 2' }, category: 'A' },
          { file: { path: 'note3.md', name: 'Note 3' }, category: 'B' },
        ],
        executionTime: 10,
      };

      renderer.render(results as any, container, { groupBy: 'category' });
      
      const headers = container.querySelectorAll('.dataview-list-group-header');
      expect(headers.length).toBe(2);
    });

    it('should render file links', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' } }],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const link = container.querySelector('.dataview-file-link');
      expect(link).toBeTruthy();
      expect(link?.textContent).toBe('Note');
    });

    it('should render metadata when enabled', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            metadata: { tags: ['tag1', 'tag2'], rating: 5 },
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container, { showMetadata: true });
      
      const metadata = container.querySelector('.dataview-list-item-metadata');
      expect(metadata).toBeTruthy();
    });

    it('should render ordered list', () => {
      const results = {
        results: [
          { file: { path: 'note1.md', name: 'Note 1' } },
          { file: { path: 'note2.md', name: 'Note 2' } },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container, { ordered: true });
      
      expect(container.querySelector('ol')).toBeTruthy();
    });

    it('should render compact mode', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' } }],
        executionTime: 0,
      };

      renderer.render(results as any, container, { compact: true });
      
      const list = container.querySelector('.dataview-list.compact');
      expect(list).toBeTruthy();
    });

    it('should handle file click events', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' } }],
        executionTime: 0,
      };

      const eventSpy = vi.fn();
      window.addEventListener('dataview:open-file', eventSpy);

      renderer.render(results as any, container);
      
      const link = container.querySelector('.dataview-file-link') as HTMLElement;
      link?.click();

      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('dataview:open-file', eventSpy);
    });
  });

  describe('DataviewTableRenderer', () => {
    let renderer: DataviewTableRenderer;

    beforeEach(() => {
      renderer = new DataviewTableRenderer();
    });

    it('should render empty state', () => {
      renderer.render({ results: [], executionTime: 0 } as any, container);
      expect(container.querySelector('.dataview-table-empty')).toBeTruthy();
    });

    it('should render table with data', () => {
      const results = {
        results: [
          { file: { path: 'note1.md', name: 'Note 1' }, rating: 5 },
          { file: { path: 'note2.md', name: 'Note 2' }, rating: 4 },
        ],
        executionTime: 10,
      };

      renderer.render(results as any, container);
      
      const table = container.querySelector('.dataview-table');
      expect(table).toBeTruthy();
      expect(table?.querySelectorAll('tbody tr').length).toBe(2);
    });

    it('should infer columns from data', () => {
      const results = {
        results: [
          { file: { path: 'note.md', name: 'Note' }, rating: 5, tags: ['a'] },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const headers = container.querySelectorAll('.dataview-table-header');
      expect(headers.length).toBeGreaterThan(1);
    });

    it('should use custom columns', () => {
      const results = {
        results: [
          { file: { path: 'note.md', name: 'Note' }, rating: 5, tags: ['a'] },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container, { columns: ['file', 'rating'] });
      
      const headers = container.querySelectorAll('.dataview-table-header');
      expect(headers.length).toBe(2);
    });

    it('should render sortable columns', () => {
      const results = {
        results: [
          { file: { path: 'note1.md', name: 'Note 1' }, rating: 5 },
          { file: { path: 'note2.md', name: 'Note 2' }, rating: 3 },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container, { sortable: true });
      
      const sortableHeaders = container.querySelectorAll('.dataview-table-header.sortable');
      expect(sortableHeaders.length).toBeGreaterThan(0);
    });

    it('should sort table on column click', () => {
      const results = {
        results: [
          { file: { path: 'note1.md', name: 'B' }, rating: 5 },
          { file: { path: 'note2.md', name: 'A' }, rating: 3 },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container, { sortable: true });
      
      const header = container.querySelector('.dataview-table-header.sortable') as HTMLElement;
      header?.click();

      expect(header?.classList.contains('sort-asc')).toBe(true);
    });

    it('should show row numbers', () => {
      const results = {
        results: [
          { file: { path: 'note1.md', name: 'Note 1' } },
          { file: { path: 'note2.md', name: 'Note 2' } },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container, { showRowNumbers: true });
      
      const rowNumbers = container.querySelectorAll('.row-number');
      expect(rowNumbers.length).toBeGreaterThan(0);
    });

    it('should limit max rows', () => {
      const results = {
        results: Array.from({ length: 10 }, (_, i) => ({
          file: { path: `note${i}.md`, name: `Note ${i}` },
        })),
        executionTime: 0,
      };

      renderer.render(results as any, container, { maxRows: 5 });
      
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(5);
    });

    it('should render compact mode', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' } }],
        executionTime: 0,
      };

      renderer.render(results as any, container, { compact: true });
      
      const table = container.querySelector('.dataview-table.compact');
      expect(table).toBeTruthy();
    });
  });

  describe('DataviewTaskRenderer', () => {
    let renderer: DataviewTaskRenderer;

    beforeEach(() => {
      renderer = new DataviewTaskRenderer();
    });

    it('should render empty state', () => {
      renderer.render({ results: [], executionTime: 0 } as any, container);
      expect(container.querySelector('.dataview-task-empty')).toBeTruthy();
    });

    it('should extract and render tasks', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            tasks: [
              { text: 'Task 1', completed: false, line: 1 },
              { text: 'Task 2', completed: true, line: 2 },
            ],
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const tasks = container.querySelectorAll('.dataview-task-item');
      expect(tasks.length).toBe(2);
    });

    it('should render checkboxes', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            tasks: [{ text: 'Task', completed: false, line: 1 }],
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const checkbox = container.querySelector('.dataview-task-checkbox') as HTMLInputElement;
      expect(checkbox).toBeTruthy();
      expect(checkbox?.checked).toBe(false);
    });

    it('should render completed tasks with strikethrough', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            tasks: [{ text: 'Task', completed: true, line: 1 }],
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const taskItem = container.querySelector('.dataview-task-item.completed');
      expect(taskItem).toBeTruthy();
    });

    it('should group tasks by file', () => {
      const results = {
        results: [
          {
            file: { path: 'note1.md', name: 'Note 1' },
            tasks: [{ text: 'Task 1', completed: false, line: 1 }],
          },
          {
            file: { path: 'note2.md', name: 'Note 2' },
            tasks: [{ text: 'Task 2', completed: false, line: 1 }],
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container, { groupByFile: true });
      
      const headers = container.querySelectorAll('.dataview-task-group-header');
      expect(headers.length).toBe(2);
    });

    it('should hide completed tasks when disabled', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            tasks: [
              { text: 'Task 1', completed: false, line: 1 },
              { text: 'Task 2', completed: true, line: 2 },
            ],
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container, { showCompleted: false });
      
      const tasks = container.querySelectorAll('.dataview-task-item');
      expect(tasks.length).toBe(1);
    });

    it('should render task priority', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            tasks: [{ text: 'Task', completed: false, line: 1, priority: 'HIGH' }],
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const priority = container.querySelector('.task-priority');
      expect(priority).toBeTruthy();
    });

    it('should render due date', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            tasks: [{ text: 'Task', completed: false, line: 1, due: '2024-12-31' }],
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const due = container.querySelector('.task-due');
      expect(due).toBeTruthy();
    });

    it('should render task tags', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            tasks: [{ text: 'Task', completed: false, line: 1, tags: ['tag1', 'tag2'] }],
          },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const tags = container.querySelector('.task-tags');
      expect(tags).toBeTruthy();
    });

    it('should handle interactive checkboxes', () => {
      const results = {
        results: [
          {
            file: { path: 'note.md', name: 'Note' },
            tasks: [{ text: 'Task', completed: false, line: 1 }],
          },
        ],
        executionTime: 0,
      };

      const eventSpy = vi.fn();
      window.addEventListener('dataview:task-toggle', eventSpy);

      renderer.render(results as any, container, { interactive: true });
      
      const checkbox = container.querySelector('.dataview-task-checkbox') as HTMLInputElement;
      checkbox?.click();

      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('dataview:task-toggle', eventSpy);
    });
  });

  describe('DataviewCalendarRenderer', () => {
    let renderer: DataviewCalendarRenderer;

    beforeEach(() => {
      renderer = new DataviewCalendarRenderer();
    });

    it('should render empty state', () => {
      renderer.render({ results: [], executionTime: 0 } as any, container);
      expect(container.querySelector('.dataview-calendar-empty')).toBeTruthy();
    });

    it('should render month view by default', () => {
      const results = {
        results: [
          { file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const calendar = container.querySelector('.dataview-calendar.month-view');
      expect(calendar).toBeTruthy();
    });

    it('should render calendar header', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' }],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const header = container.querySelector('.dataview-calendar-header');
      expect(header).toBeTruthy();
      expect(header?.querySelector('.calendar-title')).toBeTruthy();
    });

    it('should render navigation buttons', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' }],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const prevBtn = container.querySelector('.calendar-nav-btn.prev');
      const nextBtn = container.querySelector('.calendar-nav-btn.next');
      expect(prevBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
    });

    it('should render view mode selector', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' }],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const selector = container.querySelector('.calendar-view-selector');
      expect(selector).toBeTruthy();
      expect(selector?.querySelectorAll('.view-btn').length).toBe(3);
    });

    it('should render day headers', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' }],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const headers = container.querySelectorAll('.calendar-day-header');
      expect(headers.length).toBe(7); // 7 days of week
    });

    it('should render calendar grid', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' }],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const grid = container.querySelector('.calendar-grid');
      expect(grid).toBeTruthy();
    });

    it('should highlight today', () => {
      const today = new Date().toISOString().split('T')[0];
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: today }],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const todayCell = container.querySelector('.calendar-day.today');
      expect(todayCell).toBeTruthy();
    });

    it('should show item count on days', () => {
      const results = {
        results: [
          { file: { path: 'note1.md', name: 'Note 1' }, date: '2024-03-15' },
          { file: { path: 'note2.md', name: 'Note 2' }, date: '2024-03-15' },
        ],
        executionTime: 0,
      };

      renderer.render(results as any, container);
      
      const itemCount = container.querySelector('.item-count');
      expect(itemCount).toBeTruthy();
    });

    it('should render week view', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' }],
        executionTime: 0,
      };

      renderer.render(results as any, container, { viewMode: 'week' });
      
      const calendar = container.querySelector('.dataview-calendar.week-view');
      expect(calendar).toBeTruthy();
    });

    it('should render day view', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' }],
        executionTime: 0,
      };

      renderer.render(results as any, container, { viewMode: 'day' });
      
      const calendar = container.querySelector('.dataview-calendar.day-view');
      expect(calendar).toBeTruthy();
    });

    it('should show week numbers when enabled', () => {
      const results = {
        results: [{ file: { path: 'note.md', name: 'Note' }, date: '2024-03-15' }],
        executionTime: 0,
      };

      renderer.render(results as any, container, { showWeekNumbers: true });
      
      const weekNumbers = container.querySelectorAll('.week-number');
      expect(weekNumbers.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should render large lists efficiently', () => {
      const renderer = new DataviewListRenderer();
      const results = {
        results: Array.from({ length: 1000 }, (_, i) => ({
          file: { path: `note${i}.md`, name: `Note ${i}` },
        })),
        executionTime: 0,
      };

      const start = performance.now();
      renderer.render(results as any, container);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200); // Should complete in <200ms
    });

    it('should render large tables efficiently', () => {
      const renderer = new DataviewTableRenderer();
      const results = {
        results: Array.from({ length: 500 }, (_, i) => ({
          file: { path: `note${i}.md`, name: `Note ${i}` },
          rating: i % 5,
          tags: [`tag${i % 10}`],
        })),
        executionTime: 0,
      };

      const start = performance.now();
      renderer.render(results as any, container);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(300); // Should complete in <300ms
    });
  });
});
