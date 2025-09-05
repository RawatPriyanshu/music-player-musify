import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { extractAudioMetadata, formatDuration } from '@/utils/fileValidator';
import { UploadZone } from './UploadZone';
import type { UploadFile } from './UploadZone';

export interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  coverImage?: File;
}

interface MetadataFormProps {
  audioFile: File;
  onSubmit: (metadata: SongMetadata) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MetadataForm({ audioFile, onSubmit, onCancel, isLoading }: MetadataFormProps) {
  const [metadata, setMetadata] = useState<SongMetadata>({
    title: '',
    artist: '',
    album: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [extractedDuration, setExtractedDuration] = useState<number | null>(null);

  useEffect(() => {
    // Extract metadata from audio file
    const loadMetadata = async () => {
      try {
        const extracted = await extractAudioMetadata(audioFile);
        
        // Set initial form values based on filename and extracted data
        const nameWithoutExt = audioFile.name.replace(/\.[^/.]+$/, '');
        const parts = nameWithoutExt.split(' - ');
        
        setMetadata({
          title: parts.length > 1 ? parts[1] : nameWithoutExt,
          artist: parts.length > 1 ? parts[0] : '',
          album: extracted.album || '',
          duration: extracted.duration,
        });
        
        if (extracted.duration) {
          setExtractedDuration(extracted.duration);
        }
      } catch (error) {
        console.error('Failed to extract metadata:', error);
        // Set fallback values
        const nameWithoutExt = audioFile.name.replace(/\.[^/.]+$/, '');
        setMetadata({
          title: nameWithoutExt,
          artist: '',
          album: '',
        });
      }
    };

    loadMetadata();
  }, [audioFile]);

  const handleInputChange = (field: keyof SongMetadata, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCoverImageAdd = (files: UploadFile[]) => {
    const imageFile = files.find(f => f.type === 'image' && f.isValid);
    if (imageFile) {
      setCoverImage(imageFile.file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metadata.title.trim() || !metadata.artist.trim()) {
      return;
    }

    const finalMetadata: SongMetadata = {
      ...metadata,
      title: metadata.title.trim(),
      artist: metadata.artist.trim(),
      album: metadata.album?.trim() || undefined,
      duration: extractedDuration || undefined,
      coverImage: coverImage || undefined,
    };

    onSubmit(finalMetadata);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Song Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add information about your song: {audioFile.name}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Song Title *</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter song title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="artist">Artist *</Label>
                <Input
                  id="artist"
                  value={metadata.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                  placeholder="Enter artist name"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="album">Album (Optional)</Label>
              <Input
                id="album"
                value={metadata.album || ''}
                onChange={(e) => handleInputChange('album', e.target.value)}
                placeholder="Enter album name"
              />
            </div>
            
            {extractedDuration && (
              <div>
                <Label>Duration</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatDuration(extractedDuration)}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Cover Image Upload */}
          <div className="space-y-4">
            <div>
              <Label>Cover Image (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a cover image for your song
              </p>
            </div>
            
            {coverImage ? (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{coverImage.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCoverImage(null)}
                    className="mt-1"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <UploadZone
                onFilesAdded={handleCoverImageAdd}
                maxFiles={1}
                acceptAudio={false}
                acceptImages={true}
                className="max-w-md"
                autoUpload={true}
              />
            )}
          </div>

          <Separator />

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={!metadata.title.trim() || !metadata.artist.trim() || isLoading}
            >
              {isLoading ? 'Uploading...' : `Upload Song${coverImage ? ' with Cover' : ''}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}