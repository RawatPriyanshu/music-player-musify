import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { validateAudioFile, validateImageFile, formatFileSize } from '@/utils/fileValidator';
import { cn } from '@/lib/utils';

export interface UploadFile {
  id: string;
  file: File;
  type: 'audio' | 'image';
  isValid: boolean;
  error?: string;
}

interface UploadZoneProps {
  onFilesAdded: (files: UploadFile[]) => void;
  maxFiles?: number;
  acceptAudio?: boolean;
  acceptImages?: boolean;
  className?: string;
  autoUpload?: boolean; // Automatically upload files when selected
}

export function UploadZone({ 
  onFilesAdded, 
  maxFiles = 10, 
  acceptAudio = true, 
  acceptImages = true,
  className,
  autoUpload = false
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const newUploadFiles: UploadFile[] = [];

    files.forEach((file) => {
      const id = Math.random().toString(36).substring(2, 9);
      let type: 'audio' | 'image';
      let validation;

      if (file.type.startsWith('audio/')) {
        if (!acceptAudio) return;
        type = 'audio';
        validation = validateAudioFile(file);
      } else if (file.type.startsWith('image/')) {
        if (!acceptImages) return;
        type = 'image';
        validation = validateImageFile(file);
      } else {
        return; // Skip unsupported file types
      }

      newUploadFiles.push({
        id,
        file,
        type,
        isValid: validation.isValid,
        error: validation.error,
      });
    });

    const totalFiles = selectedFiles.length + newUploadFiles.length;
    if (totalFiles > maxFiles) {
      // Truncate to max files
      const allowedCount = maxFiles - selectedFiles.length;
      newUploadFiles.splice(allowedCount);
    }

    setSelectedFiles(prev => [...prev, ...newUploadFiles]);
    
    // Auto-upload if enabled and files are valid
    if (autoUpload && newUploadFiles.some(f => f.isValid)) {
      setTimeout(() => {
        const validFiles = newUploadFiles.filter(f => f.isValid);
        onFilesAdded(validFiles);
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 100);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = () => {
    const validFiles = selectedFiles.filter(f => f.isValid);
    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getAcceptedTypes = () => {
    const types = [];
    if (acceptAudio) types.push('.mp3', '.wav', 'audio/*');
    if (acceptImages) types.push('.jpg', '.jpeg', '.png', '.webp', 'image/*');
    return types.join(',');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            Drop your files here
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {acceptAudio && acceptImages && "Upload audio files (MP3, WAV) or cover images (JPG, PNG)"}
            {acceptAudio && !acceptImages && "Upload audio files (MP3, WAV)"}
            {!acceptAudio && acceptImages && "Upload images (JPG, PNG, WebP)"}
          </p>
          
          <p className="text-sm text-muted-foreground mb-4">
            Maximum file size: {acceptAudio ? '50MB for audio, ' : ''}
            {acceptImages ? '5MB for images' : ''}
          </p>
          
          <Button type="button" variant="outline">
            Browse Files
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={getAcceptedTypes()}
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">
                Selected Files ({selectedFiles.length}/{maxFiles})
              </h4>
              
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                >
                  Clear All
                </Button>
                
                <Button 
                  size="sm"
                  onClick={handleUpload}
                  disabled={!selectedFiles.some(f => f.isValid)}
                >
                  Upload Files
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {selectedFiles.map((uploadFile) => (
                <div 
                  key={uploadFile.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    uploadFile.isValid 
                      ? "border-border bg-background" 
                      : "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      uploadFile.type === 'audio' 
                        ? "bg-primary/10 text-primary" 
                        : "bg-secondary/10 text-secondary"
                    )}>
                      {uploadFile.type === 'audio' ? (
                        <Music className="w-4 h-4" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)} • {uploadFile.type}
                      </p>
                      {uploadFile.error && (
                        <p className="text-xs text-destructive mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}