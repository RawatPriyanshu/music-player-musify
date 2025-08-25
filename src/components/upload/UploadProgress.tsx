import React from 'react';
import { CheckCircle, XCircle, Loader2, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UploadProgressItem {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadProgressProps {
  uploads: UploadProgressItem[];
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  className?: string;
}

export function UploadProgress({ uploads, onRetry, onCancel, className }: UploadProgressProps) {
  if (uploads.length === 0) return null;

  const getStatusIcon = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border border-muted-foreground rounded-full" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return 'text-muted-foreground';
      case 'uploading':
        return 'text-primary';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-destructive';
    }
  };

  const completedCount = uploads.filter(u => u.status === 'success').length;
  const totalCount = uploads.length;
  const hasErrors = uploads.some(u => u.status === 'error');

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium flex items-center gap-2">
            <Music className="w-4 h-4" />
            Upload Progress ({completedCount}/{totalCount})
          </h4>
          
          {hasErrors && onRetry && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                uploads
                  .filter(u => u.status === 'error')
                  .forEach(u => onRetry(u.id));
              }}
            >
              Retry Failed
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {uploads.map((upload) => (
            <div key={upload.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {getStatusIcon(upload.status)}
                  <span className="text-sm font-medium truncate">
                    {upload.fileName}
                  </span>
                  <span className={cn("text-xs capitalize", getStatusColor(upload.status))}>
                    {upload.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {upload.status === 'uploading' && (
                    <span className="text-xs text-muted-foreground">
                      {upload.progress}%
                    </span>
                  )}
                  
                  {upload.status === 'error' && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(upload.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Retry
                    </Button>
                  )}
                  
                  {(upload.status === 'pending' || upload.status === 'uploading') && onCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(upload.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              
              {upload.status === 'uploading' && (
                <Progress value={upload.progress} className="h-1" />
              )}
              
              {upload.error && (
                <p className="text-xs text-destructive ml-6">
                  {upload.error}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {/* Overall Progress */}
        {totalCount > 1 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} completed
              </span>
            </div>
            <Progress 
              value={(completedCount / totalCount) * 100} 
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}