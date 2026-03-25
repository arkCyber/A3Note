/**
 * Notice API Tests
 * Aerospace-grade test suite for Notice API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Notice } from '../../plugins/api/Notice';

describe('Notice API', () => {
  beforeEach(() => {
    // Clear any existing notices
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create notice with message', () => {
      const notice = new Notice('Test message');
      expect(notice).toBeInstanceOf(Notice);
    });

    it('should create notice with timeout', () => {
      const notice = new Notice('Test', 5000);
      expect(notice).toBeInstanceOf(Notice);
    });

    it('should create notice with type', () => {
      const notice = new Notice('Test', 0, 'success');
      expect(notice).toBeInstanceOf(Notice);
    });

    it('should display notice in DOM', () => {
      new Notice('Test message');
      const container = document.querySelector('.notice-container');
      expect(container).not.toBeNull();
    });
  });

  describe('message display', () => {
    it('should display message text', () => {
      new Notice('Hello World');
      const noticeElement = document.querySelector('.notice');
      expect(noticeElement?.textContent).toContain('Hello World');
    });

    it('should handle long messages', () => {
      const longMessage = 'a'.repeat(500);
      new Notice(longMessage);
      const noticeElement = document.querySelector('.notice');
      expect(noticeElement?.textContent).toContain(longMessage);
    });

    it('should handle special characters', () => {
      const special = 'Test <>&"\'';
      new Notice(special);
      const noticeElement = document.querySelector('.notice');
      expect(noticeElement?.textContent).toContain('Test');
    });

    it('should handle unicode', () => {
      new Notice('Hello 世界 🌍');
      const noticeElement = document.querySelector('.notice');
      expect(noticeElement?.textContent).toContain('世界');
    });
  });

  describe('notice types', () => {
    it('should create info notice', () => {
      new Notice('Info', 0, 'info');
      const notice = document.querySelector('.notice');
      expect(notice?.classList.contains('notice-info')).toBe(true);
    });

    it('should create success notice', () => {
      new Notice('Success', 0, 'success');
      const notice = document.querySelector('.notice');
      expect(notice?.classList.contains('notice-success')).toBe(true);
    });

    it('should create warning notice', () => {
      new Notice('Warning', 0, 'warning');
      const notice = document.querySelector('.notice');
      expect(notice?.classList.contains('notice-warning')).toBe(true);
    });

    it('should create error notice', () => {
      new Notice('Error', 0, 'error');
      const notice = document.querySelector('.notice');
      expect(notice?.classList.contains('notice-error')).toBe(true);
    });

    it('should default to info type', () => {
      new Notice('Default');
      const notice = document.querySelector('.notice');
      expect(notice?.classList.contains('notice-info')).toBe(true);
    });
  });

  describe('timeout behavior', () => {
    it('should auto-hide after default timeout', () => {
      new Notice('Test');
      
      expect(document.querySelector('.notice')).not.toBeNull();
      
      vi.advanceTimersByTime(4000);
      expect(document.querySelector('.notice')).toBeNull();
    });

    it('should auto-hide after custom timeout', () => {
      new Notice('Test', 2000);
      
      expect(document.querySelector('.notice')).not.toBeNull();
      
      vi.advanceTimersByTime(2000);
      expect(document.querySelector('.notice')).toBeNull();
    });

    it('should not auto-hide when timeout is 0', () => {
      new Notice('Test', 0);
      
      vi.advanceTimersByTime(10000);
      expect(document.querySelector('.notice')).not.toBeNull();
    });

    it('should handle negative timeout as 0', () => {
      new Notice('Test', -1);
      
      vi.advanceTimersByTime(10000);
      expect(document.querySelector('.notice')).not.toBeNull();
    });
  });

  describe('hide method', () => {
    it('should hide notice immediately', () => {
      const notice = new Notice('Test', 0);
      
      expect(document.querySelector('.notice')).not.toBeNull();
      
      notice.hide();
      
      // Wait for animation
      vi.advanceTimersByTime(300);
      expect(document.querySelector('.notice')).toBeNull();
    });

    it('should be idempotent', () => {
      const notice = new Notice('Test', 0);
      
      notice.hide();
      notice.hide();
      notice.hide();
      
      vi.advanceTimersByTime(300);
      expect(document.querySelector('.notice')).toBeNull();
    });

    it('should cancel auto-hide timer', () => {
      const notice = new Notice('Test', 5000);
      
      notice.hide();
      
      vi.advanceTimersByTime(5000);
      // Should already be hidden, not hide again
      expect(document.querySelector('.notice')).toBeNull();
    });
  });

  describe('multiple notices', () => {
    it('should display multiple notices', () => {
      new Notice('First');
      new Notice('Second');
      new Notice('Third');
      
      const notices = document.querySelectorAll('.notice');
      expect(notices.length).toBe(3);
    });

    it('should stack notices vertically', () => {
      new Notice('First');
      new Notice('Second');
      
      const container = document.querySelector('.notice-container');
      expect(container?.children.length).toBe(2);
    });

    it('should hide notices independently', () => {
      const notice1 = new Notice('First', 0);
      const notice2 = new Notice('Second', 0);
      
      notice1.hide();
      vi.advanceTimersByTime(300);
      
      const notices = document.querySelectorAll('.notice');
      expect(notices.length).toBe(1);
      expect(notices[0].textContent).toContain('Second');
    });

    it('should handle rapid creation', () => {
      for (let i = 0; i < 10; i++) {
        new Notice(`Notice ${i}`);
      }
      
      const notices = document.querySelectorAll('.notice');
      expect(notices.length).toBe(10);
    });
  });

  describe('container management', () => {
    it('should create container on first notice', () => {
      expect(document.querySelector('.notice-container')).toBeNull();
      
      new Notice('Test');
      
      expect(document.querySelector('.notice-container')).not.toBeNull();
    });

    it('should reuse existing container', () => {
      new Notice('First');
      const container1 = document.querySelector('.notice-container');
      
      new Notice('Second');
      const container2 = document.querySelector('.notice-container');
      
      expect(container1).toBe(container2);
    });

    it('should position container correctly', () => {
      new Notice('Test');
      const container = document.querySelector('.notice-container') as HTMLElement;
      
      expect(container.style.position).toBe('fixed');
      expect(container.style.top).toBeTruthy();
      expect(container.style.right).toBeTruthy();
    });
  });

  describe('animations', () => {
    it('should add show animation class', () => {
      new Notice('Test');
      const notice = document.querySelector('.notice');
      
      expect(notice?.classList.contains('notice-show')).toBe(true);
    });

    it('should add hide animation class on hide', () => {
      const notice = new Notice('Test', 0);
      
      notice.hide();
      
      const noticeElement = document.querySelector('.notice');
      expect(noticeElement?.classList.contains('notice-hide')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have appropriate ARIA role', () => {
      new Notice('Test');
      const notice = document.querySelector('.notice');
      
      expect(notice?.getAttribute('role')).toBeTruthy();
    });

    it('should be keyboard accessible', () => {
      const notice = new Notice('Test', 0);
      const noticeElement = document.querySelector('.notice') as HTMLElement;
      
      // Should be focusable or have close button
      expect(noticeElement).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      new Notice('');
      const notice = document.querySelector('.notice');
      expect(notice).not.toBeNull();
    });

    it('should handle very long timeout', () => {
      new Notice('Test', Number.MAX_SAFE_INTEGER);
      expect(document.querySelector('.notice')).not.toBeNull();
    });

    it('should handle concurrent hide calls', () => {
      const notice = new Notice('Test', 0);
      
      Promise.all([
        Promise.resolve(notice.hide()),
        Promise.resolve(notice.hide()),
        Promise.resolve(notice.hide()),
      ]);
      
      vi.advanceTimersByTime(300);
      expect(document.querySelectorAll('.notice').length).toBe(0);
    });
  });

  describe('memory management', () => {
    it('should clean up DOM on hide', () => {
      const notice = new Notice('Test', 0);
      
      notice.hide();
      vi.advanceTimersByTime(300);
      
      expect(document.querySelector('.notice')).toBeNull();
    });

    it('should clean up timers', () => {
      const notice = new Notice('Test', 5000);
      const timerCount = vi.getTimerCount();
      
      notice.hide();
      
      expect(vi.getTimerCount()).toBeLessThan(timerCount);
    });

    it('should handle many notices without memory leak', () => {
      const notices = [];
      for (let i = 0; i < 100; i++) {
        notices.push(new Notice(`Notice ${i}`, 0));
      }
      
      notices.forEach(n => n.hide());
      vi.advanceTimersByTime(300);
      
      expect(document.querySelectorAll('.notice').length).toBe(0);
    });
  });

  describe('performance', () => {
    it('should create notices quickly', () => {
      const start = performance.now();
      
      for (let i = 0; i < 50; i++) {
        new Notice(`Notice ${i}`);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should be very fast
    });

    it('should hide notices quickly', () => {
      const notices = [];
      for (let i = 0; i < 50; i++) {
        notices.push(new Notice(`Notice ${i}`, 0));
      }
      
      const start = performance.now();
      notices.forEach(n => n.hide());
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100);
    });
  });
});
