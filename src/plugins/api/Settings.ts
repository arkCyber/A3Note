/**
 * Settings API - Obsidian Compatible
 * Aerospace-grade settings management system
 */

import { Events } from './Events';
import { log } from '../../utils/logger';

export interface PluginSettingTab {
  containerEl: HTMLElement;
  display(): void;
  hide(): void;
}

/**
 * Settings class for plugin configuration
 */
export class Settings extends Events {
  private settings: Map<string, any> = new Map();
  private defaultSettings: Map<string, any> = new Map();

  /**
   * Load settings from storage
   */
  async loadSettings(): Promise<void> {
    try {
      const stored = localStorage.getItem('a3note-settings');
      if (stored) {
        const data = JSON.parse(stored);
        this.settings = new Map(Object.entries(data));
      }
      log.info('Settings', 'Settings loaded');
    } catch (error) {
      log.error('Settings', 'Failed to load settings', error as Error);
    }
  }

  /**
   * Save settings to storage
   */
  async saveSettings(): Promise<void> {
    try {
      const data = Object.fromEntries(this.settings);
      localStorage.setItem('a3note-settings', JSON.stringify(data));
      this.trigger('settings-changed');
      log.info('Settings', 'Settings saved');
    } catch (error) {
      log.error('Settings', 'Failed to save settings', error as Error);
    }
  }

  /**
   * Get a setting value
   */
  get<T = any>(key: string): T | undefined {
    return this.settings.get(key) ?? this.defaultSettings.get(key);
  }

  /**
   * Set a setting value
   */
  set<T = any>(key: string, value: T): void {
    this.settings.set(key, value);
  }

  /**
   * Set default value for a setting
   */
  setDefault<T = any>(key: string, value: T): void {
    this.defaultSettings.set(key, value);
  }

  /**
   * Check if setting exists
   */
  has(key: string): boolean {
    return this.settings.has(key) || this.defaultSettings.has(key);
  }

  /**
   * Delete a setting
   */
  delete(key: string): boolean {
    return this.settings.delete(key);
  }

  /**
   * Clear all settings
   */
  clear(): void {
    this.settings.clear();
  }

  /**
   * Get all settings
   */
  getAll(): Record<string, any> {
    return Object.fromEntries(this.settings);
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.settings.clear();
    for (const [key, value] of this.defaultSettings) {
      this.settings.set(key, value);
    }
  }

  /**
   * Export settings
   */
  export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import settings
   */
  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.settings = new Map(Object.entries(parsed));
      this.trigger('settings-changed');
    } catch (error) {
      log.error('Settings', 'Failed to import settings', error as Error);
      throw new Error('Invalid settings data');
    }
  }
}

/**
 * Setting builder for creating setting UI
 */
export class Setting {
  private containerEl: HTMLElement;
  private settingEl: HTMLElement;
  private nameEl: HTMLElement;
  private descEl: HTMLElement;
  private controlEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl;
    
    // Create setting element
    this.settingEl = document.createElement('div');
    this.settingEl.className = 'setting-item';
    
    // Create info container
    const infoEl = document.createElement('div');
    infoEl.className = 'setting-item-info';
    
    this.nameEl = document.createElement('div');
    this.nameEl.className = 'setting-item-name';
    
    this.descEl = document.createElement('div');
    this.descEl.className = 'setting-item-description';
    
    infoEl.appendChild(this.nameEl);
    infoEl.appendChild(this.descEl);
    
    // Create control container
    this.controlEl = document.createElement('div');
    this.controlEl.className = 'setting-item-control';
    
    this.settingEl.appendChild(infoEl);
    this.settingEl.appendChild(this.controlEl);
    
    this.containerEl.appendChild(this.settingEl);
  }

  /**
   * Set setting name
   */
  setName(name: string): this {
    this.nameEl.textContent = name;
    return this;
  }

  /**
   * Set setting description
   */
  setDesc(desc: string): this {
    this.descEl.textContent = desc;
    return this;
  }

  /**
   * Add text input
   */
  addText(callback: (text: TextComponent) => void): this {
    const text = new TextComponent(this.controlEl);
    callback(text);
    return this;
  }

  /**
   * Add toggle
   */
  addToggle(callback: (toggle: ToggleComponent) => void): this {
    const toggle = new ToggleComponent(this.controlEl);
    callback(toggle);
    return this;
  }

  /**
   * Add dropdown
   */
  addDropdown(callback: (dropdown: DropdownComponent) => void): this {
    const dropdown = new DropdownComponent(this.controlEl);
    callback(dropdown);
    return this;
  }

  /**
   * Add slider
   */
  addSlider(callback: (slider: SliderComponent) => void): this {
    const slider = new SliderComponent(this.controlEl);
    callback(slider);
    return this;
  }

  /**
   * Add button
   */
  addButton(callback: (button: ButtonComponent) => void): this {
    const button = new ButtonComponent(this.controlEl);
    callback(button);
    return this;
  }

  /**
   * Set setting class
   */
  setClass(className: string): this {
    this.settingEl.className += ' ' + className;
    return this;
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): this {
    if (disabled) {
      this.settingEl.classList.add('is-disabled');
    } else {
      this.settingEl.classList.remove('is-disabled');
    }
    return this;
  }
}

/**
 * Text input component
 */
