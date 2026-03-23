import { useMemo } from "react";
import { FileText, Clock, Hash } from "lucide-react";

interface MarkdownStatsProps {
  content: string;
}

export default function MarkdownStats({ content }: MarkdownStatsProps) {
  const stats = useMemo(() => {
    // Remove markdown syntax for accurate word count
    const plainText = content
      .replace(/#{1,6}\s/g, "") // Remove heading markers
      .replace(/\*\*|__/g, "") // Remove bold markers
      .replace(/\*|_/g, "") // Remove italic markers
      .replace(/`{1,3}/g, "") // Remove code markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Remove images
      .replace(/^>\s/gm, "") // Remove quote markers
      .replace(/^[-*+]\s/gm, "") // Remove list markers
      .replace(/^\d+\.\s/gm, "") // Remove numbered list markers
      .trim();

    const words = plainText
      .split(/\s+/)
      .filter((word) => word.length > 0);
    
    const wordCount = words.length;
    const charCount = plainText.length;
    const charCountNoSpaces = plainText.replace(/\s/g, "").length;
    
    // Average reading speed: 200 words per minute
    const readingTime = Math.ceil(wordCount / 200);
    
    // Count paragraphs (non-empty lines)
    const paragraphs = content
      .split("\n\n")
      .filter((p) => p.trim().length > 0).length;

    return {
      words: wordCount,
      characters: charCount,
      charactersNoSpaces: charCountNoSpaces,
      paragraphs,
      readingTime,
    };
  }, [content]);

  return (
    <div className="flex items-center gap-4 px-4 text-xs text-muted">
      <div className="flex items-center gap-1" title="Word count">
        <FileText size={12} />
        <span>{stats.words} words</span>
      </div>
      <div className="flex items-center gap-1" title="Character count">
        <Hash size={12} />
        <span>{stats.characters} chars</span>
      </div>
      <div className="flex items-center gap-1" title="Reading time">
        <Clock size={12} />
        <span>{stats.readingTime} min read</span>
      </div>
      <div className="text-muted/70">
        {stats.paragraphs} paragraphs
      </div>
    </div>
  );
}
