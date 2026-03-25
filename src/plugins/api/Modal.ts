/**
 * Modal API - Obsidian Compatible
 * Base class for creating modal dialogs
 */

import { App } from './App';

export interface ModalOptions {
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
}

/**
 * Base Modal class
 */
export class Modal {
  protected app: App;
  protected containerEl: HTMLElement;
  protected modalEl: HTMLElement;
  protected contentEl: HTMLElement;
  protected titleEl: HTMLElement;
  protected closeEl: HTMLElement;
  protected isOpen: boolean = false;
  private options: ModalOptions;

  constructor(app: App, options: ModalOptions = {}) {
    this.app = app;
    this.options = {
      closeOnEscape: true,
      closeOnClickOutside: true,
      ...options,
    };

    this.containerEl = this.createModalContainer();
    this.modalEl = this.createModalElement();
    this.titleEl = this.createTitleElement();
    this.contentEl = this.createContentElement();
    this.closeEl = this.createCloseButton();

    this.modalEl.appendChild(this.titleEl);
    this.modalEl.appendChild(this.contentEl);
    this.modalEl.appendChild(this.closeEl);
    this.containerEl.appendChild(this.modalEl);

    this.setupEventListeners();
  }

  /**
   * Create modal container (backdrop)
   */
  private createModalContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'modal-container';
    return container;
  }

  /**
   * Create modal element
   */
  private createModalElement(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal';
    return modal;
  }

  /**
   * Create title element
   */
  private createTitleElement(): HTMLElement {
    const title = document.createElement('div');
    title.className = 'modal-title';
    return title;
  }

  /**
   * Create content element
   */
  private createContentElement(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'modal-content';
    return content;
  }

  /**
   * Create close button
   */
  private createCloseButton(): HTMLElement {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-button';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.onclick = () => this.close();
    return closeBtn;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Close on escape key
    if (this.options.closeOnEscape) {
      this.containerEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.close();
        }
      });
    }

    // Close on backdrop click
    if (this.options.closeOnClickOutside) {
      this.containerEl.addEventListener('click', (e) => {
        if (e.target === this.containerEl) {
          this.close();
        }
      });
    }
  }

  /**
   * Set modal title
   */
  setTitle(title: string): void {
    this.titleEl.textContent = title;
  }

  /**
   * Open the modal
   */
  open(): void {
    if (this.isOpen) return;

    document.body.appendChild(this.containerEl);
    this.isOpen = true;

    // Trigger animation
    requestAnimationFrame(() => {
      this.containerEl.classList.add('modal-show');
    });

    // Focus the modal
    this.modalEl.focus();

    // Call lifecycle hook
    this.onOpen();
  }

  /**
   * Close the modal
   */
  close(): void {
    if (!this.isOpen) return;

    this.containerEl.classList.remove('modal-show');
    this.containerEl.classList.add('modal-hide');

    setTimeout(() => {
      this.containerEl.remove();
      this.isOpen = false;
      this.onClose();
    }, 300);
  }

  /**
   * Lifecycle hook called when modal opens
   * Override this in subclasses
   */
  onOpen(): void {
    // To be overridden
  }

  /**
   * Lifecycle hook called when modal closes
   * Override this in subclasses
   */
  onClose(): void {
    // To be overridden
  }
}

/**
 * Suggest Modal for autocomplete-style selection
 */
export abstract class SuggestModal<T> extends Modal {
  private inputEl: HTMLInputElement;
  private suggestionsEl: HTMLElement;
  private suggestions: T[] = [];
  private selectedIndex: number = 0;

  constructor(app: App) {
    super(app);
    this.inputEl = this.createInputElement();
    this.suggestionsEl = this.createSuggestionsElement();

    this.contentEl.appendChild(this.inputEl);
    this.contentEl.appendChild(this.suggestionsEl);

    this.setupInputListeners();
  }

  /**
   * Create input element
   */
  private createInputElement(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'modal-input';
    input.placeholder = 'Type to search...';
    return input;
  }

