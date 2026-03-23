/**
 * Editor Extensions Manager
 * Dynamically manages CodeMirror extensions based on settings
 */

import { Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { AppSettings } from '../hooks/useSettings';
import { log } from './logger';

/**
 * Build editor extensions based on settings
 */
export function buildEditorExtensions(settings: AppSettings): Extension[] {
  const extensions: Extension[] = [];

  // Line numbers
  if (settings.lineNumbers) {
    extensions.push(EditorView.lineNumbers);
  }

  // Word wrap
  if (settings.wordWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  // Tab size
  extensions.push(
    EditorView.theme({
      '.cm-content': {
        tabSize: settings.tabSize.toString(),
      },
    })
  );

  // Auto pair brackets
  if (settings.autoPairBrackets) {
    extensions.push(closeBrackets());
    extensions.push(keymap.of(closeBracketsKeymap));
  }

  // Indent guides (visual indentation)
  if (settings.showIndentGuides) {
    extensions.push(
      EditorView.theme({
        '.cm-line': {
          position: 'relative',
        },
      })
    );
  }

  // Spell check
  if (settings.spellCheck) {
    extensions.push(
      EditorView.contentAttributes.of({
        spellcheck: 'true',
      })
    );
  }

  // Tab key handling
  extensions.push(keymap.of([indentWithTab]));

  log.info('[EditorExtensions] Built extensions with settings:', {
    lineNumbers: settings.lineNumbers,
    wordWrap: settings.wordWrap,
    tabSize: settings.tabSize,
    autoPairBrackets: settings.autoPairBrackets,
    showIndentGuides: settings.showIndentGuides,
    spellCheck: settings.spellCheck,
  });

  return extensions;
}

/**
 * Get font size CSS
 */
export function getFontSizeCSS(fontSize: number): Extension {
  return EditorView.theme({
    '.cm-content': {
      fontSize: `${fontSize}px`,
    },
    '.cm-gutters': {
      fontSize: `${fontSize}px`,
    },
  });
}

/**
 * Get view mode configuration
 */
export function getViewModeConfig(viewMode: 'source' | 'live-preview' | 'reading'): {
  editable: boolean;
  lineWrapping: boolean;
} {
  switch (viewMode) {
    case 'source':
      return { editable: true, lineWrapping: false };
    case 'live-preview':
      return { editable: true, lineWrapping: true };
    case 'reading':
      return { editable: false, lineWrapping: true };
    default:
      return { editable: true, lineWrapping: true };
  }
}

/**
 * Create frontmatter visibility extension
 */
export function createFrontmatterExtension(show: boolean): Extension {
  if (show) {
    return [];
  }

  // Hide frontmatter (YAML between ---) 
  return EditorView.theme({
    '.cm-line:has(> .cm-meta)': {
      display: show ? 'block' : 'none',
    },
  });
}

/**
 * Create auto-pair Markdown extension
 */
export function createMarkdownAutoPairExtension(enabled: boolean): Extension {
  if (!enabled) {
    return [];
  }

  // Auto-pair common Markdown syntax
  return EditorView.inputHandler.of((view, from, to, text) => {
    if (text === '*') {
      const before = view.state.doc.sliceString(Math.max(0, from - 1), from);
      if (before === '*') {
        // Already have one *, complete to **
        view.dispatch({
          changes: { from, to, insert: '**' },
          selection: { anchor: from + 1 },
        });
        return true;
      }
    }
    return false;
  });
}
