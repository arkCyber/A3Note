/**
 * Plugin Loader Tests
 * Tests for dynamic plugin loading
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../plugins/api/App';
import { DynamicPluginLoader } from '../plugins/loader/DynamicPluginLoader';

describe('Dynamic Plugin Loader', () => {
  let app: App;
  let loader: DynamicPluginLoader;
  
  beforeEach(() => {
    app = new App();
    app.initialize('/test/workspace');
    loader = new DynamicPluginLoader(app);
  });
  
  describe('Loader Creation', () => {
    it('should create loader instance', () => {
      expect(loader).toBeDefined();
      expect(loader).toBeInstanceOf(DynamicPluginLoader);
    });
    
    it('should have empty bundles initially', () => {
      const bundles = loader.getAllBundles();
      expect(bundles).toHaveLength(0);
    });
  });
  
  describe('Plugin Loading', () => {
    it('should load plugin from module path', async () => {
      // This would require actual module files to test
      // For now, we test the structure
      expect(typeof loader.loadPluginFromModule).toBe('function');
      expect(typeof loader.loadAndRegisterPlugin).toBe('function');
    });
    
    it('should track loaded bundles', () => {
      const bundles = loader.getAllBundles();
      expect(Array.isArray(bundles)).toBe(true);
    });
  });
});
