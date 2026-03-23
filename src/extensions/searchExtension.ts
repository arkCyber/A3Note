import { EditorView } from "@codemirror/view";
import { SearchQuery, search, highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { keymap } from "@codemirror/view";
import { log } from "../utils/logger";

/**
 * Enhanced search and replace extension
 * Provides advanced search features beyond basic CodeMirror search
 */

/**
 * Search options
 */
export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regexp?: boolean;
  preserveCase?: boolean;
}

/**
 * Create search query with options
 */
export function createSearchQuery(
  searchText: string,
  options: SearchOptions = {}
): SearchQuery {
  return new SearchQuery({
    search: searchText,
    caseSensitive: options.caseSensitive || false,
    regexp: options.regexp || false,
    wholeWord: options.wholeWord || false,
  });
}

/**
 * Replace all occurrences
 */
export function replaceAll(
  view: EditorView,
  searchText: string,
  replaceText: string,
  options: SearchOptions = {}
): number {
  const query = createSearchQuery(searchText, options);
  const doc = view.state.doc;
  const changes: { from: number; to: number; insert: string }[] = [];
  
  let count = 0;
  let pos = 0;

  while (pos < doc.length) {
    const result = query.nextMatch(view.state, pos, doc.length);
    if (!result) break;

    const matchText = doc.sliceString(result.from, result.to);
    let replacement = replaceText;

    // Preserve case if option is enabled
    if (options.preserveCase) {
      replacement = preserveCase(matchText, replaceText);
    }

    changes.push({
      from: result.from,
      to: result.to,
      insert: replacement,
    });

    count++;
    pos = result.to;
  }

  if (changes.length > 0) {
    view.dispatch({ changes });
    log.info("SearchExtension", `Replaced ${count} occurrences`);
  }

  return count;
}

/**
 * Replace next occurrence
 */
export function replaceNext(
  view: EditorView,
  searchText: string,
  replaceText: string,
  options: SearchOptions = {}
): boolean {
  const query = createSearchQuery(searchText, options);
  const cursor = view.state.selection.main.head;
  const result = query.nextMatch(view.state, cursor, view.state.doc.length);

  if (result) {
    const matchText = view.state.doc.sliceString(result.from, result.to);
    let replacement = replaceText;

    if (options.preserveCase) {
      replacement = preserveCase(matchText, replaceText);
    }

    view.dispatch({
      changes: { from: result.from, to: result.to, insert: replacement },
      selection: { anchor: result.from + replacement.length },
    });

    log.info("SearchExtension", "Replaced next occurrence");
    return true;
  }

  return false;
}

/**
 * Preserve case when replacing
 */
function preserveCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (original === original.toLowerCase()) {
    return replacement.toLowerCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1).toLowerCase();
  }
  return replacement;
}

/**
 * Find all matches and return positions
 */
export function findAll(
  view: EditorView,
  searchText: string,
  options: SearchOptions = {}
): Array<{ from: number; to: number; text: string }> {
  const query = createSearchQuery(searchText, options);
  const doc = view.state.doc;
  const matches: Array<{ from: number; to: number; text: string }> = [];
  
  let pos = 0;
  while (pos < doc.length) {
    const result = query.nextMatch(view.state, pos, doc.length);
    if (!result) break;

    matches.push({
      from: result.from,
      to: result.to,
      text: doc.sliceString(result.from, result.to),
    });

    pos = result.to;
  }

  return matches;
}

/**
 * Search in selection only
 */
export function searchInSelection(
  view: EditorView,
  searchText: string,
  options: SearchOptions = {}
): Array<{ from: number; to: number; text: string }> {
  const query = createSearchQuery(searchText, options);
  const selection = view.state.selection.main;
  const matches: Array<{ from: number; to: number; text: string }> = [];
  
  let pos = selection.from;
  while (pos < selection.to) {
    const result = query.nextMatch(view.state, pos, selection.to);
    if (!result) break;

    matches.push({
      from: result.from,
      to: result.to,
      text: view.state.doc.sliceString(result.from, result.to),
    });

    pos = result.to;
  }

  return matches;
}

/**
 * Enhanced search extension with custom keybindings
 */
export const enhancedSearchExtension = [
  search({
    top: true,
  }),
  highlightSelectionMatches(),
  keymap.of([
    ...searchKeymap,
    {
      key: "Mod-h",
      run: (view) => {
        // Open search and replace panel
        log.info("SearchExtension", "Search and replace triggered");
        return true;
      },
    },
  ]),
];

/**
 * Search theme
 */
export const searchTheme = EditorView.baseTheme({
  ".cm-searchMatch": {
    backgroundColor: "rgba(255, 235, 59, 0.3)",
    outline: "1px solid rgba(255, 235, 59, 0.5)",
  },
  ".cm-searchMatch-selected": {
    backgroundColor: "rgba(255, 152, 0, 0.4)",
    outline: "1px solid rgba(255, 152, 0, 0.7)",
  },
  ".cm-panel.cm-search": {
    backgroundColor: "#2d2d2d",
    border: "1px solid #3a3a3a",
    padding: "8px",
  },
  ".cm-panel.cm-search input": {
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    border: "1px solid #3a3a3a",
    padding: "4px 8px",
    borderRadius: "3px",
  },
  ".cm-panel.cm-search input:focus": {
    outline: "none",
    borderColor: "#4fc3f7",
  },
  ".cm-panel.cm-search button": {
    backgroundColor: "#4fc3f7",
    color: "#1e1e1e",
    border: "none",
    padding: "4px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: "600",
  },
  ".cm-panel.cm-search button:hover": {
    backgroundColor: "#6fd4ff",
  },
});
