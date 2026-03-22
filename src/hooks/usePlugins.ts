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
        
        // Register all sample plugins
        await app.plugins.registerPlugin(SamplePlugin, samplePluginManifest);
        console.log('Sample plugin registered');
        
        await app.plugins.registerPlugin(WordCountPlugin, wordCountManifest);
        console.log('Word Count plugin registered');
        
        await app.plugins.registerPlugin(QuickSwitcherPlugin, quickSwitcherManifest);
        console.log('Quick Switcher plugin registered');
        
        await app.plugins.registerPlugin(BacklinksPlugin, backlinksManifest);
        console.log('Backlinks plugin registered');
        
        await app.plugins.registerPlugin(TagsPlugin, tagsManifest);
        console.log('Tags plugin registered');
        
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
