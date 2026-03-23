import { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { handleFileDrop, UploadOptions, UploadResult } from '../utils/fileUpload';
import { log } from '../utils/logger';

interface MediaUploadZoneProps {
  workspacePath: string;
  onUploadComplete: (syntax: string[]) => void;
  onClose: () => void;
}

interface UploadProgress {
  current: number;
  total: number;
  fileName?: string;
}

export default function MediaUploadZone({
  workspacePath,
  onUploadComplete,
  onClose,
}: MediaUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    dragCounter.current = 0;
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    setIsUploading(true);
    setShowResults(false);
    
    log.info('MediaUploadZone', `Dropped ${files.length} files`);
    
    const options: UploadOptions = {
      workspacePath,
      targetFolder: 'attachments',
      generateUniqueName: true,
    };
    
    try {
      const { results: uploadResults, syntaxList } = await handleFileDrop(
        files,
        options,
        (current, total) => {
          setProgress({ current, total });
        }
      );
      
      setResults(uploadResults);
      setShowResults(true);
      
      const successfulSyntax = syntaxList.filter((_, i) => uploadResults[i].success);
      
      if (successfulSyntax.length > 0) {
        onUploadComplete(successfulSyntax);
      }
      
      log.info('MediaUploadZone', `Upload completed: ${successfulSyntax.length}/${uploadResults.length} successful`);
    } catch (error) {
      log.error('MediaUploadZone', 'Upload failed:', error as Error);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }, [workspacePath, onUploadComplete]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setShowResults(false);
    
    const options: UploadOptions = {
      workspacePath,
      targetFolder: 'attachments',
      generateUniqueName: true,
    };
    
    try {
      const { results: uploadResults, syntaxList } = await handleFileDrop(
        files,
        options,
        (current, total) => {
          setProgress({ current, total });
        }
      );
      
      setResults(uploadResults);
      setShowResults(true);
      
      const successfulSyntax = syntaxList.filter((_, i) => uploadResults[i].success);
      
      if (successfulSyntax.length > 0) {
        onUploadComplete(successfulSyntax);
      }
    } catch (error) {
      log.error('MediaUploadZone', 'Upload failed:', error as Error);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }, [workspacePath, onUploadComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Media Files
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        <div
          className={`p-8 m-4 border-2 border-dashed rounded-lg transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            {isUploading ? (
              <>
                <Loader className="w-12 h-12 text-primary animate-spin" />
                {progress && (
                  <div className="text-center">
                    <p className="text-sm text-muted">
                      Uploading {progress.current} of {progress.total} files...
                    </p>
                    <div className="w-64 h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted" />
                <div className="text-center">
                  <p className="text-lg font-medium">
                    {isDragging ? 'Drop files here' : 'Drag and drop media files'}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="px-4 py-2 bg-primary text-background rounded cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  Browse Files
                </label>
                <p className="text-xs text-muted">
                  Supported: Images, Videos, Audio (Max 100MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Results */}
        {showResults && results.length > 0 && (
          <div className="p-4 border-t border-border max-h-64 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-2">Upload Results</h4>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded text-sm ${
                    result.success
                      ? 'bg-success/10 text-success'
                      : 'bg-error/10 text-error'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate">
                    {result.success ? result.path : result.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
