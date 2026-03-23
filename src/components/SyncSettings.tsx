// Sync Settings Component - Aerospace Grade
// User interface for configuring synchronization

import { useState, useEffect } from 'react';
import { Cloud, Lock, RefreshCw, Check, X, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { syncEngine, SyncConfig } from '../services/sync/sync-engine';
import { syncEncryption } from '../services/sync/encryption';
import { cloudSyncService, CloudProviderType } from '../services/sync/cloud-providers';
import { log } from '../utils/logger';

interface SyncSettingsProps {
  onClose: () => void;
}

export default function SyncSettings({ onClose }: SyncSettingsProps) {
  const [config, setConfig] = useState<SyncConfig>({
    enabled: false,
    autoSync: true,
    syncInterval: 60000,
    encryptionEnabled: true
  });

  const [provider, setProvider] = useState<CloudProviderType | null>(null);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const status = syncEngine.getStatus();
    setConfig(status.config);
  }, []);

  const handleEnableSync = async () => {
    if (!config.enabled) {
      // Enable sync
      if (config.encryptionEnabled && !encryptionPassword) {
        setSyncStatus('Please enter encryption password');
        return;
      }

      try {
        if (config.encryptionEnabled) {
          await syncEncryption.initialize(encryptionPassword);
        }

        syncEngine.updateConfig({ ...config, enabled: true });
        setConfig({ ...config, enabled: true });
        setSyncStatus('Sync enabled successfully');
        log.info('[SyncSettings] Sync enabled');
      } catch (error) {
        setSyncStatus('Failed to enable sync: ' + (error instanceof Error ? error.message : String(error)));
        log.error('[SyncSettings] Failed to enable sync:', error);
      }
    } else {
      // Disable sync
      syncEngine.updateConfig({ ...config, enabled: false });
      setConfig({ ...config, enabled: false });
      setSyncStatus('Sync disabled');
      log.info('[SyncSettings] Sync disabled');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing...');

    try {
      const result = await syncEngine.sync();
      setSyncStatus(
        `Sync complete: ${result.uploaded} uploaded, ${result.downloaded} downloaded, ${result.deleted} deleted, ${result.conflicts} conflicts`
      );
      log.info('[SyncSettings] Manual sync completed:', result);
    } catch (error) {
      setSyncStatus('Sync failed: ' + (error instanceof Error ? error.message : String(error)));
      log.error('[SyncSettings] Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProviderChange = async (newProvider: CloudProviderType) => {
    try {
      // TODO: Get provider config from user
      const config = {};
      await cloudSyncService.setupProvider(newProvider, config);
      setProvider(newProvider);
      setSyncStatus(`Connected to ${newProvider}`);
      log.info('[SyncSettings] Provider changed:', newProvider);
    } catch (error) {
      setSyncStatus('Failed to connect: ' + (error instanceof Error ? error.message : String(error)));
      log.error('[SyncSettings] Failed to change provider:', error);
    }
  };

  const handleConfigChange = (key: keyof SyncConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    syncEngine.updateConfig(newConfig);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Sync Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Enable/Disable Sync */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Enable Synchronization</h3>
                <p className="text-sm text-foreground/60">Sync your notes across devices</p>
              </div>
              <button
                onClick={handleEnableSync}
                className={`px-4 py-2 rounded transition-colors ${
                  config.enabled
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {config.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Cloud Provider Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold">Cloud Provider</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['icloud', 'gdrive', 'dropbox', 'onedrive', 'webdav', 's3'] as CloudProviderType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handleProviderChange(p)}
                  className={`p-3 border rounded transition-colors ${
                    provider === p
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    <span className="text-sm capitalize">{p}</span>
                    {provider === p && <Check className="w-4 h-4 ml-auto text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Encryption Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">End-to-End Encryption</h3>
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.encryptionEnabled}
                onChange={(e) => handleConfigChange('encryptionEnabled', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Enable encryption (recommended)</span>
            </label>

            {config.encryptionEnabled && (
              <div className="space-y-2">
                <label className="block text-sm text-foreground/60">
                  Encryption Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                    placeholder="Enter a strong password"
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-foreground/40">
                  ⚠️ Important: This password cannot be recovered. Keep it safe!
                </p>
              </div>
            )}
          </div>

          {/* Auto Sync Settings */}
          <div className="space-y-3">
            <h3 className="font-semibold">Auto Sync</h3>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.autoSync}
                onChange={(e) => handleConfigChange('autoSync', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Enable automatic sync</span>
            </label>

            {config.autoSync && (
              <div className="space-y-2">
                <label className="block text-sm text-foreground/60">
                  Sync Interval (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.syncInterval / 60000}
                  onChange={(e) => handleConfigChange('syncInterval', parseInt(e.target.value) * 60000)}
                  className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {/* Manual Sync Button */}
          <div className="space-y-3">
            <button
              onClick={handleManualSync}
              disabled={!config.enabled || isSyncing}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Status Message */}
          {syncStatus && (
            <div className={`p-3 rounded flex items-start gap-2 ${
              syncStatus.includes('failed') || syncStatus.includes('Failed')
                ? 'bg-red-500/10 text-red-500'
                : syncStatus.includes('complete') || syncStatus.includes('success')
                ? 'bg-green-500/10 text-green-500'
                : 'bg-blue-500/10 text-blue-500'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{syncStatus}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-secondary/30 rounded border border-border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              About Sync
            </h4>
            <ul className="text-sm text-foreground/60 space-y-1">
              <li>• Your data is encrypted before leaving your device</li>
              <li>• Conflicts are automatically resolved when possible</li>
              <li>• Conflict copies are created when needed</li>
              <li>• Sync works offline - changes queue until connected</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
