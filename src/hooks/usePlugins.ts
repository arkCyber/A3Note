/**
 * usePlugins Hook
 * React hook for managing plugins in the application
 */

import { useEffect, useState } from 'react';
import { app } from '../plugins/api/App';
import SamplePlugin, { samplePluginManifest } from '../plugins/samples/SamplePlugin';
import WordCountPlugin, { wordCountManifest } from '../plugins/samples/WordCountPlugin';
import QuickSwitcherPlugin, { quickSwitcherManifest } from '../plugins/samples/QuickSwitcherPlugin';
import BacklinksPlugin, { backlinksManifest } from '../plugins/samples/BacklinksPlugin';
import TagsPlugin, { tagsManifest } from '../plugins/samples/TagsPlugin';

export function usePlugins() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    const initializePlugins = async () => {
      if (initialized) {
        return;
      }
      
      try {
        console.log('Initializing plugin system...');
        
        // Register all sample plugins only if not already registered
        const registerIfNotExists = async (PluginClass: any, manifest: any, name: string) => {
          if (!app.plugins.getPlugin(manifest.id)) {
            await app.plugins.registerPlugin(PluginClass, manifest);
            console.log(`${name} registered`);
          }
        };
        
        await registerIfNotExists(SamplePlugin, samplePluginManifest, 'Sample plugin');
        await registerIfNotExists(WordCountPlugin, wordCountManifest, 'Word Count plugin');
        await registerIfNotExists(QuickSwitcherPlugin, quickSwitcherManifest, 'Quick Switcher plugin');
        await registerIfNotExists(BacklinksPlugin, backlinksManifest, 'Backlinks plugin');
        await registerIfNotExists(TagsPlugin, tagsManifest, 'Tags plugin');
        
        // Load enabled plugins from storage
        await app.plugins.loadEnabledPlugins();
        console.log('Enabled plugins loaded');
        
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize plugins:', error);
      }
    };
    
    initializePlugins();
    
    // Cleanup on unmount
    return () => {
      if (initialized) {
        app.plugins.unloadAllPlugins().catch(console.error);
      }
    };
  }, [initialized]);
  
  return {
    initialized,
    pluginManager: app.plugins,
  };
}
