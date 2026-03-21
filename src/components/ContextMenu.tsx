import { useEffect, useRef } from "react";
import { FileText, Trash2, Edit, Copy, FolderPlus } from "lucide-react";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  separator?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-secondary border border-border rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {items.map((item, index) => (
        <div key={index}>
          {item.separator ? (
            <div className="h-px bg-border my-1" />
          ) : (
            <button
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : item.danger
                  ? "hover:bg-red-500/10 hover:text-red-500"
                  : "hover:bg-background"
              }`}
            >
              {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Predefined context menu configurations
export const fileContextMenuItems = (
  onRename: () => void,
  onDelete: () => void,
  onDuplicate: () => void
): ContextMenuItem[] => [
  {
    label: "Rename",
    icon: <Edit size={14} />,
    onClick: onRename,
  },
  {
    label: "Duplicate",
    icon: <Copy size={14} />,
    onClick: onDuplicate,
  },
  {
    separator: true,
    label: "",
    onClick: () => {},
  },
  {
    label: "Delete",
    icon: <Trash2 size={14} />,
    onClick: onDelete,
    danger: true,
  },
];

export const folderContextMenuItems = (
  onNewFile: () => void,
  onNewFolder: () => void,
  onRename: () => void,
  onDelete: () => void
): ContextMenuItem[] => [
  {
    label: "New File",
    icon: <FileText size={14} />,
    onClick: onNewFile,
  },
  {
    label: "New Folder",
    icon: <FolderPlus size={14} />,
    onClick: onNewFolder,
  },
  {
    separator: true,
    label: "",
    onClick: () => {},
  },
  {
    label: "Rename",
    icon: <Edit size={14} />,
    onClick: onRename,
  },
  {
    label: "Delete",
    icon: <Trash2 size={14} />,
    onClick: onDelete,
    danger: true,
  },
];
