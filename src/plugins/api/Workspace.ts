/**
 * Workspace API
 * Manages the application workspace, views, and layout
 */

import { TFile } from './Vault';
import { RibbonAction } from '../types/plugin';

export interface WorkspaceLeaf {
  id: string;
  view: any;
  parent: WorkspaceSplit | null;
  pinned: boolean;
  getViewState(): any;
  setViewState(state: any): Promise<void>;
  detach(): void;
  openFile(file: TFile, state?: any): Promise<void>;
}

export interface WorkspaceSplit {
  type: 'split';
  direction: 'horizontal' | 'vertical';
  children: (WorkspaceLeaf | WorkspaceSplit)[];
  parent: WorkspaceSplit | null;
}

export class Workspace {
  private activeFile: TFile | null = null;
  private viewTypes: Map<string, any> = new Map();
  private ribbonIcons: RibbonAction[] = [];
  private statusBarItems: HTMLElement[] = [];
  private leaves: WorkspaceLeaf[] = [];
  private activeLeaf: WorkspaceLeaf | null = null;
  private leafIdCounter = 0;
  
  // Split containers
  public leftSplit: WorkspaceSplit;
  public rightSplit: WorkspaceSplit;
  public rootSplit: WorkspaceSplit;
  
  constructor() {
    // Initialize splits
    this.leftSplit = this.createSplit('vertical', null);
    this.rightSplit = this.createSplit('vertical', null);
    this.rootSplit = this.createSplit('horizontal', null);
  }
  
  /**
   * Get the currently active file
   */
  getActiveFile(): TFile | null {
    return this.activeFile;
  }
  
  /**
   * Set the active file
   */
  setActiveFile(file: TFile | null): void {
    this.activeFile = file;
    this.trigger('active-leaf-change');
  }
  
  /**
   * Get active view of specific type
   */
  getActiveViewOfType<T>(type: string): T | null {
    if (!this.activeLeaf) return null;
    
    const viewState = this.activeLeaf.getViewState();
    if (viewState && viewState.type === type) {
      return this.activeLeaf.view as T;
    }
    
    return null;
  }
  
  /**
   * Get all leaves of specific type
   */
  getLeavesOfType(type: string): WorkspaceLeaf[] {
    return this.leaves.filter(leaf => {
      const viewState = leaf.getViewState();
      return viewState && viewState.type === type;
    });
  }
  
  /**
   * Get most recent leaf
   */
  getMostRecentLeaf(): WorkspaceLeaf | null {
    return this.activeLeaf;
  }
  
  /**
   * Get or create leaf
   */
  getLeaf(newLeaf: boolean = false): WorkspaceLeaf {
    if (newLeaf || !this.activeLeaf) {
      return this.createLeaf(this.rootSplit);
    }
    return this.activeLeaf;
  }
  
  /**
   * Get unpinned leaf
   */
  getUnpinnedLeaf(): WorkspaceLeaf {
    const unpinned = this.leaves.find(leaf => !leaf.pinned);
    if (unpinned) return unpinned;
    
    return this.createLeaf(this.rootSplit);
  }
  
  /**
   * Get left split leaf
   */
  getLeftLeaf(split: boolean): WorkspaceLeaf {
    const existing = this.findLeafInSplit(this.leftSplit);
    if (existing && !split) return existing;
    
    return this.createLeaf(this.leftSplit);
  }
  
  /**
   * Get right split leaf
   */
  getRightLeaf(split: boolean): WorkspaceLeaf {
    const existing = this.findLeafInSplit(this.rightSplit);
    if (existing && !split) return existing;
    
    return this.createLeaf(this.rightSplit);
  }
  
  /**
   * Split active leaf
   */
  splitActiveLeaf(direction: 'vertical' | 'horizontal' = 'vertical'): WorkspaceLeaf {
    if (!this.activeLeaf) {
      return this.createLeaf(this.rootSplit);
    }
    
    const parent = this.activeLeaf.parent;
    if (!parent) {
      return this.createLeaf(this.rootSplit);
    }
    
    // Create new split if needed
    if (parent.direction !== direction) {
      const newSplit = this.createSplit(direction, parent);
      const index = parent.children.indexOf(this.activeLeaf);
      parent.children[index] = newSplit;
      newSplit.children.push(this.activeLeaf);
      this.activeLeaf.parent = newSplit;
    }
    
    // Create new leaf in same split
    const newLeaf = this.createLeaf(this.activeLeaf.parent || this.rootSplit);
    return newLeaf;
  }
  
  /**
   * Open a file by link text
   */
  async openLinkText(
    linktext: string,
    sourcePath: string,
    newLeaf: boolean = false
  ): Promise<void> {
    // Resolve link to file path
    // In real implementation, would use LinkResolver.resolveLink(linktext, sourcePath)
    const filePath = linktext.replace(/\.md$/, '') + '.md';
    
    const leaf = newLeaf ? this.createLeaf(this.rootSplit) : this.getLeaf();
    
    // Create mock file
    const file: TFile = {
      path: filePath,
      name: filePath.split('/').pop() || '',
      basename: filePath.split('/').pop()?.replace(/\.md$/, '') || '',
      extension: 'md',
      stat: {
        ctime: Date.now(),
        mtime: Date.now(),
        size: 0,
      },
    };
    
    await leaf.openFile(file);
    this.setActiveLeaf(leaf);
  }
  
