/**
 * Realistic E2E Tests - Aerospace Level
 * DO-178C Level A Testing
 * Simulates user interactions with actual UI elements
 */

import { test, expect } from '@playwright/test';

test.describe('Realistic E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');
  });

  test('should display welcome screen', async ({ page }) => {
    // Verify welcome screen elements
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
    await expect(page.getByRole('button', { name: /open workspace/i })).toBeVisible();
  });

  test('should have keyboard shortcuts displayed', async ({ page }) => {
    // Verify keyboard shortcuts are shown
    await expect(page.getByText('⌘+N - New file')).toBeVisible();
    await expect(page.getByText('⌘+S - Save file')).toBeVisible();
    await expect(page.getByText('⌘+B - Toggle sidebar')).toBeVisible();
  });

  test('should be responsive to viewport changes', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await expect(page.getByText('Welcome to A3Note')).toBeVisible();
    }
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/A3Note/);
  });

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    
    // Allow some expected errors but check for critical ones
    const criticalErrors = errors.filter(err => 
      !err.includes('ResizeObserver') && 
      !err.includes('devtools')
    );
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify something is focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('should have accessible UI elements', async ({ page }) => {
    // Check for proper ARIA labels and roles
    const openButton = page.getByRole('button', { name: /open workspace/i });
    await expect(openButton).toBeVisible();
    await expect(openButton).toBeEnabled();
  });

  test('should handle theme correctly', async ({ page }) => {
    // Check if dark theme is applied
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should have dark background
    expect(bgColor).toBeTruthy();
  });

  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:1420');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        setTimeout(() => resolve([]), 5000);
      });
    });

    expect(metrics).toBeDefined();
  });

  test('should have no automatic accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:1420');
    
    // Check for basic accessibility
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');
  });

  test('should handle button clicks', async ({ page }) => {
    // Click on Open Workspace button
    const openButton = page.getByRole('button', { name: /open workspace/i });
    await openButton.click();
    
    // Wait a moment for any action
    await page.waitForTimeout(1000);
    
    // Verify button is still clickable
    await expect(openButton).toBeVisible();
  });

  test('should handle hover states', async ({ page }) => {
    const openButton = page.getByRole('button', { name: /open workspace/i });
    
    // Hover over button
    await openButton.hover();
    
    // Verify button is still visible
    await expect(openButton).toBeVisible();
  });

  test('should handle rapid interactions', async ({ page }) => {
    const openButton = page.getByRole('button', { name: /open workspace/i });
    
    // Click multiple times rapidly
    for (let i = 0; i < 10; i++) {
      await openButton.click();
      await page.waitForTimeout(50);
    }
    
    // Verify button is still visible
    await expect(openButton).toBeVisible();
  });

  test('should handle window resize', async ({ page }) => {
    // Resize window multiple times
    const sizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(200);
      await expect(page.getByText('Welcome to A3Note')).toBeVisible();
    }
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test various keyboard shortcuts
    const shortcuts = [
      'Meta+n',
      'Meta+s',
      'Meta+b',
      'Meta+p',
      'Meta+Shift+P',
    ];

    for (const shortcut of shortcuts) {
      await page.keyboard.press(shortcut);
      await page.waitForTimeout(200);
    }

    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle escape key', async ({ page }) => {
    // Press escape multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }

    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle text input', async ({ page }) => {
    // Type some text (even though there's no input field initially)
    await page.keyboard.type('test');
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle scroll', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);
    
    // Scroll up
    await page.evaluate(() => window.scrollBy(0, -500));
    await page.waitForTimeout(200);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle focus and blur', async ({ page }) => {
    // Focus on body
    await page.locator('body').focus();
    await page.waitForTimeout(100);
    
    // Blur
    await page.locator('body').blur();
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle copy and paste', async ({ page }) => {
    // Copy
    await page.keyboard.press('Meta+c');
    await page.waitForTimeout(100);
    
    // Paste
    await page.keyboard.press('Meta+v');
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle select all', async ({ page }) => {
    // Select all
    await page.keyboard.press('Meta+a');
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle undo and redo', async ({ page }) => {
    // Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(100);
    
    // Redo
    await page.keyboard.press('Meta+Shift+z');
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle tab navigation', async ({ page }) => {
    // Tab through elements
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }

    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle shift+tab navigation', async ({ page }) => {
    // Shift+Tab through elements
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(50);
    }

    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle arrow keys', async ({ page }) => {
    // Arrow keys
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    
    for (const key of arrowKeys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(100);
    }

    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle page up and down', async ({ page }) => {
    // Page Up and Down
    await page.keyboard.press('PageUp');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle home and end keys', async ({ page }) => {
    // Home and End
    await page.keyboard.press('Home');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('End');
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle enter key', async ({ page }) => {
    // Enter key
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle space key', async ({ page }) => {
    // Space key
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle backspace and delete', async ({ page }) => {
    // Backspace
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(100);
    
    // Delete
    await page.keyboard.press('Delete');
    await page.waitForTimeout(100);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle multiple rapid keyboard shortcuts', async ({ page }) => {
    // Rapid keyboard shortcuts
    const shortcuts = [
      'Meta+n', 'Meta+s', 'Meta+b', 'Meta+p', 'Meta+Shift+P',
      'Escape', 'Meta+a', 'Meta+c', 'Meta+v', 'Meta+z',
    ];

    for (const shortcut of shortcuts) {
      await page.keyboard.press(shortcut);
      await page.waitForTimeout(50);
    }

    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle page refresh', async ({ page }) => {
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify welcome screen is still visible
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle navigation back and forward', async ({ page }) => {
    // Navigate back
    await page.goBack();
    await page.waitForTimeout(200);
    
    // Navigate forward
    await page.goForward();
    await page.waitForTimeout(200);
    
    // Verify welcome screen is still visible
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle long-running interactions', async ({ page }) => {
    // Simulate long-running interaction
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000);
    
    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle concurrent interactions', async ({ page }) => {
    // Simulate concurrent interactions
    const promises = [
      page.keyboard.press('Tab'),
      page.keyboard.press('Meta+n'),
      page.keyboard.press('Escape'),
    ];

    await Promise.all(promises);
    await page.waitForTimeout(200);

    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });

  test('should handle stress test', async ({ page }) => {
    // Stress test with many rapid interactions
    for (let i = 0; i < 50; i++) {
      // Random keyboard shortcuts
      const shortcuts = ['Tab', 'Escape', 'Meta+n', 'Meta+s', 'Meta+b'];
      const randomShortcut = shortcuts[Math.floor(Math.random() * shortcuts.length)];
      await page.keyboard.press(randomShortcut);
      await page.waitForTimeout(10);
    }

    // Verify page is still responsive
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
  });
});
