import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, Music, Image, X, CheckCircle } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils';

interface MobileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  className?: string;
}

export const MobileUploadZone: React.FC<MobileUploadZoneProps> = ({
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  className
}) => {
  const { impact, notification } = useHapticFeedback();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNative = Capacitor.isNativePlatform();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      ['.mp3', '.wav', '.flac', '.m4a', '.ogg'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
    );

    if (audioFiles.length > 0) {
      setSelectedFiles(audioFiles);
      onFileSelect(audioFiles);
      impact('medium');
      notification('success');
    }
  };

  const handleCameraCapture = async () => {
    if (!isNative) return;

    try {
      impact('light');
      
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      // For demo purposes - in a real app you'd process the image
      notification('success');
    } catch (error) {
      console.error('Camera capture failed:', error);
    }
  };

  const handleGalleryPick = async () => {
    if (!isNative) {
      fileInputRef.current?.click();
      return;
    }

    try {
      impact('light');
      
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      notification('success');
    } catch (error) {
      console.error('Gallery pick failed:', error);
    }
  };

  const removeFile = (index: number) => {
    impact('light');
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <Card
        className={cn(
          "border-2 border-dashed border-border transition-colors p-8 text-center",
          dragActive && "border-primary bg-primary/5",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Music className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload Your Music</h3>
            <p className="text-sm text-muted-foreground">
              Drop files here or tap to browse
            </p>
          </div>

          {/* Mobile-specific buttons */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {isNative && (
              <Button
                variant="outline"
                onClick={handleCameraCapture}
                disabled={isUploading}
                className="h-12 flex flex-col gap-1"
              >
                <Camera className="h-5 w-5" />
                <span className="text-xs">Camera</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleGalleryPick}
              disabled={isUploading}
              className="h-12 flex flex-col gap-1"
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs">Browse</span>
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        </Card>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && !isUploading && (
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Music className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};