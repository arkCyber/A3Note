/**
 * Notice API - Obsidian Compatible
 * Displays temporary notification messages to the user
 */

export interface NoticeOptions {
  timeout?: number;
  class?: string;
}

/**
 * Notice class for displaying notifications
 */
export class Notice {
  private element: HTMLElement;
  private timeout?: number;
  private timeoutId?: number;

  constructor(message: string | DocumentFragment, timeout?: number);
  constructor(message: string | DocumentFragment, options?: NoticeOptions);
  constructor(
    message: string | DocumentFragment,
    timeoutOrOptions?: number | NoticeOptions
  ) {
    let timeout: number | undefined;
    let className: string | undefined;

    if (typeof timeoutOrOptions === 'number') {
      timeout = timeoutOrOptions;
    } else if (timeoutOrOptions) {
      timeout = timeoutOrOptions.timeout;
      className = timeoutOrOptions.class;
    }

    this.timeout = timeout ?? 5000;
    this.element = this.createNoticeElement(message, className);
    this.show();

    if (this.timeout > 0) {
      this.timeoutId = window.setTimeout(() => this.hide(), this.timeout);
    }
  }

  /**
   * Create the notice DOM element
   */
  private createNoticeElement(
    message: string | DocumentFragment,
    className?: string
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = 'notice';
    
    if (className) {
      container.classList.add(className);
    }

    const content = document.createElement('div');
    content.className = 'notice-content';

    if (typeof message === 'string') {
      content.textContent = message;
    } else {
      content.appendChild(message);
    }

    const closeButton = document.createElement('button');
    closeButton.className = 'notice-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.hide();

    container.appendChild(content);
    container.appendChild(closeButton);

    return container;
  }

  /**
   * Show the notice
   */
  private show(): void {
    let noticeContainer = document.querySelector('.notice-container');

    if (!noticeContainer) {
      noticeContainer = document.createElement('div');
      noticeContainer.className = 'notice-container';
      document.body.appendChild(noticeContainer);
    }

    noticeContainer.appendChild(this.element);

    // Trigger animation
    requestAnimationFrame(() => {
      this.element.classList.add('notice-show');
    });
  }

  /**
   * Update the notice message
   */
  setMessage(message: string | DocumentFragment): this {
    const content = this.element.querySelector('.notice-content');
    if (content) {
      if (typeof message === 'string') {
        content.textContent = message;
      } else {
        content.innerHTML = '';
        content.appendChild(message);
      }
    }
    return this;
  }

  /**
   * Hide and remove the notice
   */
  hide(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    this.element.classList.remove('notice-show');
    this.element.classList.add('notice-hide');

    setTimeout(() => {
      this.element.remove();

      // Clean up container if empty
      const container = document.querySelector('.notice-container');
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }
}

/**
 * Create a notice with success styling
 */
export function noticeSuccess(message: string, timeout?: number): Notice {
  return new Notice(message, { timeout, class: 'notice-success' });
}

/**
 * Create a notice with error styling
 */
export function noticeError(message: string, timeout?: number): Notice {
  return new Notice(message, { timeout, class: 'notice-error' });
}

/**
 * Create a notice with warning styling
 */
export function noticeWarning(message: string, timeout?: number): Notice {
  return new Notice(message, { timeout, class: 'notice-warning' });
}

/**
 * Create a notice with info styling
 */
export function noticeInfo(message: string, timeout?: number): Notice {
  return new Notice(message, { timeout, class: 'notice-info' });
}
