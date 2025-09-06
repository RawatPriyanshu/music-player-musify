import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadZone } from './UploadZone';
import { MetadataForm } from './MetadataForm';
import { UploadProgress } from './UploadProgress';
import { useSongUpload } from '@/hooks/useSongUpload';
import type { UploadFile } from './UploadZone';
import type { SongMetadata } from './MetadataForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileUploadZone } from '@/components/mobile/MobileUploadZone';
import { Music, Upload, Clock } from 'lucide-react';

export function SongUploadManager() {
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'metadata'>('upload');
  const isMobile = useIsMobile();
  
  const {
    progressItems,
    isUploading,
    addToQueue,
    removeFromQueue,
    processQueue,
    processQueueItem,
    retryUpload,
    clearCompleted,
  } = useSongUpload();

  const handleFilesAdded = (files: UploadFile[]) => {
    const audioFile = files.find(f => f.type === 'audio' && f.isValid);
    if (audioFile) {
      setSelectedAudioFile(audioFile.file);
      setCurrentStep('metadata');
    }
  };

  const handleMetadataSubmit = async (metadata: SongMetadata) => {
    console.log('handleMetadataSubmit called with metadata:', metadata);
    
    if (!selectedAudioFile) {
      console.error('No selected audio file');
      return;
    }

    console.log('Adding to queue and processing directly...');
    // Add to upload queue and process immediately
    const id = addToQueue(selectedAudioFile, metadata);
    console.log('Added to queue with id:', id);
    
    // Process the specific item directly to avoid React state timing issues
    const queueItem = {
      id,
      audioFile: selectedAudioFile,
      metadata,
      status: 'pending' as const,
      progress: 0,
    };
    
    console.log('Starting direct processing...');
    await processQueueItem(queueItem);
    console.log('Processing completed');
    
    // Reset form after upload
    setSelectedAudioFile(null);
    setCurrentStep('upload');
  };

  const handleCancel = () => {
    setSelectedAudioFile(null);
    setCurrentStep('upload');
  };

  const completedUploads = progressItems.filter(item => item.status === 'success').length;
  const failedUploads = progressItems.filter(item => item.status === 'error').length;
  const pendingUploads = progressItems.filter(item => 
    item.status === 'pending' || item.status === 'uploading'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Upload Music</h2>
          <p className="text-muted-foreground">
            Share your music with the community
          </p>
        </div>
        
        {progressItems.length > 0 && (
          <Button
            variant="outline"
            onClick={clearCompleted}
            disabled={isUploading}
          >
            Clear Completed
          </Button>
        )}
      </div>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger 
            value="metadata" 
            disabled={!selectedAudioFile}
            className="flex items-center gap-2"
          >
            <Music className="w-4 h-4" />
            Song Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <UploadZone
            onFilesAdded={handleFilesAdded}
            maxFiles={1}
            acceptAudio={true}
            acceptImages={false}
          />
          
          {/* Upload Statistics */}
          {progressItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{pendingUploads}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{progressItems.length}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{completedUploads}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-destructive rounded-full" />
                    <div>
                      <p className="text-2xl font-bold">{failedUploads}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="metadata">
          {selectedAudioFile && (
            <MetadataForm
              audioFile={selectedAudioFile}
              onSubmit={handleMetadataSubmit}
              onCancel={handleCancel}
              isLoading={isUploading}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Progress */}
      {progressItems.length > 0 && (
        <UploadProgress
          uploads={progressItems}
          onRetry={retryUpload}
          onCancel={removeFromQueue}
        />
      )}
    </div>
  );
}