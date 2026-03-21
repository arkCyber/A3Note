import { useState, useCallback } from "react";
import { tauriApi } from "../api/tauri";
import { SearchResult } from "../types";

interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
}

export function useSearch(workspacePath: string | null) {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    isSearching: false,
    error: null,
  });

  const search = useCallback(
    async (query: string) => {
      if (!workspacePath || !query.trim()) {
        setState({ query, results: [], isSearching: false, error: null });
        return;
      }

      setState((prev) => ({ ...prev, query, isSearching: true, error: null }));

      try {
        const results = await tauriApi.searchFiles(workspacePath, query);
        setState({ query, results, isSearching: false, error: null });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isSearching: false,
          error: error instanceof Error ? error.message : "Search failed",
        }));
      }
    },
    [workspacePath]
  );

  const clearSearch = useCallback(() => {
    setState({ query: "", results: [], isSearching: false, error: null });
  }, []);

  return {
    query: state.query,
    results: state.results,
    isSearching: state.isSearching,
    error: state.error,
    search,
    clearSearch,
  };
}
