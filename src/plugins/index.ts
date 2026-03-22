/**
 * Plugin System Exports
 * Main entry point for the plugin system
 */

// API exports
export * from './api';

// Type exports
export * from './types/manifest';
export * from './types/plugin';

// Loader exports
export { PluginManager } from './loader/PluginManager';
export type { PluginInstance } from './loader/PluginManager';
