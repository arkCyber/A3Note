import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Range, StateField, StateEffect } from "@codemirror/state";
import { log } from "../utils/logger";

/**
 * Spell Check Extension
 * Provides spell checking functionality for the editor
 */

// Common English words dictionary (simplified - in production, use a full dictionary)
const commonWords = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their",
  "what", "so", "up", "out", "if", "about", "who", "get", "which", "go",
  "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could", "them",
  "see", "other", "than", "then", "now", "look", "only", "come", "its", "over",
  "think", "also", "back", "after", "use", "two", "how", "our", "work", "first",
  "well", "way", "even", "new", "want", "because", "any", "these", "give", "day",
  "most", "us", "is", "was", "are", "been", "has", "had", "were", "said", "did",
  "markdown", "obsidian", "editor", "code", "text", "file", "note", "link",
]);

// Custom dictionary for user-added words
const customDictionary = new Set<string>();

// State effect to toggle spell check
export const toggleSpellCheck = StateEffect.define<boolean>();

// State field to track spell check mode
export const spellCheckState = StateField.define<boolean>({
  create: () => true, // Enabled by default
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(toggleSpellCheck)) {
        return effect.value;
      }
    }
    return value;
  },
});

/**
 * Check if a word is spelled correctly
 */
function isWordCorrect(word: string): boolean {
  const lower = word.toLowerCase();
  
  // Check common dictionary
  if (commonWords.has(lower)) return true;
  
  // Check custom dictionary
  if (customDictionary.has(lower)) return true;
  
  // Check if it's a number
  if (/^\d+$/.test(word)) return true;
  
  // Check if it's a URL or email
  if (/^(https?:\/\/|www\.|[\w.-]+@)/.test(word)) return true;
  
  // Check if it's a code identifier (camelCase, snake_case, etc.)
  if (/^[a-z][a-zA-Z0-9_]*$/.test(word) || /^[A-Z][a-zA-Z0-9]*$/.test(word)) return true;
  
  // Check if it's all caps (likely an acronym)
  if (word === word.toUpperCase() && word.length > 1) return true;
  
  return false;
}

/**
 * Extract words from text, excluding code and special syntax
 */
function extractWords(text: string): Array<{ word: string; start: number; end: number }> {
  const words: Array<{ word: string; start: number; end: number }> = [];
  
  // Skip code blocks, inline code, links, etc.
  const skipPatterns = [
    /`[^`]+`/g,           // Inline code
    /\[([^\]]+)\]\([^)]+\)/g,  // Links
    /!\[([^\]]+)\]\([^)]+\)/g, // Images
    /\[\^[^\]]+\]/g,      // Footnotes
    /\$[^$]+\$/g,         // Inline math
    /\$\$[\s\S]+?\$\$/g,  // Display math
  ];
  
  let cleanText = text;
  for (const pattern of skipPatterns) {
    cleanText = cleanText.replace(pattern, (match) => " ".repeat(match.length));
  }
  
  // Extract words
  const wordRegex = /\b[a-zA-Z][a-zA-Z']*\b/g;
  let match;
  
  while ((match = wordRegex.exec(cleanText)) !== null) {
    words.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  
  return words;
}

/**
 * Spell check extension
 */
export const spellCheckExtension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.state.field(spellCheckState) !== update.startState.field(spellCheckState)) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const decorations: Range<Decoration>[] = [];
      const doc = view.state.doc;
      const enabled = view.state.field(spellCheckState);

      if (!enabled) {
        return Decoration.set(decorations);
      }

      for (const { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to;) {
          const line = doc.lineAt(pos);
          const text = line.text;

          // Skip headings, code blocks, and other special lines
          if (text.match(/^#{1,6}\s/) || text.match(/^```/) || text.match(/^\s*[-*+]\s\[[ xX]\]/) || text.match(/^>\s*\[!/)) {
            pos = line.to + 1;
            continue;
          }

          // Extract and check words
          const words = extractWords(text);
          
          for (const { word, start, end } of words) {
            if (!isWordCorrect(word)) {
              const wordStart = line.from + start;
              const wordEnd = line.from + end;

              decorations.push(
                Decoration.mark({
                  class: "cm-spell-error",
                  attributes: {
                    title: `Possible spelling error: "${word}"`,
                  },
                }).range(wordStart, wordEnd)
              );
            }
          }

          pos = line.to + 1;
        }
      }

      return Decoration.set(decorations, true);
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

/**
 * Spell check theme
 */
export const spellCheckTheme = EditorView.baseTheme({
  ".cm-spell-error": {
    textDecoration: "underline wavy #f44336",
    textDecorationSkipInk: "none",
  },
});

/**
 * Add word to custom dictionary
 */
export function addToCustomDictionary(word: string): void {
  customDictionary.add(word.toLowerCase());
  log.info("SpellCheck", `Added "${word}" to custom dictionary`);
}

/**
 * Remove word from custom dictionary
 */
export function removeFromCustomDictionary(word: string): void {
  customDictionary.delete(word.toLowerCase());
  log.info("SpellCheck", `Removed "${word}" from custom dictionary`);
}

/**
 * Get custom dictionary words
 */
export function getCustomDictionary(): string[] {
  return Array.from(customDictionary);
}

/**
 * Clear custom dictionary
 */
export function clearCustomDictionary(): void {
  customDictionary.clear();
  log.info("SpellCheck", "Cleared custom dictionary");
}

/**
 * Toggle spell check mode
 */
export function toggleSpellCheckMode(view: EditorView): void {
  const current = view.state.field(spellCheckState);
  view.dispatch({
    effects: toggleSpellCheck.of(!current),
  });
  log.info("SpellCheck", `Spell check ${!current ? "enabled" : "disabled"}`);
}

/**
 * Check if spell check is enabled
 */
export function isSpellCheckEnabled(view: EditorView): boolean {
  return view.state.field(spellCheckState);
}

/**
 * Get suggestions for a misspelled word (simple implementation)
 */
export function getSuggestions(word: string): string[] {
  const suggestions: string[] = [];
  const lower = word.toLowerCase();
  
  // Find similar words in dictionary
  for (const dictWord of commonWords) {
    if (dictWord.startsWith(lower.slice(0, 2))) {
      suggestions.push(dictWord);
      if (suggestions.length >= 5) break;
    }
  }
  
  return suggestions;
}
