/**
 * File Operations E2E Tests - Aerospace Level
 * DO-178C Level A Testing
 * Simulates user interactions with file operations
 */

import { test, expect } from '@playwright/test';

test.describe('File Operations E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');
  });

  test('should open workspace and display files', async ({ page }) => {
    // Click on "Open Workspace" button
    await page.click('button:has-text("Open Workspace")');
    
    // Wait for sidebar to appear
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 5000 });
    
    // Verify sidebar is visible
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Check if files are displayed
    const files = page.locator('[data-testid="file-item"]');
    const fileCount = await files.count();
    expect(fileCount).toBeGreaterThan(0);
  });

  test('should create a new file', async ({ page }) => {
    // Open workspace first
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Click on "New File" button
    await page.click('[data-testid="new-file-button"]');
    
    // Wait for new file to appear
    await page.waitForSelector('[data-testid="file-item"]:has-text("Untitled")');
    
    // Verify new file is created
    const newFile = page.locator('[data-testid="file-item"]:has-text("Untitled")');
    await expect(newFile).toBeVisible();
  });

  test('should open and display file content', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Click on a file
    await page.click('[data-testid="file-item"]:first-child');
    
    // Wait for editor to appear
    await page.waitForSelector('[data-testid="editor"]', { timeout: 5000 });
    
    // Verify editor is visible
    const editor = page.locator('[data-testid="editor"]');
    await expect(editor).toBeVisible();
    
    // Check if content is displayed
    const editorContent = page.locator('.cm-content');
    await expect(editorContent).toBeVisible();
  });

  test('should edit file content', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Type in editor
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# Test Content\n\nThis is a test.');
    
    // Verify content is updated
    const content = await editor.textContent();
    expect(content).toContain('Test Content');
  });

  test('should save file', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Edit content
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# Saved Content');
    
    // Click save button
    await page.click('[data-testid="save-button"]');
    
    // Wait for save to complete (check if dirty indicator disappears)
    await page.waitForSelector('[data-testid="dirty-indicator"]', { state: 'hidden', timeout: 3000 });
    
    // Verify file is saved
    const dirtyIndicator = page.locator('[data-testid="dirty-indicator"]');
    await expect(dirtyIndicator).not.toBeVisible();
  });

  test('should delete a file', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Get initial file count
    const filesBefore = await page.locator('[data-testid="file-item"]').count();
    
    // Right-click on a file
    const firstFile = page.locator('[data-testid="file-item"]:first-child');
    await firstFile.click({ button: 'right' });
    
    // Wait for context menu
    await page.waitForSelector('[data-testid="context-menu"]');
    
    // Click "Delete" option
    await page.click('[data-testid="delete-option"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');
    
    // Wait for file to be deleted
    await page.waitForTimeout(500);
    
    // Verify file is deleted
    const filesAfter = await page.locator('[data-testid="file-item"]').count();
    expect(filesAfter).toBe(filesBefore - 1);
  });

  test('should create a new folder', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Right-click on sidebar
    const sidebar = page.locator('[data-testid="sidebar"]');
    await sidebar.click({ button: 'right' });
    
    // Wait for context menu
    await page.waitForSelector('[data-testid="context-menu"]');
    
    // Click "New Folder" option
    await page.click('[data-testid="new-folder-option"]');
    
    // Wait for folder to appear
    await page.waitForSelector('[data-testid="folder-item"]:has-text("New Folder")');
    
    // Verify folder is created
    const newFolder = page.locator('[data-testid="folder-item"]:has-text("New Folder")');
    await expect(newFolder).toBeVisible();
  });

  test('should rename a file', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Right-click on a file
    const firstFile = page.locator('[data-testid="file-item"]:first-child');
    await firstFile.click({ button: 'right' });
    
    // Wait for context menu
    await page.waitForSelector('[data-testid="context-menu"]');
    
    // Click "Rename" option
    await page.click('[data-testid="rename-option"]');
    
    // Wait for rename dialog
    await page.waitForSelector('[data-testid="rename-input"]');
    
    // Type new name
    const renameInput = page.locator('[data-testid="rename-input"]');
    await renameInput.fill('renamed-file.md');
    
    // Confirm rename
    await page.keyboard.press('Enter');
    
    // Wait for rename to complete
    await page.waitForTimeout(500);
    
    // Verify file is renamed
    const renamedFile = page.locator('[data-testid="file-item"]:has-text("renamed-file.md")');
    await expect(renamedFile).toBeVisible();
  });

  test('should navigate through folders', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Click on a folder
    const folder = page.locator('[data-testid="folder-item"]:first-child');
    await folder.click();
    
    // Wait for folder to expand
    await page.waitForTimeout(500);
    
    // Verify folder contents are displayed
    const folderContents = page.locator('[data-testid="folder-contents"]');
    await expect(folderContents).toBeVisible();
  });

  test('should display file metadata', async ({ page }) => {
    // Open workspace and file
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.click('[data-testid="file-item"]:first-child');
    await page.waitForSelector('[data-testid="editor"]');
    
    // Check status bar for file info
    const statusBar = page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toBeVisible();
    
    // Verify file name is displayed
    const fileName = await statusBar.textContent();
    expect(fileName).toBeTruthy();
  });
});
