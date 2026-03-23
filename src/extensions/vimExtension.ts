import { vim, Vim } from "@replit/codemirror-vim";
import { EditorView } from "@codemirror/view";
import { log } from "../utils/logger";

/**
 * Vim mode extension for CodeMirror
 * Provides full Vim keybindings and modal editing
 */

// Vim mode state
let vimEnabled = false;

/**
 * Get Vim mode status
 */
export function isVimEnabled(): boolean {
  return vimEnabled;
}

/**
 * Enable Vim mode
 */
export function enableVim(view: EditorView): void {
  if (vimEnabled) return;
  
  vimEnabled = true;
  log.info("VimMode", "Vim mode enabled");
  
  // Configure Vim settings
  Vim.defineOption("clipboard", "", "string", ["unnamed"], (value: string) => {
    // Enable system clipboard integration
  });
  
  // Custom Vim commands
  Vim.defineEx("write", "w", () => {
    // Trigger save
    log.info("VimMode", "Save command triggered");
  });
  
  Vim.defineEx("quit", "q", () => {
    // Close file
    log.info("VimMode", "Quit command triggered");
  });
  
  Vim.defineEx("wq", "wq", () => {
    // Save and close
    log.info("VimMode", "Save and quit command triggered");
  });
}

/**
 * Disable Vim mode
 */
export function disableVim(): void {
  if (!vimEnabled) return;
  
  vimEnabled = false;
  log.info("VimMode", "Vim mode disabled");
}

/**
 * Vim extension with custom configuration
 */
export const vimExtension = vim({
  status: true, // Show status bar
});

/**
 * Vim status theme
 */
export const vimTheme = EditorView.baseTheme({
  ".cm-vim-panel": {
    position: "fixed",
    bottom: "0",
    left: "0",
    right: "0",
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    padding: "4px 8px",
    fontSize: "12px",
    fontFamily: "monospace",
    borderTop: "1px solid #3a3a3a",
    zIndex: "1000",
  },
  ".cm-vim-panel input": {
    backgroundColor: "#2d2d2d",
    color: "#d4d4d4",
    border: "1px solid #3a3a3a",
    padding: "2px 4px",
    outline: "none",
  },
  ".cm-vim-panel input:focus": {
    borderColor: "#4fc3f7",
  },
});

/**
 * Vim mode indicator component
 */
export function createVimIndicator(): HTMLElement {
  const indicator = document.createElement("div");
  indicator.className = "vim-mode-indicator";
  indicator.style.cssText = `
    position: fixed;
    bottom: 8px;
    right: 8px;
    padding: 4px 12px;
    background: #2d2d2d;
    color: #4fc3f7;
    border: 1px solid #4fc3f7;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    z-index: 1001;
  `;
  indicator.textContent = "-- NORMAL --";
  
  return indicator;
}

/**
 * Update Vim mode indicator
 */
export function updateVimIndicator(mode: string): void {
  const indicator = document.querySelector(".vim-mode-indicator");
  if (!indicator) return;
  
  const modeText = mode.toUpperCase();
  indicator.textContent = `-- ${modeText} --`;
  
  // Update color based on mode
  switch (mode.toLowerCase()) {
    case "normal":
      (indicator as HTMLElement).style.color = "#4fc3f7";
      (indicator as HTMLElement).style.borderColor = "#4fc3f7";
      break;
    case "insert":
      (indicator as HTMLElement).style.color = "#4caf50";
      (indicator as HTMLElement).style.borderColor = "#4caf50";
      break;
    case "visual":
      (indicator as HTMLElement).style.color = "#ff9800";
      (indicator as HTMLElement).style.borderColor = "#ff9800";
      break;
    case "replace":
      (indicator as HTMLElement).style.color = "#f44336";
      (indicator as HTMLElement).style.borderColor = "#f44336";
      break;
  }
}

// Export Vim object for advanced customization
export { Vim };
