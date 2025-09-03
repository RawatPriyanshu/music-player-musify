export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
}

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateAudioFile(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only MP3 and WAV files are allowed.',
    };
  }

  // Check file size
  if (file.size > MAX_AUDIO_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds 50MB limit.',
    };
  }

  return { isValid: true };
}

export function validateImageFile(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid image type. Only JPEG, PNG, and WebP files are allowed.',
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: 'Image size exceeds 5MB limit.',
    };
  }

  return { isValid: true };
}

export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.onloadedmetadata = () => {
      const metadata: AudioMetadata = {
        duration: Math.round(audio.duration),
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    
    audio.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  // Clean the filename to remove special characters that might cause issues
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
  
  return `${userId}/${timestamp}_${random}_${cleanName}.${extension}`;
}