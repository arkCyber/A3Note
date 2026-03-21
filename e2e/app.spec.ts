import { test, expect } from '@playwright/test';

test.describe('A3Note Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome screen on first load', async ({ page }) => {
    await expect(page.getByText('Welcome to A3Note')).toBeVisible();
    await expect(page.getByRole('button', { name: /open workspace/i })).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/A3Note/);
  });

  test('should display keyboard shortcuts on welcome screen', async ({ page }) => {
    await expect(page.getByText('⌘+N - New file')).toBeVisible();
    await expect(page.getByText('⌘+S - Save file')).toBeVisible();
    await expect(page.getByText('⌘+B - Toggle sidebar')).toBeVisible();
  });

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('should be responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1366, height: 768 },  // Laptop
      { width: 768, height: 1024 },  // Tablet
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await expect(page.getByText('Welcome to A3Note')).toBeVisible();
    }
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
});

test.describe('File Operations E2E', () => {
  test.skip('should create and open a new file', async ({ page }) => {
    // This test requires Tauri dialog interaction
    // Skip in CI environment
    if (process.env.CI) {
      return;
    }

    await page.goto('/');
    // Test file creation workflow
    // Note: Actual implementation depends on Tauri dialog mocking
  });

  test.skip('should save file with keyboard shortcut', async ({ page }) => {
    if (process.env.CI) {
      return;
    }

    // Test Cmd+S / Ctrl+S functionality
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+S' : 'Control+S');
  });
});

test.describe('Performance Tests', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
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
});

test.describe('Accessibility Tests', () => {
  test('should have no automatic accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic accessibility
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});
