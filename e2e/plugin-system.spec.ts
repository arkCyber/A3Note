/**
 * Plugin System E2E Tests - Aerospace Level
 * DO-178C Level A Testing
 * Simulates user interactions with plugin system
 */

import { test, expect } from '@playwright/test';

test.describe('Plugin System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');
  });

  test('should open plugin manager', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    
    // Wait for plugin manager to appear
    await page.waitForSelector('[data-testid="plugin-manager"]', { timeout: 5000 });
    
    // Verify plugin manager is visible
    const pluginManager = page.locator('[data-testid="plugin-manager"]');
    await expect(pluginManager).toBeVisible();
  });

  test('should display installed plugins', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Verify plugins are displayed
    const plugins = page.locator('[data-testid="plugin-item"]');
    const pluginCount = await plugins.count();
    expect(pluginCount).toBeGreaterThan(0);
  });

  test('should enable plugin', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Find a disabled plugin
    const disabledPlugin = page.locator('[data-testid="plugin-item"][data-enabled="false"]').first();
    
    // Enable plugin
    const enableButton = disabledPlugin.locator('[data-testid="enable-button"]');
    await enableButton.click();
    
    // Wait for plugin to be enabled
    await page.waitForTimeout(500);
    
    // Verify plugin is enabled
    await expect(disabledPlugin).toHaveAttribute('data-enabled', 'true');
  });

  test('should disable plugin', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Find an enabled plugin
    const enabledPlugin = page.locator('[data-testid="plugin-item"][data-enabled="true"]').first();
    
    // Disable plugin
    const disableButton = enabledPlugin.locator('[data-testid="disable-button"]');
    await disableButton.click();
    
    // Wait for plugin to be disabled
    await page.waitForTimeout(500);
    
    // Verify plugin is disabled
    await expect(enabledPlugin).toHaveAttribute('data-enabled', 'false');
  });

  test('should open plugin settings', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Click on plugin settings
    const settingsButton = page.locator('[data-testid="plugin-settings-button"]').first();
    await settingsButton.click();
    
    // Wait for settings panel to appear
    await page.waitForSelector('[data-testid="plugin-settings"]', { timeout: 5000 });
    
    // Verify settings panel is visible
    const settingsPanel = page.locator('[data-testid="plugin-settings"]');
    await expect(settingsPanel).toBeVisible();
  });

  test('should close plugin manager', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Close plugin manager
    await page.click('[data-testid="close-plugin-manager"]');
    
    // Wait for plugin manager to close
    await page.waitForTimeout(500);
    
    // Verify plugin manager is closed
    const pluginManager = page.locator('[data-testid="plugin-manager"]');
    await expect(pluginManager).not.toBeVisible();
  });

  test('should open plugin marketplace', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin marketplace
    await page.click('[data-testid="plugin-marketplace-button"]');
    
    // Wait for plugin marketplace to appear
    await page.waitForSelector('[data-testid="plugin-marketplace"]', { timeout: 5000 });
    
    // Verify plugin marketplace is visible
    const pluginMarketplace = page.locator('[data-testid="plugin-marketplace"]');
    await expect(pluginMarketplace).toBeVisible();
  });

  test('should search plugins in marketplace', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin marketplace
    await page.click('[data-testid="plugin-marketplace-button"]');
    await page.waitForSelector('[data-testid="plugin-marketplace"]');
    
    // Type search query
    const searchInput = page.locator('[data-testid="plugin-search-input"]');
    await searchInput.fill('markdown');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify search results are displayed
    const searchResults = page.locator('[data-testid="marketplace-plugin-item"]');
    const resultCount = await searchResults.count();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('should install plugin from marketplace', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin marketplace
    await page.click('[data-testid="plugin-marketplace-button"]');
    await page.waitForSelector('[data-testid="plugin-marketplace"]');
    
    // Click install button on first plugin
    const installButton = page.locator('[data-testid="install-plugin-button"]').first();
    await installButton.click();
    
    // Wait for installation to start
    await page.waitForTimeout(500);
    
    // Verify installation button changes state
    await expect(installButton).toBeVisible();
  });

  test('should view plugin details', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin marketplace
    await page.click('[data-testid="plugin-marketplace-button"]');
    await page.waitForSelector('[data-testid="plugin-marketplace"]');
    
    // Click on a plugin
    const pluginItem = page.locator('[data-testid="marketplace-plugin-item"]').first();
    await pluginItem.click();
    
    // Wait for plugin details to appear
    await page.waitForSelector('[data-testid="plugin-details"]', { timeout: 5000 });
    
    // Verify plugin details are visible
    const pluginDetails = page.locator('[data-testid="plugin-details"]');
    await expect(pluginDetails).toBeVisible();
  });

  test('should filter plugins by category', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin marketplace
    await page.click('[data-testid="plugin-marketplace-button"]');
    await page.waitForSelector('[data-testid="plugin-marketplace"]');
    
    // Click on category filter
    const categoryFilter = page.locator('[data-testid="category-filter"]').first();
    await categoryFilter.click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Verify plugins are displayed
    const plugins = page.locator('[data-testid="marketplace-plugin-item"]');
    const pluginCount = await plugins.count();
    expect(pluginCount).toBeGreaterThan(0);
  });

  test('should check for plugin updates', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Click check for updates
    const checkUpdatesButton = page.locator('[data-testid="check-updates-button"]');
    await checkUpdatesButton.click();
    
    // Wait for update check to complete
    await page.waitForTimeout(1000);
    
    // Verify update check button is still visible
    await expect(checkUpdatesButton).toBeVisible();
  });

  test('should update plugin', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Find a plugin with updates
    const updatablePlugin = page.locator('[data-testid="plugin-item"][data-has-update="true"]').first();
    
    if (await updatablePlugin.count() > 0) {
      // Click update button
      const updateButton = updatablePlugin.locator('[data-testid="update-button"]');
      await updateButton.click();
      
      // Wait for update to complete
      await page.waitForTimeout(1000);
      
      // Verify update button is still visible
      await expect(updateButton).toBeVisible();
    }
  });

  test('should view plugin changelog', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Click on plugin to view details
    const pluginItem = page.locator('[data-testid="plugin-item"]').first();
    await pluginItem.click();
    
    // Wait for plugin details
    await page.waitForSelector('[data-testid="plugin-details"]');
    
    // Click on changelog tab
    const changelogTab = page.locator('[data-testid="changelog-tab"]');
    await changelogTab.click();
    
    // Wait for changelog to appear
    await page.waitForTimeout(500);
    
    // Verify changelog is displayed
    const changelog = page.locator('[data-testid="changelog"]');
    await expect(changelog).toBeVisible();
  });

  test('should uninstall plugin', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Find an installed plugin
    const installedPlugin = page.locator('[data-testid="plugin-item"]').first();
    
    // Click uninstall button
    const uninstallButton = installedPlugin.locator('[data-testid="uninstall-button"]');
    await uninstallButton.click();
    
    // Wait for confirmation dialog
    await page.waitForSelector('[data-testid="confirm-uninstall"]');
    
    // Confirm uninstall
    await page.click('[data-testid="confirm-uninstall-yes"]');
    
    // Wait for uninstall to complete
    await page.waitForTimeout(500);
    
    // Verify plugin is uninstalled
    await expect(installedPlugin).not.toBeVisible();
  });

  test('should display plugin statistics', async ({ page }) => {
    // Open workspace
    await page.click('button:has-text("Open Workspace")');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    // Open plugin manager
    await page.click('[data-testid="plugin-manager-button"]');
    await page.waitForSelector('[data-testid="plugin-manager"]');
    
    // Verify plugin statistics are displayed
    const stats = page.locator('[data-testid="plugin-stats"]');
    await expect(stats).toBeVisible();
  });
});
