/**
 * Plugin Manager Component
 * UI for managing plugins (enable/disable/configure)
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { app } from '../plugins/api/App';
import { PluginInstance } from '../plugins/loader/PluginManager';

interface PluginManagerProps {
  onClose: () => void;
}

export default function PluginManager({ onClose }: PluginManagerProps) {
  const { t } = useTranslation('settings');
  const [plugins, setPlugins] = useState<PluginInstance[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadPlugins();
  }, []);
  
  const loadPlugins = () => {
    const allPlugins = app.plugins.getAllPlugins();
    setPlugins(allPlugins);
  };
  
  const handleTogglePlugin = async (pluginId: string, currentlyEnabled: boolean) => {
    setLoading(true);
    try {
      if (currentlyEnabled) {
        await app.plugins.disablePlugin(pluginId);
      } else {
        await app.plugins.enablePlugin(pluginId);
      }
      loadPlugins();
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
      alert(`Failed to ${currentlyEnabled ? 'disable' : 'enable'} plugin: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnloadPlugin = async (pluginId: string, pluginName: string) => {
    if (!confirm(`Are you sure you want to unload "${pluginName}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await app.plugins.unloadPlugin(pluginId);
      loadPlugins();
    } catch (error) {
      console.error('Failed to unload plugin:', error);
      alert(`Failed to unload plugin: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Plugin Manager</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {plugins.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg mb-2">No plugins installed</p>
              <p className="text-sm">Install plugins to extend A3Note's functionality</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plugins.map((pluginInstance) => (
                <div
                  key={pluginInstance.manifest.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">
                          {pluginInstance.manifest.name}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
                          v{pluginInstance.manifest.version}
                        </span>
                        {pluginInstance.enabled && (
                          <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                            Enabled
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {pluginInstance.manifest.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>By {pluginInstance.manifest.author}</span>
                        <span>ID: {pluginInstance.manifest.id}</span>
                        {pluginInstance.manifest.isDesktopOnly && (
                          <span className="text-orange-600">Desktop Only</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={() => handleTogglePlugin(
                          pluginInstance.manifest.id,
                          pluginInstance.enabled
                        )}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          pluginInstance.enabled
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pluginInstance.enabled ? 'Disable' : 'Enable'}
                      </button>
                      
                      {/* Unload Button */}
                      <button
                        onClick={() => handleUnloadPlugin(
                          pluginInstance.manifest.id,
                          pluginInstance.manifest.name
                        )}
                        disabled={loading}
                        className="px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Unload
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {plugins.length} plugin{plugins.length !== 1 ? 's' : ''} installed
              {' • '}
              {plugins.filter(p => p.enabled).length} enabled
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
