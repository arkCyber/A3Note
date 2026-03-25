import { 
  Bold, 
  Italic, 
  Strikethrough,
  Highlighter,
  Heading1, 
  Heading2, 
  Heading3, 
  Link, 
  Image, 
  Video,
  Music,
  Code,
  Code2,
  Quote, 
  List, 
  ListOrdered,
  Table,
  CheckSquare,
  Minus,
  Link2,
  AlertCircle
} from "lucide-react";

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string) => void;
}

export default function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  const tools = [
    {
      icon: Bold,
      label: "Bold (Cmd+B)",
      action: () => onInsert("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic (Cmd+I)",
      action: () => onInsert("*", "*"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough (Cmd+Shift+X)",
      action: () => onInsert("~~", "~~"),
    },
    {
      icon: Highlighter,
      label: "Highlight (Cmd+Shift+H)",
      action: () => onInsert("==", "=="),
    },
    { type: "separator" },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => onInsert("# ", ""),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => onInsert("## ", ""),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => onInsert("### ", ""),
    },
    { type: "separator" },
    {
      icon: Link,
      label: "Link (Cmd+K)",
      action: () => onInsert("[", "](url)"),
    },
    {
      icon: Link2,
      label: "Wikilink ([[]]) (Cmd+Shift+K)",
      action: () => onInsert("[[", "]]"),
    },
    {
      icon: Image,
      label: "Image",
      action: () => onInsert("![", "](url)"),
    },
    {
      icon: Video,
      label: "Video",
      action: () => onInsert("![[video.mp4", "]]"),
    },
    {
      icon: Music,
      label: "Audio",
      action: () => onInsert("![[audio.mp3", "]]"),
    },
    {
      icon: Code,
      label: "Code (Cmd+`)",
      action: () => onInsert("`", "`"),
    },
    {
      icon: Code2,
      label: "Code Block (Cmd+Shift+`)",
      action: () => onInsert("```\n", "\n```"),
    },
    { type: "separator" },
    {
      icon: Quote,
      label: "Quote",
      action: () => onInsert("> ", ""),
    },
    {
      icon: AlertCircle,
      label: "Callout",
      action: () => onInsert("> [!note]\n> ", ""),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => onInsert("- ", ""),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => onInsert("1. ", ""),
    },
    {
      icon: CheckSquare,
      label: "Task List",
      action: () => onInsert("- [ ] ", ""),
    },
    { type: "separator" },
    {
      icon: Table,
      label: "Table",
      action: () => onInsert("| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n", ""),
    },
    {
      icon: Minus,
      label: "Horizontal Rule",
      action: () => onInsert("---\n", ""),
    },
  ];

  return (
    <div className="h-10 flex items-center gap-1 px-4 border-b border-border bg-secondary">
      {tools.map((tool, index) => {
        if (tool.type === "separator") {
          return (
            <div
              key={`separator-${index}`}
              className="w-px h-6 bg-border mx-1"
            />
          );
        }

        const Icon = tool.icon;
        return (
          <button
            key={index}
            onClick={tool.action}
            className="p-1.5 hover:bg-background rounded transition-colors group"
            title={tool.label}
          >
            <Icon size={16} className="text-muted group-hover:text-foreground" />
          </button>
        );
      })}
    </div>
  );
}