export class TextComponent {
  private inputEl: HTMLInputElement;

  constructor(containerEl: HTMLElement) {
    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.className = 'setting-text-input';
    containerEl.appendChild(this.inputEl);
  }

  setValue(value: string): this {
    this.inputEl.value = value;
    return this;
  }

  getValue(): string {
    return this.inputEl.value;
  }

  setPlaceholder(placeholder: string): this {
    this.inputEl.placeholder = placeholder;
    return this;
  }

  onChange(callback: (value: string) => void): this {
    this.inputEl.addEventListener('input', () => {
      callback(this.inputEl.value);
    });
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.inputEl.disabled = disabled;
    return this;
  }
}

/**
 * Toggle component
 */
export class ToggleComponent {
  private toggleEl: HTMLInputElement;

  constructor(containerEl: HTMLElement) {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-container';
    
    this.toggleEl = document.createElement('input');
    this.toggleEl.type = 'checkbox';
    this.toggleEl.className = 'setting-toggle';
    
    wrapper.appendChild(this.toggleEl);
    containerEl.appendChild(wrapper);
  }

  setValue(value: boolean): this {
    this.toggleEl.checked = value;
    return this;
  }

  getValue(): boolean {
    return this.toggleEl.checked;
  }

  onChange(callback: (value: boolean) => void): this {
    this.toggleEl.addEventListener('change', () => {
      callback(this.toggleEl.checked);
    });
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.toggleEl.disabled = disabled;
    return this;
  }

  setTooltip(tooltip: string): this {
    this.toggleEl.title = tooltip;
    return this;
  }
}

/**
 * Dropdown component
 */
export class DropdownComponent {
  private selectEl: HTMLSelectElement;

  constructor(containerEl: HTMLElement) {
    this.selectEl = document.createElement('select');
    this.selectEl.className = 'dropdown';
    containerEl.appendChild(this.selectEl);
  }

  addOption(value: string, display: string): this {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = display;
    this.selectEl.appendChild(option);
    return this;
  }

  addOptions(options: Record<string, string>): this {
    for (const [value, display] of Object.entries(options)) {
      this.addOption(value, display);
    }
    return this;
  }

  setValue(value: string): this {
    this.selectEl.value = value;
    return this;
  }

  getValue(): string {
    return this.selectEl.value;
  }

  onChange(callback: (value: string) => void): this {
    this.selectEl.addEventListener('change', () => {
      callback(this.selectEl.value);
    });
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.selectEl.disabled = disabled;
    return this;
  }
}

/**
 * Slider component
 */
export class SliderComponent {
  private sliderEl: HTMLInputElement;
  private valueEl: HTMLSpanElement;

  constructor(containerEl: HTMLElement) {
    const wrapper = document.createElement('div');
    wrapper.className = 'slider-container';
    
    this.sliderEl = document.createElement('input');
    this.sliderEl.type = 'range';
    this.sliderEl.className = 'slider';
    
    this.valueEl = document.createElement('span');
    this.valueEl.className = 'slider-value';
    
    wrapper.appendChild(this.sliderEl);
    wrapper.appendChild(this.valueEl);
    containerEl.appendChild(wrapper);
  }

  setLimits(min: number, max: number, step: number): this {
    this.sliderEl.min = String(min);
    this.sliderEl.max = String(max);
    this.sliderEl.step = String(step);
    return this;
  }

  setValue(value: number): this {
    this.sliderEl.value = String(value);
    this.valueEl.textContent = String(value);
    return this;
  }

  getValue(): number {
    return Number(this.sliderEl.value);
  }

  onChange(callback: (value: number) => void): this {
    this.sliderEl.addEventListener('input', () => {
      const value = Number(this.sliderEl.value);
      this.valueEl.textContent = String(value);
      callback(value);
    });
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.sliderEl.disabled = disabled;
    return this;
  }

  setDynamicTooltip(): this {
    this.sliderEl.title = this.sliderEl.value;
    this.sliderEl.addEventListener('input', () => {
      this.sliderEl.title = this.sliderEl.value;
    });
    return this;
  }
}

/**
 * Button component
 */
export class ButtonComponent {
  private buttonEl: HTMLButtonElement;

  constructor(containerEl: HTMLElement) {
    this.buttonEl = document.createElement('button');
    this.buttonEl.className = 'mod-cta';
    containerEl.appendChild(this.buttonEl);
  }

  setButtonText(text: string): this {
    this.buttonEl.textContent = text;
    return this;
  }

  setCta(): this {
    this.buttonEl.classList.add('mod-cta');
    return this;
  }

  setWarning(): this {
    this.buttonEl.classList.add('mod-warning');
    return this;
  }

  onClick(callback: () => void): this {
    this.buttonEl.addEventListener('click', callback);
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.buttonEl.disabled = disabled;
    return this;
  }

  setTooltip(tooltip: string): this {
    this.buttonEl.title = tooltip;
    return this;
  }

  setIcon(icon: string): this {
    this.buttonEl.innerHTML = `<span class="icon">${icon}</span>`;
    return this;
  }
}

/**
 * Singleton instance
 */
let settingsInstance: Settings | null = null;

export function getSettings(): Settings {
  if (!settingsInstance) {
    settingsInstance = new Settings();
  }
  return settingsInstance;
}

export function resetSettings(): void {
  settingsInstance = null;
}
