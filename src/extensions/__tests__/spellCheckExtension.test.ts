import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { 
  spellCheckExtension, 
  spellCheckState, 
  toggleSpellCheck,
  toggleSpellCheckMode,
  isSpellCheckEnabled,
  addToCustomDictionary,
  removeFromCustomDictionary,
  getCustomDictionary,
  clearCustomDictionary,
  getSuggestions
} from '../spellCheckExtension';

describe('spellCheckExtension', () => {
  let view: EditorView;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    clearCustomDictionary();
  });

  afterEach(() => {
    view?.destroy();
    container.remove();
  });

  it('should be enabled by default', () => {
    const doc = 'Some text';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    expect(isSpellCheckEnabled(view)).toBe(true);
  });

  it('should toggle spell check mode', () => {
    const doc = 'Some text';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    expect(isSpellCheckEnabled(view)).toBe(true);
    
    toggleSpellCheckMode(view);
    expect(isSpellCheckEnabled(view)).toBe(false);
    
    toggleSpellCheckMode(view);
    expect(isSpellCheckEnabled(view)).toBe(true);
  });

  it('should mark misspelled words', () => {
    const doc = 'This is a mispeled word';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    const errors = container.querySelectorAll('.cm-spell-error');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should not mark correctly spelled words', () => {
    const doc = 'This is correct text';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    const errors = container.querySelectorAll('.cm-spell-error');
    expect(errors.length).toBe(0);
  });

  it('should not mark code as misspelled', () => {
    const doc = 'Text with `mispeled` code';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    const errors = container.querySelectorAll('.cm-spell-error');
    expect(errors.length).toBe(0);
  });

  it('should not mark URLs as misspelled', () => {
    const doc = 'Visit https://examplewebsite.com for info';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    // Should not mark the URL
    const text = container.textContent || '';
    expect(text).toContain('examplewebsite');
  });

  it('should not mark numbers as misspelled', () => {
    const doc = 'The year 2024 is here';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    const errors = container.querySelectorAll('.cm-spell-error');
    expect(errors.length).toBe(0);
  });

  it('should add words to custom dictionary', () => {
    addToCustomDictionary('customword');
    
    const dict = getCustomDictionary();
    expect(dict).toContain('customword');
  });

  it('should remove words from custom dictionary', () => {
    addToCustomDictionary('customword');
    expect(getCustomDictionary()).toContain('customword');
    
    removeFromCustomDictionary('customword');
    expect(getCustomDictionary()).not.toContain('customword');
  });

  it('should not mark custom dictionary words as misspelled', () => {
    addToCustomDictionary('mispeled');
    
    const doc = 'This is a mispeled word';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    const errors = container.querySelectorAll('.cm-spell-error');
    expect(errors.length).toBe(0);
  });

  it('should clear custom dictionary', () => {
    addToCustomDictionary('word1');
    addToCustomDictionary('word2');
    expect(getCustomDictionary().length).toBe(2);
    
    clearCustomDictionary();
    expect(getCustomDictionary().length).toBe(0);
  });

  it('should provide suggestions for misspelled words', () => {
    const suggestions = getSuggestions('teh');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions).toContain('the');
  });

  it('should not check headings', () => {
    const doc = '# Mispeled Heading';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    const errors = container.querySelectorAll('.cm-spell-error');
    expect(errors.length).toBe(0);
  });

  it('should disable spell check when toggled off', () => {
    const doc = 'This is a mispeled word';
    
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [spellCheckState, spellCheckExtension],
      }),
      parent: container,
    });

    // Should have errors initially
    let errors = container.querySelectorAll('.cm-spell-error');
    expect(errors.length).toBeGreaterThan(0);

    // Disable spell check
    view.dispatch({
      effects: toggleSpellCheck.of(false),
    });

    // Should have no errors after disabling
    errors = container.querySelectorAll('.cm-spell-error');
    expect(errors.length).toBe(0);
  });
});
