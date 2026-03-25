/**
 * Dataview TASK View Renderer
 * Renders query results as a task list with checkbox interaction
 */

import { QueryResult } from '../query-engine';

export interface TaskRenderOptions {
  groupByFile?: boolean;
  showCompleted?: boolean;
  compact?: boolean;
  interactive?: boolean;
}

export interface Task {
  text: string;
  completed: boolean;
  line: number;
  file: {
    path: string;
    name: string;
  };
  tags?: string[];
  priority?: string;
  due?: string;
}

export class DataviewTaskRenderer {
  /**
   * Render query results as a task list
   */
  render(
    results: QueryResult,
    container: HTMLElement,
    options: TaskRenderOptions = {}
  ): void {
    // Clear container
    container.innerHTML = '';
    container.className = 'dataview-task-container';

    // Extract tasks from results
    const tasks = this.extractTasks(results.data);

    if (tasks.length === 0) {
      this.renderEmpty(container);
      return;
    }

    // Filter completed tasks if needed
    const displayTasks = options.showCompleted
      ? tasks
      : tasks.filter(t => !t.completed);

    // Group by file if needed
    if (options.groupByFile) {
      this.renderGroupedTasks(displayTasks, container, options);
    } else {
      this.renderFlatTasks(displayTasks, container, options);
    }

    // Add metadata footer
    this.renderMetadata(tasks, displayTasks, container);
  }

  /**
   * Render empty state
   */
  private renderEmpty(container: HTMLElement): void {
    const empty = document.createElement('div');
    empty.className = 'dataview-task-empty';
    empty.textContent = 'No tasks found';
    container.appendChild(empty);
  }

  /**
   * Extract tasks from data
   */
  private extractTasks(data: any[]): Task[] {
    const tasks: Task[] = [];

    data.forEach(item => {
      // Check if item has tasks
      if (item.tasks && Array.isArray(item.tasks)) {
        item.tasks.forEach((task: any) => {
          tasks.push({
            text: task.text || task.content || '',
            completed: task.completed || task.checked || false,
            line: task.line || 0,
            file: item.file || { path: '', name: '' },
            tags: task.tags || [],
            priority: task.priority,
            due: task.due,
          });
        });
      }
      // Check if item itself is a task
      else if (item.text || item.content) {
        tasks.push({
          text: item.text || item.content || '',
          completed: item.completed || item.checked || false,
          line: item.line || 0,
          file: item.file || { path: '', name: '' },
          tags: item.tags || [],
          priority: item.priority,
          due: item.due,
        });
      }
    });

    return tasks;
  }

  /**
   * Render flat task list
   */
  private renderFlatTasks(
    tasks: Task[],
    container: HTMLElement,
    options: TaskRenderOptions
  ): void {
    const list = document.createElement('ul');
    list.className = options.compact ? 'dataview-task-list compact' : 'dataview-task-list';

    tasks.forEach(task => {
      const li = this.createTaskItem(task, options);
      list.appendChild(li);
    });

    container.appendChild(list);
  }

