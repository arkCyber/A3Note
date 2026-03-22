/**
 * Plugin Updater Component
 * Shows available plugin updates and allows one-click updates
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Download, Check, AlertCircle } from 'lucide-react';

interface PluginUpdate {
  id: string;
  name: string;
  currentVersion: string;
  latestVersion: string;
  repo: string;
}

export default function PluginUpdater() {
  const [updates, setUpdates] = useState<PluginUpdate[]>([]);
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const checkForUpdates = async () => {
    setChecking(true);
    
    try {
      // Simulate checking for updates
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock updates data
      const mockUpdates: PluginUpdate[] = [
        {
          id: 'sample-plugin',
          name: 'Sample Plugin',
          currentVersion: '1.0.0',
          latestVersion: '1.1.0',
          repo: 'https://github.com/example/sample-plugin',
        },
      ];
      
      setUpdates(mockUpdates);
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleUpdate = async (update: PluginUpdate) => {
    setUpdating(update.id);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Plugin "${update.name}" updated to v${update.latestVersion}!`);
      
      // Remove from updates list
      setUpdates(prev => prev.filter(u => u.id !== update.id));
    } catch (error) {
      console.error('Failed to update plugin:', error);
      alert(`Failed to update plugin: ${error}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateAll = async () => {
    for (const update of updates) {
      await handleUpdate(update);
    }
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  if (updates.length === 0 && !checking) {
    return (
      <div className="p-4 bg-background rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-3">
          <Check className="text-green-500" size={20} />
          <h3 className="font-semibold">All plugins are up to date</h3>
        </div>
        <button
          onClick={checkForUpdates}
          disabled={checking}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className="inline mr-2" />
          Check for Updates
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-background rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-yellow-500" size={20} />
          <h3 className="font-semibold">
            {updates.length} update{updates.length !== 1 ? 's' : ''} available
          </h3>
        </div>
        {updates.length > 1 && (
          <button
            onClick={handleUpdateAll}
            disabled={updating !== null}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            Update All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {updates.map(update => (
          <div
            key={update.id}
            className="flex items-center justify-between p-3 bg-secondary rounded border border-border"
          >
            <div>
              <h4 className="font-medium">{update.name}</h4>
              <p className="text-sm text-muted-foreground">
                v{update.currentVersion} → v{update.latestVersion}
              </p>
            </div>
            <button
              onClick={() => handleUpdate(update)}
              disabled={updating === update.id}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updating === update.id ? (
                'Updating...'
              ) : (
                <>
                  <Download size={16} className="inline mr-1" />
                  Update
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={checkForUpdates}
        disabled={checking}
        className="mt-4 px-4 py-2 bg-background hover:bg-accent rounded text-sm transition-colors disabled:opacity-50"
      >
        <RefreshCw size={16} className="inline mr-2" />
        {checking ? 'Checking...' : 'Check Again'}
      </button>
    </div>
  );
}
