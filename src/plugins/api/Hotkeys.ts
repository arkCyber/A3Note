/**
 * Hotkeys API - Obsidian Compatible
 * Aerospace-grade keyboard shortcut management
 */

import { Events } from './Events';
import { log } from '../../utils/logger';

export interface Hotkey {
  modifiers: string[];
  key: string;
}

export interface HotkeyCommand {
  id: string;
  name: string;
  hotkeys: Hotkey[];
  callback: () => void;
}

/**
 * Hotkeys manager
 */
export class Hotkeys extends Events {
  private commands: Map<string, HotkeyCommand> = new Map();
  private hotkeyMap: Map<string, string> = new Map();
  private customHotkeys: Map<string, Hotkey[]> = new Map();

  constructor() {
    super();
    this.setupGlobalListener();
  }

  /**
   * Register a hotkey
   */
  registerHotkey(
    commandId: string,
    hotkey: Hotkey,
    callback: () => void
  ): void {
    const command = this.commands.get(commandId);
    if (command) {
      command.hotkeys.push(hotkey);
      command.callback = callback;
    } else {
      this.commands.set(commandId, {
        id: commandId,
        name: commandId,
        hotkeys: [hotkey],
        callback,
      });
    }

    const hotkeyString = this.hotkeyToString(hotkey);
    this.hotkeyMap.set(hotkeyString, commandId);

    log.debug('Hotkeys', `Registered hotkey: ${hotkeyString} -> ${commandId}`);
  }

  /**
   * Unregister a hotkey
   */
  unregisterHotkey(commandId: string, hotkey: Hotkey): void {
    const command = this.commands.get(commandId);
    if (command) {
      command.hotkeys = command.hotkeys.filter(
        h => this.hotkeyToString(h) !== this.hotkeyToString(hotkey)
      );

      if (command.hotkeys.length === 0) {
        this.commands.delete(commandId);
      }
    }

    const hotkeyString = this.hotkeyToString(hotkey);
    this.hotkeyMap.delete(hotkeyString);

    log.debug('Hotkeys', `Unregistered hotkey: ${hotkeyString}`);
  }

  /**
   * Set custom hotkey for command
   */
  setHotkey(commandId: string, hotkeys: Hotkey[]): void {
    this.customHotkeys.set(commandId, hotkeys);
    this.saveCustomHotkeys();
    this.trigger('hotkeys-changed', commandId);
  }

  /**
   * Get hotkeys for command
   */
  getHotkeys(commandId: string): Hotkey[] {
    const custom = this.customHotkeys.get(commandId);
    if (custom) {
      return custom;
    }

    const command = this.commands.get(commandId);
    return command?.hotkeys || [];
  }

  /**
   * Get all commands
   */
  getAllCommands(): HotkeyCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Check if hotkey is available
   */
  isHotkeyAvailable(hotkey: Hotkey): boolean {
    const hotkeyString = this.hotkeyToString(hotkey);
    return !this.hotkeyMap.has(hotkeyString);
  }

  /**
   * Get command for hotkey
   */
  getCommandForHotkey(hotkey: Hotkey): string | null {
    const hotkeyString = this.hotkeyToString(hotkey);
    return this.hotkeyMap.get(hotkeyString) || null;
  }

  /**
   * Convert hotkey to string
   */
  private hotkeyToString(hotkey: Hotkey): string {
    const parts = [...hotkey.modifiers].sort();
    parts.push(hotkey.key);
    return parts.join('+').toLowerCase();
  }

  /**
   * Parse keyboard event to hotkey
   */
  private eventToHotkey(event: KeyboardEvent): Hotkey {
    const modifiers: string[] = [];
    
    if (event.ctrlKey || event.metaKey) {
      modifiers.push('Mod');
    }
    if (event.altKey) {
      modifiers.push('Alt');
    }
    if (event.shiftKey) {
      modifiers.push('Shift');
    }

    return {
      modifiers,
      key: event.key,
    };
  }