  /**
   * Render grouped task list
   */
  private renderGroupedTasks(
    tasks: Task[],
    container: HTMLElement,
    options: TaskRenderOptions
  ): void {
    const groups = this.groupTasksByFile(tasks);

    Object.entries(groups).forEach(([filePath, fileTasks]) => {
      // File header
      const header = document.createElement('h3');
      header.className = 'dataview-task-group-header';

      const fileLink = document.createElement('a');
      fileLink.className = 'dataview-file-link';
      fileLink.href = `#${filePath}`;
      fileLink.textContent = fileTasks[0].file.name || filePath;
      fileLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleFileClick(filePath);
      });

      header.appendChild(fileLink);

      const count = document.createElement('span');
      count.className = 'task-count';
      count.textContent = ` (${fileTasks.length})`;
      header.appendChild(count);

      container.appendChild(header);

      // Task list
      const list = document.createElement('ul');
      list.className = options.compact ? 'dataview-task-list compact' : 'dataview-task-list';

      fileTasks.forEach(task => {
        const li = this.createTaskItem(task, options);
        list.appendChild(li);
      });

      container.appendChild(list);
    });
  }

  /**
   * Create task item
   */
  private createTaskItem(task: Task, options: TaskRenderOptions): HTMLLIElement {
    const li = document.createElement('li');
    li.className = task.completed ? 'dataview-task-item completed' : 'dataview-task-item';
    li.setAttribute('data-file', task.file.path);
    li.setAttribute('data-line', String(task.line));

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'dataview-task-checkbox';
    checkbox.checked = task.completed;

    if (options.interactive) {
      checkbox.addEventListener('change', () => {
        this.handleTaskToggle(task, checkbox.checked);
      });
    } else {
      checkbox.disabled = true;
    }

    li.appendChild(checkbox);

    // Task text
    const text = document.createElement('span');
    text.className = 'dataview-task-text';
    text.textContent = task.text;

    if (task.completed) {
      text.style.textDecoration = 'line-through';
      text.style.opacity = '0.6';
    }

    li.appendChild(text);

    // Task metadata
    const metadata = this.createTaskMetadata(task);
    if (metadata) {
      li.appendChild(metadata);
    }

    return li;
  }

  /**
   * Create task metadata
   */
  private createTaskMetadata(task: Task): HTMLElement | null {
    const hasMetadata = task.tags?.length || task.priority || task.due;
    if (!hasMetadata) return null;

    const metadata = document.createElement('span');
    metadata.className = 'dataview-task-metadata';

    // Priority
    if (task.priority) {
      const priority = document.createElement('span');
      priority.className = `task-priority priority-${task.priority.toLowerCase()}`;
      priority.textContent = `[${task.priority}]`;
      metadata.appendChild(priority);
    }

    // Due date
    if (task.due) {
      const due = document.createElement('span');
      due.className = 'task-due';
      due.textContent = `📅 ${task.due}`;

      // Check if overdue
      const dueDate = new Date(task.due);
      if (dueDate < new Date() && !task.completed) {
        due.classList.add('overdue');
      }

      metadata.appendChild(due);
    }

    // Tags
    if (task.tags && task.tags.length > 0) {
      const tags = document.createElement('span');
      tags.className = 'task-tags';
      tags.textContent = task.tags.map(t => `#${t}`).join(' ');
      metadata.appendChild(tags);
    }

    return metadata;
  }

  /**
   * Group tasks by file
   */
  private groupTasksByFile(tasks: Task[]): Record<string, Task[]> {
    const groups: Record<string, Task[]> = {};

    tasks.forEach(task => {
      const filePath = task.file.path;
      if (!groups[filePath]) {
        groups[filePath] = [];
      }
      groups[filePath].push(task);
    });

    return groups;
  }

  /**
   * Render metadata footer
   */
  private renderMetadata(
    allTasks: Task[],
    displayTasks: Task[],
    container: HTMLElement
  ): void {
    const footer = document.createElement('div');
    footer.className = 'dataview-task-metadata';

    const completed = allTasks.filter(t => t.completed).length;
    const total = allTasks.length;

    const stats = document.createElement('span');
    stats.className = 'dataview-task-stats';
    stats.textContent = `${displayTasks.length} task${displayTasks.length !== 1 ? 's' : ''} shown`;

    if (completed > 0) {
      const completedSpan = document.createElement('span');
      completedSpan.className = 'task-completed-count';
      completedSpan.textContent = ` (${completed}/${total} completed)`;
      stats.appendChild(completedSpan);
    }

    footer.appendChild(stats);
    container.appendChild(footer);
  }

  /**
   * Handle task toggle
   */
  private handleTaskToggle(task: Task, checked: boolean): void {
    const event = new CustomEvent('dataview:task-toggle', {
      detail: {
        file: task.file.path,
        line: task.line,
        checked,
        task,
      },
      bubbles: true,
    });
    window.dispatchEvent(event);
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
