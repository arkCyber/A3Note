import { describe, it, expect, beforeEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { taskListExtension } from '../taskListExtension';

describe('taskListExtension', () => {
  let view: EditorView;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    view?.destroy();
    container.remove();
  });

  it('should render checkboxes for task list items', () => {
    const doc = '- [ ] Unchecked task\n- [x] Checked task';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [taskListExtension],
      }),
      parent: container,
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
  });

  it('should toggle task state when checkbox is clicked', () => {
    const doc = '- [ ] Task to toggle';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [taskListExtension],
      }),
      parent: container,
    });

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(false);

    // Simulate click
    checkbox.click();

    // Check if document was updated
    const newDoc = view.state.doc.toString();
    expect(newDoc).toContain('- [x]');
  });

  it('should handle uppercase X in checked tasks', () => {
    const doc = '- [X] Task with uppercase X';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [taskListExtension],
      }),
      parent: container,
    });

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should apply strikethrough style to completed tasks', () => {
    const doc = '- [x] Completed task';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [taskListExtension],
      }),
      parent: container,
    });

    const completedText = container.querySelector('.cm-task-completed');
    expect(completedText).toBeTruthy();
  });

  it('should handle multiple tasks in a document', () => {
    const doc = `# Tasks
- [ ] Task 1
- [x] Task 2
- [ ] Task 3

Some text

- [x] Task 4`;
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [taskListExtension],
      }),
      parent: container,
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(4);
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
    expect(checkboxes[2].checked).toBe(false);
    expect(checkboxes[3].checked).toBe(true);
  });

  it('should not render checkboxes for regular list items', () => {
    const doc = '- Regular list item\n- Another item';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [taskListExtension],
      }),
      parent: container,
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(0);
  });

  it('should handle indented task lists', () => {
    const doc = '  - [ ] Indented task\n    - [x] Nested task';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [taskListExtension],
      }),
      parent: container,
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
  });
});
