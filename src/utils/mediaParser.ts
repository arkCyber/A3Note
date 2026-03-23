export interface ImageEmbed {
  type: 'image';
  path: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface VideoEmbed {
  type: 'video';
  path: string;
  format: string;
}

export interface AudioEmbed {
  type: 'audio';
  path: string;
  format: string;
}

export type MediaEmbed = ImageEmbed | VideoEmbed | AudioEmbed;

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogv', '.mov', '.mkv'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.3gp', '.flac'];

export function parseObsidianEmbed(text: string): MediaEmbed | null {
  const match = text.match(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
  if (!match) return null;

  const [, path, params] = match;
  const ext = path.substring(path.lastIndexOf('.')).toLowerCase();

  if (IMAGE_EXTENSIONS.includes(ext)) {
    return parseImageEmbed(path, params);
  } else if (VIDEO_EXTENSIONS.includes(ext)) {
    return parseVideoEmbed(path, ext);
  } else if (AUDIO_EXTENSIONS.includes(ext)) {
    return parseAudioEmbed(path, ext);
  }

  return null;
}

function parseImageEmbed(path: string, params?: string): ImageEmbed {
  let width: number | undefined;
  let height: number | undefined;
  let caption: string | undefined;

  if (params) {
    const sizeMatch = params.match(/^(\d+)(?:x(\d+))?$/);
    if (sizeMatch) {
      width = parseInt(sizeMatch[1]);
      height = sizeMatch[2] ? parseInt(sizeMatch[2]) : undefined;
    } else {
      caption = params;
    }
  }

  return {
    type: 'image',
    path,
    width,
    height,
    caption,
  };
}

function parseVideoEmbed(path: string, ext: string): VideoEmbed {
  return {
    type: 'video',
    path,
    format: ext.substring(1),
  };
}

function parseAudioEmbed(path: string, ext: string): AudioEmbed {
  return {
    type: 'audio',
    path,
    format: ext.substring(1),
  };
}

export function resolveMediaPath(path: string, workspacePath?: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (workspacePath) {
    return `file://${workspacePath}/${path}`;
  }

  return path;
}

export function convertObsidianToMarkdown(content: string, workspacePath?: string): string {
  return content.replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, path, params) => {
    const embed = parseObsidianEmbed(match);
    if (!embed) return match;

    const resolvedPath = resolveMediaPath(path, workspacePath);

    if (embed.type === 'image') {
      let sizeAttr = '';
      if (embed.width) {
        sizeAttr = ` width="${embed.width}"`;
        if (embed.height) {
          sizeAttr += ` height="${embed.height}"`;
        }
      }
      const alt = embed.caption || '';
      return `<img src="${resolvedPath}" alt="${alt}"${sizeAttr} />`;
    } else if (embed.type === 'video') {
      return `<video src="${resolvedPath}" controls style="max-width: 100%"><source src="${resolvedPath}" type="video/${embed.format}" />Your browser does not support the video tag.</video>`;
    } else if (embed.type === 'audio') {
      return `<audio src="${resolvedPath}" controls><source src="${resolvedPath}" type="audio/${embed.format}" />Your browser does not support the audio tag.</audio>`;
    }

    return match;
  });
}

export function isMediaFile(filename: string): boolean {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext) || 
         VIDEO_EXTENSIONS.includes(ext) || 
         AUDIO_EXTENSIONS.includes(ext);
}

export function getMediaType(filename: string): 'image' | 'video' | 'audio' | null {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  
  return null;
}
