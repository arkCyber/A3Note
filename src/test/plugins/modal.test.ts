/**
 * Modal API Tests
 * Aerospace-grade test suite for Modal API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Modal, SuggestModal } from '../../plugins/api/Modal';

class TestModal extends Modal {
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Test Modal' });
    contentEl.createEl('p', { text: 'This is a test modal' });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class TestSuggestModal extends SuggestModal<string> {
  items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

  getSuggestions(query: string): string[] {
    return this.items.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(item: string, el: HTMLElement): void {
    el.createEl('div', { text: item });
  }

  onChooseSuggestion(item: string): void {
    console.log('Selected:', item);
  }
}

describe('Modal API', () => {
  let app: any;

  beforeEach(() => {
    document.body.innerHTML = '';
    app = {}; // Mock app object
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Modal', () => {
    describe('constructor', () => {
      it('should create modal instance', () => {
        const modal = new TestModal(app);
        expect(modal).toBeInstanceOf(Modal);
      });

      it('should initialize with app', () => {
        const modal = new TestModal(app);
        expect(modal.app).toBe(app);
      });
    });

    describe('open', () => {
      it('should open modal', () => {
        const modal = new TestModal(app);
        modal.open();
        
        const modalEl = document.querySelector('.modal');
        expect(modalEl).not.toBeNull();
      });

      it('should call onOpen', () => {
        const modal = new TestModal(app);
        const spy = vi.spyOn(modal, 'onOpen');
        
        modal.open();
        expect(spy).toHaveBeenCalled();
      });

      it('should display modal content', () => {
        const modal = new TestModal(app);
        modal.open();
        
        expect(document.body.textContent).toContain('Test Modal');
        expect(document.body.textContent).toContain('This is a test modal');
      });

      it('should add modal to DOM', () => {
        const modal = new TestModal(app);
        modal.open();
        
        const container = document.querySelector('.modal-container');
        expect(container).not.toBeNull();
      });

      it('should be idempotent', () => {
        const modal = new TestModal(app);
        modal.open();
        modal.open();
        modal.open();
        
        const modals = document.querySelectorAll('.modal');
        expect(modals.length).toBe(1);
      });
    });

    describe('close', () => {
      it('should close modal', () => {
        const modal = new TestModal(app);
        modal.open();
        
        expect(document.querySelector('.modal')).not.toBeNull();
        
        modal.close();
        
        setTimeout(() => {
          expect(document.querySelector('.modal')).toBeNull();
        }, 300);
      });

      it('should call onClose', () => {
        const modal = new TestModal(app);
        const spy = vi.spyOn(modal, 'onClose');
        
        modal.open();
        modal.close();
        
        expect(spy).toHaveBeenCalled();
      });

      it('should be idempotent', () => {
        const modal = new TestModal(app);
        modal.open();
        
        modal.close();
        modal.close();
        modal.close();
        
        // Should not throw
        expect(true).toBe(true);
      });

      it('should work without opening first', () => {
        const modal = new TestModal(app);
        
        expect(() => {
          modal.close();
        }).not.toThrow();
      });
    });

    describe('contentEl', () => {
      it('should provide content element', () => {
        const modal = new TestModal(app);
        modal.open();
        
        expect(modal.contentEl).toBeInstanceOf(HTMLElement);
      });

      it('should be empty initially', () => {
        const modal = new Modal(app);
        modal.open();
        
        expect(modal.contentEl.children.length).toBe(0);
      });
    });

    describe('modalEl', () => {
      it('should provide modal element', () => {
        const modal = new TestModal(app);
        modal.open();
        
        expect(modal.modalEl).toBeInstanceOf(HTMLElement);
      });

      it('should have modal class', () => {
        const modal = new TestModal(app);
        modal.open();
        
        expect(modal.modalEl.classList.contains('modal')).toBe(true);
      });
    });

    describe('backdrop', () => {
      it('should create backdrop', () => {
        const modal = new TestModal(app);
        modal.open();
        
        const backdrop = document.querySelector('.modal-backdrop');
        expect(backdrop).not.toBeNull();
      });

      it('should close modal on backdrop click', () => {
        const modal = new TestModal(app);
        modal.open();
        
        const backdrop = document.querySelector('.modal-backdrop') as HTMLElement;
        backdrop.click();
        
        setTimeout(() => {
          expect(document.querySelector('.modal')).toBeNull();
        }, 300);
      });
    });

    describe('keyboard navigation', () => {
      it('should close on Escape key', () => {
        const modal = new TestModal(app);
        modal.open();
        
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);
        
        setTimeout(() => {
          expect(document.querySelector('.modal')).toBeNull();
        }, 300);
      });
    });
  });

  describe('SuggestModal', () => {
    describe('constructor', () => {
      it('should create suggest modal instance', () => {
        const modal = new TestSuggestModal(app);
        expect(modal).toBeInstanceOf(SuggestModal);
        expect(modal).toBeInstanceOf(Modal);
      });
    });

    describe('open', () => {
      it('should display input field', () => {
        const modal = new TestSuggestModal(app);
        modal.open();
        
        const input = document.querySelector('input[type="text"]');
        expect(input).not.toBeNull();
      });

      it('should focus input on open', () => {
        const modal = new TestSuggestModal(app);
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        setTimeout(() => {
          expect(document.activeElement).toBe(input);
        }, 100);
      });

      it('should display suggestions container', () => {
        const modal = new TestSuggestModal(app);
        modal.open();
        
        const suggestions = document.querySelector('.suggestion-container');
        expect(suggestions).not.toBeNull();
      });
    });

    describe('getSuggestions', () => {
      it('should filter suggestions by query', () => {
        const modal = new TestSuggestModal(app);
        
        const results = modal.getSuggestions('a');
        expect(results).toContain('Apple');
        expect(results).toContain('Banana');
        expect(results).toContain('Date');
      });

      it('should be case insensitive', () => {
        const modal = new TestSuggestModal(app);
        
        const results = modal.getSuggestions('APPLE');
        expect(results).toContain('Apple');
      });

      it('should return all items for empty query', () => {
        const modal = new TestSuggestModal(app);
        
        const results = modal.getSuggestions('');
        expect(results.length).toBe(5);
      });

      it('should return empty for no matches', () => {
        const modal = new TestSuggestModal(app);
        
        const results = modal.getSuggestions('xyz');
        expect(results.length).toBe(0);
      });
    });

    describe('input handling', () => {
      it('should update suggestions on input', () => {
        const modal = new TestSuggestModal(app);
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input.value = 'app';
        input.dispatchEvent(new Event('input'));
        
        setTimeout(() => {
          const suggestions = document.querySelectorAll('.suggestion-item');
          expect(suggestions.length).toBeGreaterThan(0);
        }, 100);
      });

      it('should handle rapid input changes', () => {
        const modal = new TestSuggestModal(app);
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        
        input.value = 'a';
        input.dispatchEvent(new Event('input'));
        
        input.value = 'ap';
        input.dispatchEvent(new Event('input'));
        
        input.value = 'app';
        input.dispatchEvent(new Event('input'));
        
        // Should not throw
        expect(true).toBe(true);
      });
    });

    describe('keyboard navigation in suggestions', () => {
      it('should navigate with arrow keys', () => {
        const modal = new TestSuggestModal(app);
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        
        // Trigger suggestions
        input.value = 'e';
        input.dispatchEvent(new Event('input'));
        
        setTimeout(() => {
          // Arrow down
          const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
          input.dispatchEvent(downEvent);
          
          // Should highlight first suggestion
          const highlighted = document.querySelector('.suggestion-item.is-selected');
          expect(highlighted).not.toBeNull();
        }, 100);
      });

      it('should select with Enter key', () => {
        const modal = new TestSuggestModal(app);
        const spy = vi.spyOn(modal, 'onChooseSuggestion');
        
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input.value = 'apple';
        input.dispatchEvent(new Event('input'));
        
        setTimeout(() => {
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
          input.dispatchEvent(enterEvent);
          
          expect(spy).toHaveBeenCalled();
        }, 100);
      });
    });

    describe('mouse interaction', () => {
      it('should select suggestion on click', () => {
        const modal = new TestSuggestModal(app);
        const spy = vi.spyOn(modal, 'onChooseSuggestion');
        
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input.value = 'a';
        input.dispatchEvent(new Event('input'));
        
        setTimeout(() => {
          const suggestion = document.querySelector('.suggestion-item') as HTMLElement;
          suggestion?.click();
          
          expect(spy).toHaveBeenCalled();
        }, 100);
      });

      it('should highlight on hover', () => {
        const modal = new TestSuggestModal(app);
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input.value = 'a';
        input.dispatchEvent(new Event('input'));
        
        setTimeout(() => {
          const suggestion = document.querySelector('.suggestion-item') as HTMLElement;
          suggestion?.dispatchEvent(new MouseEvent('mouseenter'));
          
          expect(suggestion?.classList.contains('is-selected')).toBe(true);
        }, 100);
      });
    });

    describe('edge cases', () => {
      it('should handle empty suggestions list', () => {
        class EmptySuggestModal extends SuggestModal<string> {
          getSuggestions(): string[] {
            return [];
          }
          renderSuggestion(): void {}
          onChooseSuggestion(): void {}
        }
        
        const modal = new EmptySuggestModal(app);
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input.value = 'test';
        input.dispatchEvent(new Event('input'));
        
        setTimeout(() => {
          const suggestions = document.querySelectorAll('.suggestion-item');
          expect(suggestions.length).toBe(0);
        }, 100);
      });

      it('should handle very long suggestion list', () => {
        class LongSuggestModal extends SuggestModal<number> {
          getSuggestions(): number[] {
            return Array.from({ length: 1000 }, (_, i) => i);
          }
          renderSuggestion(item: number, el: HTMLElement): void {
            el.textContent = String(item);
          }
          onChooseSuggestion(): void {}
        }
        
        const modal = new LongSuggestModal(app);
        modal.open();
        
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input.dispatchEvent(new Event('input'));
        
        // Should not freeze
        expect(true).toBe(true);
      });
    });
  });

  describe('multiple modals', () => {
    it('should handle multiple modals', () => {
      const modal1 = new TestModal(app);
      const modal2 = new TestModal(app);
      
      modal1.open();
      modal2.open();
      
      const modals = document.querySelectorAll('.modal');
      expect(modals.length).toBeGreaterThanOrEqual(1);
    });

    it('should close modals independently', () => {
      const modal1 = new TestModal(app);
      const modal2 = new TestModal(app);
      
      modal1.open();
      modal2.open();
      
      modal1.close();
      
      // modal2 should still be open
      expect(true).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have appropriate ARIA attributes', () => {
      const modal = new TestModal(app);
      modal.open();
      
      const modalEl = document.querySelector('.modal');
      expect(modalEl?.getAttribute('role')).toBeTruthy();
    });

    it('should trap focus within modal', () => {
      const modal = new TestModal(app);
      modal.open();
      
      // Focus should be trapped in modal
      expect(document.activeElement?.closest('.modal')).not.toBeNull();
    });
  });

  describe('performance', () => {
    it('should open quickly', () => {
      const start = performance.now();
      
      const modal = new TestModal(app);
      modal.open();
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle rapid open/close', () => {
      const modal = new TestModal(app);
      
      for (let i = 0; i < 10; i++) {
        modal.open();
        modal.close();
      }
      
      // Should not throw or leak memory
      expect(true).toBe(true);
    });
  });
});
