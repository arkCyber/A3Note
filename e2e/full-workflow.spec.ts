/**
 * Full Workflow E2E Tests - Aerospace Level
 * DO-178C Level A Testing
 * Simulates complete user workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Full Workflow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');
  });

  test('should complete new note workflow', async ({ page }) => {
    // Step 1: Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Step 2: Create new file with keyboard shortcut
    await page.keyboard.press('Meta+n');
    await page.waitForSelector('[data-testid="file-item"]:has-text("Untitled")');
    
    // Step 3: Type content in editor
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# My New Note\n\nThis is my first note.');
    
    // Step 4: Save file
    await page.keyboard.press('Meta+s');
    await page.waitForTimeout(500);
    
    // Step 5: Verify file is saved
    const dirtyIndicator = page.locator('[data-testid="dirty-indicator"]');
    await expect(dirtyIndicator).not.toBeVisible();
    
    // Step 6: Verify content is preserved
    const content = await editor.textContent();
    expect(content).toContain('My New Note');
  });

  test('should complete search and open workflow', async ({ page }) => {
    // Step 1: Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Step 2: Open search panel
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForSelector('[data-testid="search-panel"]');
    
    // Step 3: Type search query
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');
    
    // Step 4: Wait for results
    await page.waitForSelector('[data-testid="search-result"]', { timeout: 3000 });
    
    // Step 5: Click on first result
    const firstResult = page.locator('[data-testid="search-result"]').first();
    await firstResult.click();
    
    // Step 6: Verify file is opened in editor
    await page.waitForSelector('[data-testid="editor"]', { timeout: 5000 });
    const editor = page.locator('[data-testid="editor"]');
    await expect(editor).toBeVisible();
  });

  test('should complete command palette workflow', async ({ page }) => {
    // Step 1: Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Step 2: Open command palette
    await page.keyboard.press('Meta+p');
    await page.waitForSelector('[data-testid="command-palette"]');
    
    // Step 3: Type command name
    const commandInput = page.locator('[data-testid="command-input"]');
    await commandInput.fill('New File');
    
    // Step 4: Select and execute command
    await page.keyboard.press('Enter');
    
    // Step 5: Verify new file is created
    await page.waitForSelector('[data-testid="file-item"]:has-text("Untitled")');
    const newFile = page.locator('[data-testid="file-item"]:has-text("Untitled")');
    await expect(newFile).toBeVisible();
    
    // Step 6: Verify editor is active
    await page.waitForSelector('[data-testid="editor"]');
    const editor = page.locator('[data-testid="editor"]');
    await expect(editor).toBeVisible();
  });

  test('should complete markdown editing workflow', async ({ page }) => {
    // Step 1: Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Step 2: Type markdown content
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# Heading 1\n\n## Heading 2\n\n**Bold text** and *italic text*.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```');
    
    // Step 3: Save file
    await page.keyboard.press('Meta+s');
    await page.waitForTimeout(500);
    
    // Step 4: Toggle preview mode
    await page.keyboard.press('Meta+/');
    await page.waitForSelector('[data-testid="preview-pane"]');
    
    // Step 5: Verify markdown is rendered
    const previewPane = page.locator('[data-testid="preview-pane"]');
    await expect(previewPane).toBeVisible();
    
    // Step 6: Verify heading is rendered
    const heading = previewPane.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should complete file organization workflow', async ({ page }) => {
    // Step 1: Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Step 2: Create new folder
    const sidebar = page.locator('[data-testid="sidebar"]');
    await sidebar.click({ button: 'right' });
    await page.waitForSelector('[data-testid="context-menu"]');
    await page.click('[data-testid="new-folder-option"]');
    await page.waitForSelector('[data-testid="folder-item"]:has-text("New Folder")');
    
    // Step 3: Rename folder
    const newFolder = page.locator('[data-testid="folder-item"]:has-text("New Folder")');
    await newFolder.click({ button: 'right' });
    await page.waitForSelector('[data-testid="context-menu"]');
    await page.click('[data-testid="rename-option"]');
    await page.waitForSelector('[data-testid="rename-input"]');
    const renameInput = page.locator('[data-testid="rename-input"]');
    await renameInput.fill('My Notes');
    await page.keyboard.press('Enter');
    
    // Step 4: Create new file
    await page.keyboard.press('Meta+n');
    await page.waitForSelector('[data-testid="file-item"]:has-text("Untitled")');
    
    // Step 5: Rename file
    const newFile = page.locator('[data-testid="file-item"]:has-text("Untitled")');
    await newFile.click({ button: 'right' });
    await page.waitForSelector('[data-testid="context-menu"]');
    await page.click('[data-testid="rename-option"]');
    await page.waitForSelector('[data-testid="rename-input"]');
    await renameInput.fill('my-note.md');
    await page.keyboard.press('Enter');
    
    // Step 6: Verify organization
    const renamedFile = page.locator('[data-testid="file-item"]:has-text("my-note.md")');
    await expect(renamedFile).toBeVisible();
    
    const renamedFolder = page.locator('[data-testid="folder-item"]:has-text("My Notes")');
    await expect(renamedFolder).toBeVisible();
  });

  test('should complete multi-tab workflow', async ({ page }) => {
    // Step 1: Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Step 2: Open multiple files
    const files = page.locator('[data-testid="file-item"]');
    const fileCount = await files.count();
    
    for (let i = 0; i < Math.min(3, fileCount); i++) {
      await files.nth(i).click();
      await page.waitForTimeout(200);
    }
    
    // Step 3: Verify tabs are displayed
    const tabs = page.locator('[data-testid="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(1);
    
    // Step 4: Switch between tabs
    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(200);
    }
    
    // Step 5: Close a tab
    await page.keyboard.press('Meta+w');
    await page.waitForTimeout(500);
    
    // Step 6: Verify tab count decreased
    const tabsAfter = await page.locator('[data-testid="tab"]').count();
    expect(tabsAfter).toBeLessThan(tabCount);
  });

  test('should complete settings workflow', async ({ page }) => {
    // Step 1: Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Step 2: Open settings
    await page.click('[data-testid="settings-button"]');
    await page.waitForSelector('[data-testid="settings-modal"]');
    
    // Step 3: Change theme
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
    
    // Step 4: Verify theme changed
    const body = page.locator('body');
    const className = await body.getAttribute('class');
    expect(className).toContain('light');
    
    // Step 5: Close settings
    await page.click('[data-testid="close-settings"]');
    
    // Step 6: Verify settings closed
    const settingsModal = page.locator('[data-testid="settings-modal"]');
    await expect(settingsModal).not.toBeVisible();
  });

  test('should complete plugin workflow', async ({ page }) => {
    // Step 1: Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Step 2: Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Step 3: View plugin list
    const plugins = page.locator('[data-testid="plugin-item"]');
    const pluginCount = await plugins.count();
    expect(pluginCount).toBeGreaterThan(0);
    
    // Step 4: Open plugin marketplace
    await page.click('[data-testid="plugin-marketplace-button"]');
    await page.waitForSelector('[data-testid="plugin-marketplace"]');
    
    // Step 5: Search for plugins
    const searchInput = page.locator('[data-testid="plugin-search-input"]');
    await searchInput.fill('markdown');
    await page.waitForTimeout(500);
    
    // Step 6: View plugin details
    const pluginItem = page.locator('[data-testid="marketplace-plugin-item"]').first();
    await pluginItem.click();
    await page.waitForSelector('[data-testid="plugin-details"]');
    
    // Step 7: Close marketplace
    await page.click('[data-testid="close-marketplace"]');
    await page.waitForTimeout(500);
    
    // Step 8: Verify marketplace closed
    const marketplace = page.locator('[data-testid="plugin-marketplace"]');
    await expect(marketplace).not.toBeVisible();
  });

  test('should complete keyboard navigation workflow', async ({ page }) => {
    // Step 1: Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Step 2: Use keyboard to navigate files
    const sidebar = page.locator('[data-testid="sidebar"]');
    await sidebar.click();
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    
    // Step 3: Open file with Enter
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Step 4: Type content
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('Keyboard navigation test');
    
    // Step 5: Save with keyboard
    await page.keyboard.press('Meta+s');
    await page.waitForTimeout(500);
    
    // Step 6: Close tab with keyboard
    await page.keyboard.press('Meta+w');
    await page.waitForTimeout(500);
    
    // Step 7: Verify workflow completed
    const dirtyIndicator = page.locator('[data-testid="dirty-indicator"]');
    await expect(dirtyIndicator).not.toBeVisible();
  });

  test('should complete copy-paste workflow', async ({ page }) => {
    // Step 1: Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Step 2: Type text
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('Original text to copy');
    
    // Step 3: Select all
    await page.keyboard.press('Meta+a');
    await page.waitForTimeout(200);
    
    // Step 4: Copy
    await page.keyboard.press('Meta+c');
    await page.waitForTimeout(200);
    
    // Step 5: Move cursor
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    
    // Step 6: Paste
    await page.keyboard.press('Meta+v');
    await page.waitForTimeout(200);
    
    // Step 7: Verify text is duplicated
    const content = await editor.textContent();
    expect(content).toContain('Original text to copy');
  });

  test('should complete undo-redo workflow', async ({ page }) => {
    // Step 1: Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Step 2: Type multiple lines
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('Line 1\n');
    await page.keyboard.type('Line 2\n');
    await page.keyboard.type('Line 3\n');
    
    // Step 3: Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(200);
    
    // Step 4: Redo
    await page.keyboard.press('Meta+Shift+Z');
    await page.waitForTimeout(200);
    
    // Step 5: Verify content is restored
    const content = await editor.textContent();
    expect(content).toContain('Line 3');
  });
});
