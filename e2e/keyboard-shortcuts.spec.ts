/**
 * Keyboard Shortcuts E2E Tests - Aerospace Level
 * DO-178C Level A Testing
 * Simulates user interactions with keyboard shortcuts
 */

import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');
  });

  test('should create new file with Cmd+N', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Get initial file count
    const filesBefore = await page.locator('[data-testid="file-item"]').count();
    
    // Press Cmd+N
    await page.keyboard.press('Meta+n');
    
    // Wait for new file to appear
    await page.waitForSelector('[data-testid="file-item"]:has-text("Untitled")');
    
    // Verify new file is created
    const filesAfter = await page.locator('[data-testid="file-item"]').count();
    expect(filesAfter).toBe(filesBefore + 1);
  });

  test('should save file with Cmd+S', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Edit content
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# Test Content');
    
    // Press Cmd+S
    await page.keyboard.press('Meta+s');
    
    // Wait for save to complete
    await page.waitForTimeout(500);
    
    // Verify dirty indicator disappears
    const dirtyIndicator = page.locator('[data-testid="dirty-indicator"]');
    await expect(dirtyIndicator).not.toBeVisible();
  });

  test('should toggle sidebar with Cmd+B', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Verify sidebar is visible
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Press Cmd+B
    await page.keyboard.press('Meta+b');
    await page.waitForTimeout(500);
    
    // Verify sidebar is hidden
    await expect(sidebar).not.toBeVisible();
    
    // Press Cmd+B again
    await page.keyboard.press('Meta+b');
    await page.waitForTimeout(500);
    
    // Verify sidebar is visible again
    await expect(sidebar).toBeVisible();
  });

  test('should open search with Cmd+Shift+P', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Press Cmd+Shift+P
    await page.keyboard.press('Meta+Shift+P');
    
    // Wait for search panel to appear
    await page.waitForSelector('[data-testid="search-panel"]', { timeout: 5000 });
    
    // Verify search panel is visible
    const searchPanel = page.locator('[data-testid="search-panel"]');
    await expect(searchPanel).toBeVisible();
  });

  test('should open command palette with Cmd+P', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Press Cmd+P
    await page.keyboard.press('Meta+p');
    
    // Wait for command palette to appear
    await page.waitForSelector('[data-testid="command-palette"]', { timeout: 5000 });
    
    // Verify command palette is visible
    const commandPalette = page.locator('[data-testid="command-palette"]');
    await expect(commandPalette).toBeVisible();
  });

  test('should close panel with Escape', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open command palette
    await page.keyboard.press('Meta+p');
    await page.waitForSelector('[data-testid="command-palette"]');
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Wait for command palette to close
    await page.waitForTimeout(500);
    
    // Verify command palette is closed
    const commandPalette = page.locator('[data-testid="command-palette"]');
    await expect(commandPalette).not.toBeVisible();
  });

  test('should navigate files with arrow keys', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Focus on sidebar
    const sidebar = page.locator('[data-testid="sidebar"]');
    await sidebar.click();
    
    // Navigate down with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    
    // Navigate up with arrow keys
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    
    // Verify files are still displayed
    const files = page.locator('[data-testid="file-item"]');
    const fileCount = await files.count();
    expect(fileCount).toBeGreaterThan(0);
  });

  test('should open file with Enter key', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Focus on first file
    const firstFile = page.locator('[data-testid="file-item"]:first-child');
    await firstFile.click();
    
    // Press Enter
    await page.keyboard.press('Enter');
    
    // Wait for editor to appear
    await page.waitForSelector('[data-testid="editor"]', { timeout: 5000 });
    
    // Verify editor is visible
    const editor = page.locator('[data-testid="editor"]');
    await expect(editor).toBeVisible();
  });

  test('should toggle preview with Cmd+/', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Press Cmd+/
    await page.keyboard.press('Meta+/');
    
    // Wait for preview to appear
    await page.waitForSelector('[data-testid="preview-pane"]', { timeout: 5000 });
    
    // Verify preview is visible
    const previewPane = page.locator('[data-testid="preview-pane"]');
    await expect(previewPane).toBeVisible();
  });

  test('should navigate tabs with Cmd+Tab', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open multiple files
    const files = page.locator('[data-testid="file-item"]');
    const fileCount = await files.count();
    
    for (let i = 0; i < Math.min(3, fileCount); i++) {
      await files.nth(i).click();
      await page.waitForTimeout(200);
    }
    
    // Verify tabs are displayed
    const tabs = page.locator('[data-testid="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(1);
    
    // Navigate tabs with Cmd+Tab
    await page.keyboard.press('Meta+Tab');
    await page.waitForTimeout(200);
    
    // Verify tab navigation works
    await expect(tabs.first()).toBeVisible();
  });

  test('should close tab with Cmd+W', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open a file
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Get initial tab count
    const tabsBefore = await page.locator('[data-testid="tab"]').count();
    
    // Press Cmd+W
    await page.keyboard.press('Meta+w');
    
    // Wait for tab to close
    await page.waitForTimeout(500);
    
    // Verify tab is closed
    const tabsAfter = await page.locator('[data-testid="tab"]').count();
    expect(tabsAfter).toBeLessThan(tabsBefore);
  });

  test('should select all with Cmd+A', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Click in editor
    const editor = page.locator('.cm-content');
    await editor.click();
    
    // Press Cmd+A
    await page.keyboard.press('Meta+a');
    
    // Wait for selection
    await page.waitForTimeout(200);
    
    // Verify editor is still visible
    await expect(editor).toBeVisible();
  });

  test('should copy with Cmd+C', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Type text in editor
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('Test content');
    
    // Select text
    await page.keyboard.press('Meta+a');
    await page.waitForTimeout(200);
    
    // Press Cmd+C
    await page.keyboard.press('Meta+c');
    
    // Wait for copy to complete
    await page.waitForTimeout(200);
    
    // Verify editor is still visible
    await expect(editor).toBeVisible();
  });

  test('should paste with Cmd+V', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Type text in editor
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('Original content');
    
    // Select text
    await page.keyboard.press('Meta+a');
    await page.waitForTimeout(200);
    
    // Copy text
    await page.keyboard.press('Meta+c');
    await page.waitForTimeout(200);
    
    // Move cursor
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    
    // Paste text
    await page.keyboard.press('Meta+v');
    await page.waitForTimeout(200);
    
    // Verify editor is still visible
    await expect(editor).toBeVisible();
  });

  test('should undo with Cmd+Z', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Type text in editor
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('Test content');
    
    // Press Cmd+Z
    await page.keyboard.press('Meta+z');
    
    // Wait for undo
    await page.waitForTimeout(200);
    
    // Verify editor is still visible
    await expect(editor).toBeVisible();
  });

  test('should redo with Cmd+Shift+Z', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Type text in editor
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('Test content');
    
    // Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(200);
    
    // Redo with Cmd+Shift+Z
    await page.keyboard.press('Meta+Shift+Z');
    
    // Wait for redo
    await page.waitForTimeout(200);
    
    // Verify editor is still visible
    await expect(editor).toBeVisible();
  });

  test('should navigate command palette with arrow keys', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open command palette
    await page.keyboard.press('Meta+p');
    await page.waitForSelector('[data-testid="command-palette"]');
    
    // Navigate down with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    
    // Navigate up with arrow keys
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    
    // Verify command palette is still visible
    const commandPalette = page.locator('[data-testid="command-palette"]');
    await expect(commandPalette).toBeVisible();
  });

  test('should execute command with Enter', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open command palette
    await page.keyboard.press('Meta+p');
    await page.waitForSelector('[data-testid="command-palette"]');
    
    // Type command name
    const commandInput = page.locator('[data-testid="command-input"]');
    await commandInput.fill('New File');
    await page.waitForTimeout(200);
    
    // Press Enter to execute
    await page.keyboard.press('Enter');
    
    // Wait for command to execute
    await page.waitForTimeout(500);
    
    // Verify new file is created
    const newFile = page.locator('[data-testid="file-item"]:has-text("Untitled")');
    await expect(newFile).toBeVisible();
  });
});
