import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generateFileName } from '@/utils/fileValidator';
import type { SongMetadata } from '@/components/upload/MetadataForm';
import type { UploadProgressItem } from '@/components/upload/UploadProgress';
import { useToast } from '@/hooks/use-toast';

export interface UploadQueueItem {
  id: string;
  audioFile: File;
  metadata: SongMetadata;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function useSongUpload() {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const addToQueue = useCallback((audioFile: File, metadata: SongMetadata) => {
    const id = Math.random().toString(36).substring(2, 9);
    const queueItem: UploadQueueItem = {
      id,
      audioFile,
      metadata,
      status: 'pending',
      progress: 0,
    };

    setUploadQueue(prev => [...prev, queueItem]);
    return id;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setUploadQueue(prev => prev.map(item =>
      item.id === id ? { ...item, progress, status: 'uploading' as const } : item
    ));
  }, []);

  const markAsError = useCallback((id: string, error: string) => {
    setUploadQueue(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'error' as const, error } : item
    ));
  }, []);

  const markAsSuccess = useCallback((id: string) => {
    setUploadQueue(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'success' as const, progress: 100 } : item
    ));
  }, []);

  const uploadSong = useCallback(async (queueItem: UploadQueueItem): Promise<boolean> => {
    if (!user) {
      markAsError(queueItem.id, 'User not authenticated');
      return false;
    }

    try {
      updateProgress(queueItem.id, 10);

      // Upload audio file
      const audioFileName = generateFileName(queueItem.audioFile.name, user.id);
      const { data: audioUpload, error: audioError } = await supabase.storage
        .from('songs')
        .upload(audioFileName, queueItem.audioFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (audioError) {
        throw new Error(`Audio upload failed: ${audioError.message}`);
      }

      updateProgress(queueItem.id, 50);

      // Upload cover image if provided
      let coverUrl: string | undefined;
      let coverFileName: string | undefined;
      if (queueItem.metadata.coverImage) {
        coverFileName = generateFileName(queueItem.metadata.coverImage.name, user.id);
        const { data: coverUpload, error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverFileName, queueItem.metadata.coverImage, {
            cacheControl: '3600',
            upsert: false,
          });

        if (coverError) {
          console.warn('Cover upload failed:', coverError.message);
        } else {
          const { data: coverUrlData } = supabase.storage
            .from('covers')
            .getPublicUrl(coverUpload.path);
          coverUrl = coverUrlData.publicUrl;
        }
      }

      updateProgress(queueItem.id, 80);

      // Get audio file URL
      const { data: audioUrlData } = supabase.storage
        .from('songs')
        .getPublicUrl(audioUpload.path);

      // Save to database
      const { error: dbError } = await supabase
        .from('songs')
        .insert({
          title: queueItem.metadata.title,
          artist: queueItem.metadata.artist,
          album: queueItem.metadata.album,
          duration: queueItem.metadata.duration || 0,
          file_url: audioUrlData.publicUrl,
          cover_url: coverUrl,
          uploader_id: user.id,
          approved: false, // Requires admin approval
        });

      if (dbError) {
        // Clean up uploaded files if database insert fails
        await supabase.storage.from('songs').remove([audioUpload.path]);
        if (coverFileName) {
          await supabase.storage.from('covers').remove([coverFileName]);
        }
        throw new Error(`Database error: ${dbError.message}`);
      }

      updateProgress(queueItem.id, 100);
      markAsSuccess(queueItem.id);

      toast({
        title: "Upload successful!",
        description: `"${queueItem.metadata.title}" has been uploaded and is pending approval.`,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      markAsError(queueItem.id, errorMessage);
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [user, updateProgress, markAsError, markAsSuccess, toast]);

  const processQueue = useCallback(async () => {
    if (isUploading) return;

    const pendingItems = uploadQueue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsUploading(true);

    // Process uploads sequentially to avoid overwhelming the server
    for (const item of pendingItems) {
      await uploadSong(item);
    }

    setIsUploading(false);
  }, [uploadQueue, isUploading, uploadSong]);

  // Auto-process queue when new items are added
  useEffect(() => {
    const pendingItems = uploadQueue.filter(item => item.status === 'pending');
    if (pendingItems.length > 0 && !isUploading) {
      processQueue();
    }
  }, [uploadQueue, isUploading, processQueue]);

  const retryUpload = useCallback(async (id: string) => {
    const item = uploadQueue.find(item => item.id === id);
    if (!item) return;

    // Reset status and retry
    setUploadQueue(prev => prev.map(queueItem =>
      queueItem.id === id 
        ? { ...queueItem, status: 'pending', progress: 0, error: undefined }
        : queueItem
    ));

    // Process the queue
    setTimeout(() => processQueue(), 100);
  }, [uploadQueue, processQueue]);

  const clearCompleted = useCallback(() => {
    setUploadQueue(prev => prev.filter(item => 
      item.status !== 'success' && item.status !== 'error'
    ));
  }, []);

  // Convert queue to progress format
  const progressItems: UploadProgressItem[] = uploadQueue.map(item => ({
    id: item.id,
    fileName: item.audioFile.name,
    progress: item.progress,
    status: item.status,
    error: item.error,
  }));

  return {
    uploadQueue,
    progressItems,
    isUploading,
    addToQueue,
    removeFromQueue,
    processQueue,
    retryUpload,
    clearCompleted,
  };
}