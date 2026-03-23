import { useState } from 'react';
import { X, FileDown, Loader2 } from 'lucide-react';
import { ExportFormat, ExportOptions } from '../services/export';

/**
 * Export Dialog Component
 * Provides UI for configuring and executing file exports
 */

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  defaultFilename?: string;
  isExporting?: boolean;
}

export default function ExportDialog({
  isOpen,
  onClose,
  onExport,
  defaultFilename = 'document',
  isExporting = false,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [filename, setFilename] = useState(defaultFilename);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeTOC, setIncludeTOC] = useState(false);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [cssTheme, setCssTheme] = useState<'light' | 'dark' | 'auto'>('light');

  if (!isOpen) return null;

  const handleExport = async () => {
    const options: ExportOptions = {
      format,
      filename,
      includeImages,
      includeTOC,
      pageSize,
      cssTheme,
    };

    await onExport(options);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-secondary border border-border rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Export Document</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background rounded transition-colors"
            disabled={isExporting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  disabled={isExporting}
                  className="cursor-pointer"
                />
                <span>PDF Document</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="html"
                  checked={format === 'html'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  disabled={isExporting}
                  className="cursor-pointer"
                />
                <span>HTML Page</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="markdown"
                  checked={format === 'markdown'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  disabled={isExporting}
                  className="cursor-pointer"
                />
                <span>Markdown File</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="docx"
                  checked={format === 'docx'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  disabled={isExporting}
                  className="cursor-pointer"
                />
                <span>Word Document (.docx)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="pptx"
                  checked={format === 'pptx'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  disabled={isExporting}
                  className="cursor-pointer"
                />
                <span>PowerPoint (.pptx)</span>
              </label>
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="block text-sm font-medium mb-2">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              disabled={isExporting}
              className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="document"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium mb-2">Options</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  disabled={isExporting}
                  className="cursor-pointer"
                />
                <span className="text-sm">Include images</span>
              </label>
              
              {format === 'pdf' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTOC}
                    onChange={(e) => setIncludeTOC(e.target.checked)}
                    disabled={isExporting}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">Include table of contents</span>
                </label>
              )}
            </div>
          </div>

          {/* PDF Options */}
          {format === 'pdf' && (
            <div>
              <label className="block text-sm font-medium mb-2">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter')}
                disabled={isExporting}
                className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
          )}

          {/* HTML Options */}
          {format === 'html' && (
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={cssTheme}
                onChange={(e) => setCssTheme(e.target.value as 'light' | 'dark' | 'auto')}
                disabled={isExporting}
                className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm hover:bg-background rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileDown size={16} />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
