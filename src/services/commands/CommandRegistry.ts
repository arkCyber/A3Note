/**
 * Command Registry - Aerospace-grade command management system
 * Centralized command registration and execution
 */

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category: string;
  action: () => void | Promise<void>;
  condition?: () => boolean;
  icon?: string;
}

export interface CommandCategory {
  id: string;
  label: string;
  order: number;
}

/**
 * Command Registry for managing all application commands
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private categories: Map<string, CommandCategory> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeCategories();
  }

  /**
   * Initialize command categories
   */
  private initializeCategories(): void {
    const categories: CommandCategory[] = [
      { id: 'file', label: 'File', order: 1 },
      { id: 'edit', label: 'Edit', order: 2 },
      { id: 'view', label: 'View', order: 3 },
      { id: 'navigate', label: 'Navigate', order: 4 },
      { id: 'format', label: 'Format', order: 5 },
      { id: 'workspace', label: 'Workspace', order: 6 },
      { id: 'tools', label: 'Tools', order: 7 },
      { id: 'help', label: 'Help', order: 8 },
    ];

    categories.forEach(cat => this.categories.set(cat.id, cat));
  }

  /**
   * Register a command
   */
  register(command: Command): void {
    if (this.commands.has(command.id)) {
      console.warn(`Command ${command.id} already registered, overwriting`);
    }

    this.commands.set(command.id, command);
    this.notifyListeners();
  }

  /**
   * Register multiple commands
   */
  registerMany(commands: Command[]): void {
    commands.forEach(cmd => this.register(cmd));
  }

  /**
   * Unregister a command
   */
  unregister(commandId: string): void {
    this.commands.delete(commandId);
    this.notifyListeners();
  }

  /**
   * Execute a command by ID
   */
  async execute(commandId: string): Promise<boolean> {
    const command = this.commands.get(commandId);
    
    if (!command) {
      console.error(`Command ${commandId} not found`);
      return false;
    }

    // Check condition if exists
    if (command.condition && !command.condition()) {
      console.warn(`Command ${commandId} condition not met`);
      return false;
    }

    try {
      await command.action();
      return true;
    } catch (error) {
      console.error(`Error executing command ${commandId}:`, error);
      return false;
    }
  }

  /**
   * Get all commands
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(categoryId: string): Command[] {
    return Array.from(this.commands.values())
      .filter(cmd => cmd.category === categoryId);
  }

  /**
   * Search commands
   */
  searchCommands(query: string): Command[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.commands.values())
      .filter(cmd => {
        const searchText = `${cmd.label} ${cmd.description || ''} ${cmd.category}`.toLowerCase();
        return searchText.includes(lowerQuery);
      })
      .sort((a, b) => {
        // Prioritize label matches
        const aLabelMatch = a.label.toLowerCase().includes(lowerQuery);
        const bLabelMatch = b.label.toLowerCase().includes(lowerQuery);
        
        if (aLabelMatch && !bLabelMatch) return -1;
        if (!aLabelMatch && bLabelMatch) return 1;
        
        return a.label.localeCompare(b.label);
      });
  }

  /**
   * Get command by ID
   */
  getCommand(commandId: string): Command | undefined {
    return this.commands.get(commandId);
  }

  /**
   * Check if command exists
   */
  hasCommand(commandId: string): boolean {
    return this.commands.has(commandId);
  }

  /**
   * Get all categories
   */
  getCategories(): CommandCategory[] {
    return Array.from(this.categories.values())
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Add listener for command changes
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
    this.notifyListeners();
  }

  /**
   * Get command count
   */
  getCommandCount(): number {
    return this.commands.size;
  }
}

// Global command registry instance
export const commandRegistry = new CommandRegistry();