  /**
   * Register a view type
   */
  registerViewType(type: string, viewCreator: any): void {
    this.viewTypes.set(type, viewCreator);
  }
  
  /**
   * Unregister a view type
   */
  unregisterViewType(type: string): void {
    this.viewTypes.delete(type);
  }
  
  /**
   * Add ribbon icon (left sidebar)
   */
  addRibbonIcon(action: RibbonAction): HTMLElement {
    this.ribbonIcons.push(action);
    
    // Create DOM element for ribbon icon
    const el = document.createElement('div');
    el.className = 'ribbon-icon';
    el.title = action.title;
    el.innerHTML = `<svg><use href="#${action.icon}"></use></svg>`;
    el.onclick = action.callback;
    
    return el;
  }
  
  /**
   * Remove ribbon icon
   */
  removeRibbonIcon(action: RibbonAction): void {
    const index = this.ribbonIcons.indexOf(action);
    if (index > -1) {
      this.ribbonIcons.splice(index, 1);
    }
  }
  
  /**
   * Add status bar item
   */
  addStatusBarItem(): HTMLElement {
    const item = document.createElement('div');
    item.className = 'status-bar-item';
    this.statusBarItems.push(item);
    return item;
  }
  
  /**
   * Listen for workspace events
   */
  on(event: string, callback: (...args: any[]) => void): void {
    window.addEventListener(`workspace:${event}`, callback as EventListener);
  }
  
  /**
   * Remove event listener
   */
  off(event: string, callback: (...args: any[]) => void): void {
    window.removeEventListener(`workspace:${event}`, callback as EventListener);
  }
  
  /**
   * Trigger workspace event
   */
  trigger(event: string, ...args: any[]): void {
    const customEvent = new CustomEvent(`workspace:${event}`, { detail: args });
    window.dispatchEvent(customEvent);
  }
  
  /**
   * Get layout
   */
  getLayout(): any {
    return {
      type: 'split',
      direction: 'horizontal',
      children: [],
    };
  }
  
  /**
   * Change layout
   */
  changeLayout(_layout: any): Promise<void> {
    return Promise.resolve();
  }
  
  /**
   * Iterate all leaves
   */
  iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => void): void {
    this.leaves.forEach(callback);
  }
  
  /**
   * Iterate root leaves
   */
  iterateRootLeaves(callback: (leaf: WorkspaceLeaf) => void): void {
    this.iterateSplitLeaves(this.rootSplit, callback);
  }
  
  /**
   * Iterate leaves in a split
   */
  private iterateSplitLeaves(split: WorkspaceSplit, callback: (leaf: WorkspaceLeaf) => void): void {
    for (const child of split.children) {
      if ('type' in child && child.type === 'split') {
        this.iterateSplitLeaves(child, callback);
      } else {
        callback(child as WorkspaceLeaf);
      }
    }
  }
  
  /**
   * Create a new leaf
   */
  private createLeaf(parent: WorkspaceSplit): WorkspaceLeaf {
    const leaf: WorkspaceLeaf = {
      id: `leaf-${this.leafIdCounter++}`,
      view: null,
      parent,
      pinned: false,
      getViewState: () => ({ type: 'empty' }),
      setViewState: async (state: any) => {
        leaf.view = state;
      },
      detach: () => {
        this.detachLeaf(leaf);
      },
      openFile: async (file: TFile, state?: any) => {
        this.setActiveFile(file);
        await leaf.setViewState({ type: 'markdown', file, ...state });
      },
    };
    
    this.leaves.push(leaf);
    parent.children.push(leaf);
    
    return leaf;
  }
  
  /**
   * Create a new split
   */
  private createSplit(
    direction: 'horizontal' | 'vertical',
    parent: WorkspaceSplit | null
  ): WorkspaceSplit {
    return {
      type: 'split',
      direction,
      children: [],
      parent,
    };
  }
  
  /**
   * Detach a leaf
   */
  private detachLeaf(leaf: WorkspaceLeaf): void {
    const index = this.leaves.indexOf(leaf);
    if (index > -1) {
      this.leaves.splice(index, 1);
    }
    
    if (leaf.parent) {
      const childIndex = leaf.parent.children.indexOf(leaf);
      if (childIndex > -1) {
        leaf.parent.children.splice(childIndex, 1);
      }
    }
    
    if (this.activeLeaf === leaf) {
      this.activeLeaf = this.leaves[0] || null;
    }
  }
  
  /**
   * Set active leaf
   */
  private setActiveLeaf(leaf: WorkspaceLeaf): void {
    this.activeLeaf = leaf;
    this.trigger('active-leaf-change', leaf);
  }
  
  /**
   * Find any leaf in split
   */
  private findLeafInSplit(split: WorkspaceSplit): WorkspaceLeaf | null {
    for (const child of split.children) {
      if ('type' in child && child.type === 'split') {
        const found = this.findLeafInSplit(child);
        if (found) return found;
      } else {
        return child as WorkspaceLeaf;
      }
    }
    return null;
  }
}
