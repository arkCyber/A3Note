import { useState } from "react";
import { Search, X, FileText, Loader2 } from "lucide-react";
import { SearchResult, FileItem } from "../types";

interface SearchPanelProps {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onResultClick: (file: FileItem) => void;
  onClose: () => void;
}

export default function SearchPanel({
  query: initialQuery,
  results,
  isSearching,
  onSearch,
  onResultClick,
  onClose,
}: SearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleResultClick = (result: SearchResult) => {
    const file: FileItem = {
      path: result.path,
      name: result.path.split("/").pop() || "",
      isDirectory: false,
    };
    onResultClick(file);
  };

  return (
    <div className="w-96 bg-secondary border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Search</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-background rounded transition-colors"
          title="Close search"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSearch} className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in files..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary text-sm"
            autoFocus
          />
        </div>
      </form>

      <div className="flex-1 overflow-y-auto p-2">
        {isSearching ? (
          <div className="flex items-center justify-center py-8 text-foreground/50">
            <Loader2 className="animate-spin mr-2" size={16} />
            <span className="text-sm">Searching...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-foreground/50 text-sm">
            {query ? "No results found" : "Enter a search query"}
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((result, index) => (
              <div
                key={`${result.path}-${index}`}
                onClick={() => handleResultClick(result)}
                className="p-3 hover:bg-background rounded cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-2">
                  <FileText size={14} className="text-accent mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {result.path.split("/").pop()}
                    </div>
                    <div className="text-xs text-foreground/50 mt-1">
                      Line {result.line}
                    </div>
                    <div className="text-xs text-foreground/70 mt-1 line-clamp-2">
                      {result.snippet}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