  /**
   * Setup global keyboard listener
   */
  private setupGlobalListener(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // Ignore if typing in input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const hotkey = this.eventToHotkey(event);
      const commandId = this.getCommandForHotkey(hotkey);

      if (commandId) {
        event.preventDefault();
        event.stopPropagation();

        const command = this.commands.get(commandId);
        if (command) {
          try {
            command.callback();
            log.debug('Hotkeys', `Executed command: ${commandId}`);
          } catch (error) {
            log.error('Hotkeys', `Failed to execute command: ${commandId}`, error as Error);
          }
        }
      }
    });
  }

  /**
   * Load custom hotkeys from storage
   */
  async loadCustomHotkeys(): Promise<void> {
    try {
      const stored = localStorage.getItem('a3note-custom-hotkeys');
      if (stored) {
        const data = JSON.parse(stored);
        this.customHotkeys = new Map(Object.entries(data));
        
        // Rebuild hotkey map
        this.hotkeyMap.clear();
        for (const [commandId, hotkeys] of this.customHotkeys) {
          for (const hotkey of hotkeys) {
            const hotkeyString = this.hotkeyToString(hotkey);
            this.hotkeyMap.set(hotkeyString, commandId);
          }
        }

        log.info('Hotkeys', 'Custom hotkeys loaded');
      }
    } catch (error) {
      log.error('Hotkeys', 'Failed to load custom hotkeys', error as Error);
    }
  }

  /**
   * Save custom hotkeys to storage
   */
  private saveCustomHotkeys(): void {
    try {
      const data = Object.fromEntries(this.customHotkeys);
      localStorage.setItem('a3note-custom-hotkeys', JSON.stringify(data));
      log.debug('Hotkeys', 'Custom hotkeys saved');
    } catch (error) {
      log.error('Hotkeys', 'Failed to save custom hotkeys', error as Error);
    }
  }

  /**
   * Reset hotkeys to defaults
   */
  resetToDefaults(): void {
    this.customHotkeys.clear();
    this.saveCustomHotkeys();
    this.trigger('hotkeys-reset');
  }

  /**
   * Export hotkeys
   */
  export(): string {
    const data = Object.fromEntries(this.customHotkeys);
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import hotkeys
   */
  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.customHotkeys = new Map(Object.entries(parsed));
      this.saveCustomHotkeys();
      this.trigger('hotkeys-changed');
    } catch (error) {
      log.error('Hotkeys', 'Failed to import hotkeys', error as Error);
      throw new Error('Invalid hotkeys data');
    }
  }

  /**
   * Clear all hotkeys
   */
  clear(): void {
    this.commands.clear();
    this.hotkeyMap.clear();
    this.customHotkeys.clear();
  }
}

/**
 * Hotkey utilities
 */
export class HotkeyUtils {
  /**
   * Format hotkey for display
   */
  static formatHotkey(hotkey: Hotkey): string {
    const parts = [...hotkey.modifiers];
    parts.push(hotkey.key);
    
    return parts
      .map(part => {
        switch (part) {
          case 'Mod':
            return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
          case 'Alt':
            return navigator.platform.includes('Mac') ? '⌥' : 'Alt';
          case 'Shift':
            return '⇧';
          default:
            return part.toUpperCase();
        }
      })
      .join('+');
  }

  /**
   * Parse hotkey string
   */
  static parseHotkey(str: string): Hotkey {
    const parts = str.split('+').map(p => p.trim());
    const key = parts.pop() || '';
    const modifiers = parts;

    return { modifiers, key };
  }

  /**
   * Check if hotkey matches event
   */
  static matchesEvent(hotkey: Hotkey, event: KeyboardEvent): boolean {
    const hasCtrl = event.ctrlKey || event.metaKey;
    const hasAlt = event.altKey;
    const hasShift = event.shiftKey;

    const needsCtrl = hotkey.modifiers.includes('Mod');
    const needsAlt = hotkey.modifiers.includes('Alt');
    const needsShift = hotkey.modifiers.includes('Shift');

    return (
      hasCtrl === needsCtrl &&
      hasAlt === needsAlt &&
      hasShift === needsShift &&
      event.key.toLowerCase() === hotkey.key.toLowerCase()
    );
  }

  /**
   * Get default hotkeys
   */
  static getDefaultHotkeys(): Record<string, Hotkey[]> {
    return {
      'editor:save': [{ modifiers: ['Mod'], key: 's' }],
      'editor:bold': [{ modifiers: ['Mod'], key: 'b' }],
      'editor:italic': [{ modifiers: ['Mod'], key: 'i' }],
      'editor:undo': [{ modifiers: ['Mod'], key: 'z' }],
      'editor:redo': [{ modifiers: ['Mod', 'Shift'], key: 'z' }],
      'app:open-search': [{ modifiers: ['Mod'], key: 'f' }],
      'app:open-command-palette': [{ modifiers: ['Mod'], key: 'p' }],
      'app:toggle-sidebar': [{ modifiers: ['Mod'], key: 'b' }],
      'app:new-note': [{ modifiers: ['Mod'], key: 'n' }],
    };
  }
}

/**
 * Singleton instance
 */
let hotkeysInstance: Hotkeys | null = null;

export function getHotkeys(): Hotkeys {
  if (!hotkeysInstance) {
    hotkeysInstance = new Hotkeys();
  }
  return hotkeysInstance;
}

export function resetHotkeys(): void {
  if (hotkeysInstance) {
    hotkeysInstance.clear();
  }
  hotkeysInstance = null;
}
