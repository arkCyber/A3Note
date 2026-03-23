import { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Search, Image, Video, Music, File, RefreshCw, Upload } from 'lucide-react';
import { invoke } from '@tauri-apps/api/tauri';
import { log } from '../utils/logger';

interface MediaFile {
  path: string;
  name: string;
  size: number;
  mediaType: string;
  extension: string;
}

interface MediaManagerProps {
  workspacePath: string;
  onClose: () => void;
  onInsert?: (path: string) => void;
}

export default function MediaManager({ workspacePath, onClose, onInsert }: MediaManagerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      log.info('MediaManager', 'Loading media files');
      
      const filePaths: string[] = await invoke('list_media_files', {
        workspacePath,
        folder: 'attachments',
      });

      const fileInfoPromises = filePaths.map(async (path) => {
        try {
          const info: MediaFile = await invoke('get_media_info', {
            workspacePath,
            relativePath: path,
          });
          return info;
        } catch (error) {
          log.error('MediaManager', `Failed to get info for ${path}:`, error as Error);
          return null;
        }
      });

      const fileInfos = await Promise.all(fileInfoPromises);
      const validFiles = fileInfos.filter((f): f is MediaFile => f !== null);
      
      setFiles(validFiles);
      log.info('MediaManager', `Loaded ${validFiles.length} media files`);
    } catch (error) {
      log.error('MediaManager', 'Failed to load files:', error as Error);
    } finally {
      setLoading(false);
    }
  }, [workspacePath]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDelete = useCallback(async (path: string) => {
    if (!confirm(`Delete ${path}?`)) return;

    try {
      await invoke('delete_media_file', {
        workspacePath,
        relativePath: path,
      });
      
      setFiles(prev => prev.filter(f => f.path !== path));
      log.info('MediaManager', `Deleted: ${path}`);
    } catch (error) {
      log.error('MediaManager', 'Delete failed:', error as Error);
      alert('Failed to delete file');
    }
  }, [workspacePath]);

  const handleInsert = useCallback((file: MediaFile) => {
    const syntax = `![[${file.path}]]`;
    onInsert?.(syntax);
    log.info('MediaManager', `Inserted: ${file.path}`);
  }, [onInsert]);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || file.mediaType === selectedType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const stats = {
    total: files.length,
    images: files.filter(f => f.mediaType === 'image').length,
    videos: files.filter(f => f.mediaType === 'video').length,
    audios: files.filter(f => f.mediaType === 'audio').length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">Media Manager</h3>
            <p className="text-sm text-muted">
              {stats.total} files • {formatSize(stats.totalSize)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFiles}
              className="p-2 hover:bg-secondary rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 p-4 border-b border-border bg-secondary/30">
          <button
            onClick={() => setSelectedType('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              selectedType === 'all' ? 'bg-primary text-background' : 'hover:bg-secondary'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">All ({stats.total})</span>
          </button>
          <button
            onClick={() => setSelectedType('image')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              selectedType === 'image' ? 'bg-primary text-background' : 'hover:bg-secondary'
            }`}
          >
            <Image className="w-4 h-4" />
            <span className="text-sm">Images ({stats.images})</span>
          </button>
          <button
            onClick={() => setSelectedType('video')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              selectedType === 'video' ? 'bg-primary text-background' : 'hover:bg-secondary'
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="text-sm">Videos ({stats.videos})</span>
          </button>
          <button
            onClick={() => setSelectedType('audio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
              selectedType === 'audio' ? 'bg-primary text-background' : 'hover:bg-secondary'
            }`}
          >
            <Music className="w-4 h-4" />
            <span className="text-sm">Audio ({stats.audios})</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 text-muted animate-spin" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted">
              <Upload className="w-12 h-12 mb-2" />
              <p>No media files found</p>
              <p className="text-sm">Upload some files to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  className={`group relative border border-border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer ${
                    selectedFile === file.path ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFile(file.path)}
                  onDoubleClick={() => handleInsert(file)}
                >
                  {/* Preview */}
                  <div className="aspect-square bg-secondary flex items-center justify-center">
                    {file.mediaType === 'image' ? (
                      <img
                        src={`file://${workspacePath}/${file.path}`}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted">
                        {getIcon(file.mediaType)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2 bg-background">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsert(file);
                      }}
                      className="p-1.5 bg-primary text-background rounded hover:bg-primary/90 transition-colors"
                      title="Insert"
                    >
                      <Upload className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.path);
                      }}
                      className="p-1.5 bg-error text-white rounded hover:bg-error/90 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} shown
          </p>
          {selectedFile && (
            <button
              onClick={() => {
                const file = files.find(f => f.path === selectedFile);
                if (file) handleInsert(file);
              }}
              className="px-4 py-2 bg-primary text-background rounded hover:bg-primary/90 transition-colors"
            >
              Insert Selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