  /**
   * Create suggestions container
   */
  private createSuggestionsElement(): HTMLElement {
    const suggestions = document.createElement('div');
    suggestions.className = 'modal-suggestions';
    return suggestions;
  }

  /**
   * Setup input event listeners
   */
  private setupInputListeners(): void {
    this.inputEl.addEventListener('input', () => {
      this.updateSuggestions();
    });

    this.inputEl.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.selectPrevious();
          break;
        case 'Enter':
          e.preventDefault();
          this.selectCurrent();
          break;
      }
    });
  }

  /**
   * Update suggestions based on input
   */
  private async updateSuggestions(): Promise<void> {
    const query = this.inputEl.value;
    this.suggestions = await this.getSuggestions(query);
    this.selectedIndex = 0;
    this.renderSuggestions();
  }

  /**
   * Render suggestions list
   */
  private renderSuggestions(): void {
    this.suggestionsEl.innerHTML = '';

    this.suggestions.forEach((item, index) => {
      const suggestionEl = document.createElement('div');
      suggestionEl.className = 'modal-suggestion';
      
      if (index === this.selectedIndex) {
        suggestionEl.classList.add('is-selected');
      }

      this.renderSuggestion(item, suggestionEl);

      suggestionEl.addEventListener('click', () => {
        this.onChooseSuggestion(item, new MouseEvent('click'));
        this.close();
      });

      this.suggestionsEl.appendChild(suggestionEl);
    });
  }

  /**
   * Select next suggestion
   */
  private selectNext(): void {
    this.selectedIndex = Math.min(
      this.selectedIndex + 1,
      this.suggestions.length - 1
    );
    this.renderSuggestions();
  }

  /**
   * Select previous suggestion
   */
  private selectPrevious(): void {
    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    this.renderSuggestions();
  }

  /**
   * Select current suggestion
   */
  private selectCurrent(): void {
    const item = this.suggestions[this.selectedIndex];
    if (item) {
      this.onChooseSuggestion(item, new KeyboardEvent('keydown'));
      this.close();
    }
  }

  /**
   * Focus input when modal opens
   */
  onOpen(): void {
    super.onOpen();
    this.inputEl.focus();
    this.updateSuggestions();
  }

  /**
   * Get suggestions for a query
   * Must be implemented by subclasses
   */
  abstract getSuggestions(query: string): T[] | Promise<T[]>;

  /**
   * Render a suggestion item
   * Must be implemented by subclasses
   */
  abstract renderSuggestion(item: T, el: HTMLElement): void;

  /**
   * Handle suggestion selection
   * Must be implemented by subclasses
   */
  abstract onChooseSuggestion(item: T, evt: MouseEvent | KeyboardEvent): void;
}

/**
 * Fuzzy Suggest Modal with built-in fuzzy matching
 */
export abstract class FuzzySuggestModal<T> extends SuggestModal<T> {
  /**
   * Get all items to search through
   */
  abstract getItems(): T[];

  /**
   * Get text to match against for an item
   */
  abstract getItemText(item: T): string;

  /**
   * Get suggestions using fuzzy matching
   */
  getSuggestions(query: string): T[] {
    const items = this.getItems();
    
    if (!query) {
      return items;
    }

    const lowerQuery = query.toLowerCase();
    
    return items
      .map((item) => ({
        item,
        score: this.fuzzyScore(this.getItemText(item).toLowerCase(), lowerQuery),
      }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.item);
  }

  /**
   * Simple fuzzy matching score
   */
  private fuzzyScore(text: string, query: string): number {
    let score = 0;
    let queryIndex = 0;
    let lastMatchIndex = -1;

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        score += 1;
        
        // Bonus for consecutive matches
        if (lastMatchIndex === i - 1) {
          score += 5;
        }
        
        // Bonus for start of word
        if (i === 0 || text[i - 1] === ' ' || text[i - 1] === '-') {
          score += 10;
        }

        lastMatchIndex = i;
        queryIndex++;
      }
    }

    return queryIndex === query.length ? score : 0;
  }
}
