import { invoke } from '@tauri-apps/api/tauri';
import { log } from './logger';
import { getMediaType } from './mediaParser';

export interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface UploadOptions {
  workspacePath: string;
  targetFolder?: string;
  generateUniqueName?: boolean;
}

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac', 'audio/x-m4a'];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function isValidMediaType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type) || 
         ALLOWED_VIDEO_TYPES.includes(type) || 
         ALLOWED_AUDIO_TYPES.includes(type);
}

export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
  
  return `${nameWithoutExt}-${timestamp}-${random}${ext}`;
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function uploadMediaFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const startTime = performance.now();
  
  try {
    log.info('FileUpload', `Starting upload: ${file.name} (${file.size} bytes)`);

    // Validate file type
    if (!isValidMediaType(file.type)) {
      const error = `Invalid file type: ${file.type}`;
      log.error('FileUpload', error);
      return { success: false, error };
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      const error = `File size exceeds limit: ${file.size} bytes (max: ${MAX_FILE_SIZE})`;
      log.error('FileUpload', error);
      return { success: false, error };
    }

    // Generate file name
    let fileName = sanitizeFileName(file.name);
    if (options.generateUniqueName) {
      fileName = generateUniqueFileName(fileName);
    }

    // Determine target folder
    const targetFolder = options.targetFolder || 'attachments';
    const relativePath = `${targetFolder}/${fileName}`;

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Save file using Tauri command
    await invoke('save_media_file', {
      workspacePath: options.workspacePath,
      relativePath,
      data: Array.from(uint8Array),
    });

    const duration = performance.now() - startTime;
    log.info('FileUpload', `Upload completed: ${relativePath} (${duration.toFixed(2)}ms)`);

    return {
      success: true,
      path: relativePath,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    log.error('FileUpload', `Upload failed after ${duration.toFixed(2)}ms:`, error as Error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function uploadMultipleFiles(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  log.info('FileUpload', `Uploading ${files.length} files`);
  
  const results: UploadResult[] = [];
  
  for (const file of files) {
    const result = await uploadMediaFile(file, options);
    results.push(result);
  }
  
  const successCount = results.filter(r => r.success).length;
  log.info('FileUpload', `Upload batch completed: ${successCount}/${files.length} successful`);
  
  return results;
}

export function getMediaSyntax(path: string, fileName: string): string {
  const mediaType = getMediaType(fileName);
  
  if (mediaType === 'image') {
    return `![[${path}]]`;
  } else if (mediaType === 'video') {
    return `![[${path}]]`;
  } else if (mediaType === 'audio') {
    return `![[${path}]]`;
  }
  
  return `[${fileName}](${path})`;
}

export async function handleFileDrop(
  files: FileList | File[],
  options: UploadOptions,
  onProgress?: (current: number, total: number) => void
): Promise<{ results: UploadResult[]; syntaxList: string[] }> {
  const fileArray = Array.from(files);
  const mediaFiles = fileArray.filter(f => isValidMediaType(f.type));
  
  if (mediaFiles.length === 0) {
    log.warn('FileUpload', 'No valid media files in drop');
    return { results: [], syntaxList: [] };
  }
  
  log.info('FileUpload', `Processing ${mediaFiles.length} dropped files`);
  
  const results: UploadResult[] = [];
  const syntaxList: string[] = [];
  
  for (let i = 0; i < mediaFiles.length; i++) {
    const file = mediaFiles[i];
    
    if (onProgress) {
      onProgress(i + 1, mediaFiles.length);
    }
    
    const result = await uploadMediaFile(file, options);
    results.push(result);
    
    if (result.success && result.path) {
      const syntax = getMediaSyntax(result.path, file.name);
      syntaxList.push(syntax);
    }
  }
  
  return { results, syntaxList };
}

export async function handleClipboardPaste(
  clipboardData: DataTransfer,
  options: UploadOptions
): Promise<{ result: UploadResult | null; syntax: string | null }> {
  const items = clipboardData.items;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      
      if (file) {
        log.info('FileUpload', `Processing pasted image: ${file.type}`);
        
        // Generate a name for pasted image
        const timestamp = Date.now();
        const ext = file.type.split('/')[1] || 'png';
        const fileName = `pasted-image-${timestamp}.${ext}`;
        
        const renamedFile = new File([file], fileName, { type: file.type });
        
        const result = await uploadMediaFile(renamedFile, {
          ...options,
          generateUniqueName: false,
        });
        
        if (result.success && result.path) {
          const syntax = getMediaSyntax(result.path, fileName);
          return { result, syntax };
        }
        
        return { result, syntax: null };
      }
    }
  }
  
  return { result: null, syntax: null };
}

export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  if (!isValidMediaType(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported types: images, videos, and audio files.`,
    };
  }
  
  if (!isValidFileSize(file.size)) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds maximum allowed size (${maxMB}MB).`,
    };
  }
  
  return { valid: true };
}
