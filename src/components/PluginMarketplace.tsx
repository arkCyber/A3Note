/**
 * Plugin Marketplace Component
 * Browse, search, and install Obsidian-compatible plugins
 */

import { useState, useEffect } from 'react';
import { X, Search, Download, Check, Star, ExternalLink } from 'lucide-react';
import { app } from '../plugins/api/App';

interface MarketplacePlugin {
  id: string;
  name: string;
  author: string;
  description: string;
  version: string;
  downloads: number;
  rating: number;
  tags: string[];
  repo: string;
  installed: boolean;
  enabled: boolean;
}

interface PluginMarketplaceProps {
  onClose: () => void;
}

// Mock plugin data - in real implementation, this would come from an API
const MOCK_PLUGINS: MarketplacePlugin[] = [
  {
    id: 'calendar',
    name: 'Calendar',
    author: 'Liam Cain',
    description: 'Simple calendar widget for daily notes',
    version: '1.5.10',
    downloads: 125000,
    rating: 4.8,
    tags: ['productivity', 'calendar', 'daily-notes'],
    repo: 'https://github.com/liamcain/obsidian-calendar-plugin',
    installed: false,
    enabled: false,
  },
  {
    id: 'dataview',
    name: 'Dataview',
    author: 'Michael Brenan',
    description: 'Complex data views for your notes',
    version: '0.5.55',
    downloads: 250000,
    rating: 4.9,
    tags: ['data', 'query', 'advanced'],
    repo: 'https://github.com/blacksmithgu/obsidian-dataview',
    installed: false,
    enabled: false,
  },
  {
    id: 'templater',
    name: 'Templater',
    author: 'SilentVoid',
    description: 'Create and use templates in your notes',
    version: '1.16.0',
    downloads: 180000,
    rating: 4.7,
    tags: ['templates', 'productivity'],
    repo: 'https://github.com/SilentVoid13/Templater',
    installed: false,
    enabled: false,
  },
  {
    id: 'kanban',
    name: 'Kanban',
    author: 'mgmeyers',
    description: 'Create markdown-backed Kanban boards',
    version: '1.5.3',
    downloads: 95000,
    rating: 4.6,
    tags: ['kanban', 'project-management', 'productivity'],
    repo: 'https://github.com/mgmeyers/obsidian-kanban',
    installed: false,
    enabled: false,
  },
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    author: 'Zsolt Viczian',
    description: 'Draw diagrams and sketches',
    version: '1.9.19',
    downloads: 150000,
    rating: 4.9,
    tags: ['drawing', 'diagrams', 'visual'],
    repo: 'https://github.com/zsviczian/obsidian-excalidraw-plugin',
    installed: false,
    enabled: false,
  },
  {
    id: 'advanced-tables',
    name: 'Advanced Tables',
    author: 'Tony Grosinger',
    description: 'Improved table navigation and formatting',
    version: '0.18.1',
    downloads: 110000,
    rating: 4.5,
    tags: ['tables', 'markdown', 'formatting'],
    repo: 'https://github.com/tgrosinger/advanced-tables-obsidian',
    installed: false,
    enabled: false,
  },
];

export default function PluginMarketplace({ onClose }: PluginMarketplaceProps) {
  const [plugins, setPlugins] = useState<MarketplacePlugin[]>(MOCK_PLUGINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'name'>('downloads');
  const [installing, setInstalling] = useState<string | null>(null);

  // Update installed status from plugin manager
  useEffect(() => {
    updateInstalledStatus();
  }, []);

  const updateInstalledStatus = () => {
    const installedPlugins = app.plugins.getAllPlugins();
    setPlugins(prev => prev.map(plugin => {
      const installed = installedPlugins.find(p => p.manifest.id === plugin.id);
      return {
        ...plugin,
        installed: !!installed,
        enabled: installed?.enabled || false,
      };
    }));
  };

  const filteredPlugins = plugins
    .filter(plugin => {
      const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plugin.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || plugin.tags.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') {
        return b.downloads - a.downloads;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return a.name.localeCompare(b.name);
    });

  const categories = ['all', ...Array.from(new Set(plugins.flatMap(p => p.tags)))];

  const handleInstall = async (plugin: MarketplacePlugin) => {
    setInstalling(plugin.id);
    
    try {
      // Simulate plugin installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would:
      // 1. Download plugin files from repo
      // 2. Validate plugin manifest
      // 3. Register plugin with PluginManager
      // 4. Enable plugin if user wants
      
      alert(`Plugin "${plugin.name}" installed successfully!\n\nNote: This is a demo. Real plugin installation would download from GitHub.`);
      
      updateInstalledStatus();
    } catch (error) {
      console.error('Failed to install plugin:', error);
      alert(`Failed to install plugin: ${error}`);
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstall = async (plugin: MarketplacePlugin) => {
    if (!confirm(`Uninstall "${plugin.name}"?`)) {
      return;
    }
    
    try {
      await app.plugins.unloadPlugin(plugin.id);
      updateInstalledStatus();
      alert(`Plugin "${plugin.name}" uninstalled successfully!`);
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      alert(`Failed to uninstall plugin: ${error}`);
    }
  };

  const handleToggle = async (plugin: MarketplacePlugin) => {
    try {
      if (plugin.enabled) {
        await app.plugins.disablePlugin(plugin.id);
      } else {
        await app.plugins.enablePlugin(plugin.id);
      }
      updateInstalledStatus();
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
      alert(`Failed to toggle plugin: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Plugin Marketplace</h2>
            <p className="text-sm text-muted-foreground">Browse and install community plugins</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary"
            >
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Plugin List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlugins.map(plugin => (
              <div
                key={plugin.id}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{plugin.name}</h3>
                    <p className="text-sm text-muted-foreground">by {plugin.author}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span>{plugin.rating}</span>
                  </div>
                </div>

                <p className="text-sm mb-3 line-clamp-2">{plugin.description}</p>

                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <span>v{plugin.version}</span>
                  <span>•</span>
                  <span>{(plugin.downloads / 1000).toFixed(0)}k downloads</span>
                </div>

                <div className="flex gap-2 mb-3 flex-wrap">
                  {plugin.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-accent text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {plugin.installed ? (
                    <>
                      <button
                        onClick={() => handleToggle(plugin)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                          plugin.enabled
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {plugin.enabled ? (
                          <>
                            <Check size={16} className="inline mr-1" />
                            Enabled
                          </>
                        ) : (
                          'Enable'
                        )}
                      </button>
                      <button
                        onClick={() => handleUninstall(plugin)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        Uninstall
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleInstall(plugin)}
                      disabled={installing === plugin.id}
                      className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {installing === plugin.id ? (
                        'Installing...'
                      ) : (
                        <>
                          <Download size={16} className="inline mr-1" />
                          Install
                        </>
                      )}
                    </button>
                  )}
                  <a
                    href={plugin.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-accent rounded transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredPlugins.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No plugins found matching your search.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-background/50">
          <p className="text-sm text-muted-foreground text-center">
            Showing {filteredPlugins.length} of {plugins.length} plugins
          </p>
        </div>
      </div>
    </div>
  );
}
