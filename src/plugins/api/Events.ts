/**
 * Events System - Obsidian Compatible
 * Aerospace-grade event handling system
 */

export type EventCallback = (...args: any[]) => any;

export interface EventRef {
  eventName: string;
  callback: EventCallback;
  context?: any;
}

/**
 * Events class for event-driven architecture
 */
export class Events {
  private listeners: Map<string, Set<EventRef>> = new Map();
  private onceListeners: Map<string, Set<EventRef>> = new Map();

  /**
   * Register an event handler
   */
  on(eventName: string, callback: EventCallback, context?: any): EventRef {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const ref: EventRef = { eventName, callback, context };
    this.listeners.get(eventName)!.add(ref);

    return ref;
  }

  /**
   * Register a one-time event handler
   */
  once(eventName: string, callback: EventCallback, context?: any): EventRef {
    if (!this.onceListeners.has(eventName)) {
      this.onceListeners.set(eventName, new Set());
    }

    const ref: EventRef = { eventName, callback, context };
    this.onceListeners.get(eventName)!.add(ref);

    return ref;
  }

  /**
   * Remove an event handler
   */
  off(eventName: string, callback: EventCallback): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      for (const ref of listeners) {
        if (ref.callback === callback) {
          listeners.delete(ref);
        }
      }
    }

    const onceListeners = this.onceListeners.get(eventName);
    if (onceListeners) {
      for (const ref of onceListeners) {
        if (ref.callback === callback) {
          onceListeners.delete(ref);
        }
      }
    }
  }

  /**
   * Remove an event handler by reference
   */
  offref(ref: EventRef): void {
    const listeners = this.listeners.get(ref.eventName);
    if (listeners) {
      listeners.delete(ref);
    }

    const onceListeners = this.onceListeners.get(ref.eventName);
    if (onceListeners) {
      onceListeners.delete(ref);
    }
  }

  /**
   * Trigger an event
   */
  trigger(eventName: string, ...args: any[]): void {
    // Trigger regular listeners
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      for (const ref of Array.from(listeners)) {
        try {
          if (ref.context) {
            ref.callback.apply(ref.context, args);
          } else {
            ref.callback(...args);
          }
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      }
    }

    // Trigger and remove once listeners
    const onceListeners = this.onceListeners.get(eventName);
    if (onceListeners) {
      for (const ref of Array.from(onceListeners)) {
        try {
          if (ref.context) {
            ref.callback.apply(ref.context, args);
          } else {
            ref.callback(...args);
          }
        } catch (error) {
          console.error(`Error in once event handler for ${eventName}:`, error);
        }
        onceListeners.delete(ref);
      }

      if (onceListeners.size === 0) {
        this.onceListeners.delete(eventName);
      }
    }
  }

  /**
   * Remove all event handlers
   */
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
      this.onceListeners.delete(eventName);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(eventName: string): number {
    const regular = this.listeners.get(eventName)?.size || 0;
    const once = this.onceListeners.get(eventName)?.size || 0;
    return regular + once;
  }

  /**
   * Check if event has listeners
   */
  hasListeners(eventName: string): boolean {
    return this.listenerCount(eventName) > 0;
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    const names = new Set<string>();
    
    for (const name of this.listeners.keys()) {
      names.add(name);
    }
    
    for (const name of this.onceListeners.keys()) {
      names.add(name);
    }
    
    return Array.from(names);
  }
}

/**
 * Component class with event support
 */
export class Component extends Events {
  private _loaded = false;
  private children: Component[] = [];

  /**
   * Load the component
   */
  load(): void {
    if (this._loaded) {
      return;
    }

    this._loaded = true;
    this.onload();
    this.trigger('load');
  }

  /**
   * Unload the component
   */
  unload(): void {
    if (!this._loaded) {
      return;
    }

    this._loaded = false;

    // Unload children
    for (const child of this.children) {
      child.unload();
    }
    this.children = [];

    this.onunload();
    this.trigger('unload');
    this.removeAllListeners();
  }

  /**
   * Called when component is loaded
   */
  protected onload(): void {
    // Override in subclasses
  }

  /**
   * Called when component is unloaded
   */
  protected onunload(): void {
    // Override in subclasses
  }

  /**
   * Add a child component
   */
  addChild<T extends Component>(component: T): T {
    this.children.push(component);
    if (this._loaded) {
      component.load();
    }
    return component;
  }

  /**
   * Remove a child component
   */
  removeChild(component: Component): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
      component.unload();
    }
  }

  /**
   * Register an interval that will be cleared on unload
   */
  registerInterval(interval: number): number {
    const id = window.setInterval(() => {}, interval);
    this.register(() => window.clearInterval(id));
    return id;
  }

  /**
   * Register a cleanup function
   */
  register(cleanup: () => void): void {
    this.on('unload', cleanup);
  }

  /**
   * Register a DOM event
   */
  registerDomEvent<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  registerDomEvent<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  registerDomEvent<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  registerDomEvent(
    target: any,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options);
    this.register(() => target.removeEventListener(type, listener, options));
  }

  /**
   * Check if component is loaded
   */
  get loaded(): boolean {
    return this._loaded;
  }
}

/**
 * EventEmitter class for custom events
 */
export class EventEmitter extends Events {
  constructor() {
    super();
  }

  /**
   * Emit an event (alias for trigger)
   */
  emit(eventName: string, ...args: any[]): void {
    this.trigger(eventName, ...args);
  }
}
