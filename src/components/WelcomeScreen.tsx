import { FolderOpen } from "lucide-react";

interface WelcomeScreenProps {
  onOpenWorkspace: () => void;
}

export default function WelcomeScreen({ onOpenWorkspace }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-background text-foreground">
      <div className="text-center max-w-md px-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to A3Note</h1>
        <p className="text-lg text-foreground/70 mb-8">
          A high-performance, Obsidian-inspired note-taking application built with Rust and React.
        </p>
        
        <button
          onClick={onOpenWorkspace}
          className="flex items-center gap-3 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors mx-auto"
        >
          <FolderOpen size={20} />
          <span>Open Workspace</span>
        </button>

        <div className="mt-12 text-sm text-foreground/50">
          <p className="mb-2">Keyboard Shortcuts:</p>
          <ul className="space-y-1">
            <li>⌘+N - New file</li>
            <li>⌘+S - Save file</li>
            <li>⌘+B - Toggle sidebar</li>
            <li>⌘+Shift+P - Search</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
