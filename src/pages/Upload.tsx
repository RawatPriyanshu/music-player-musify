import React from 'react';
import { SongUploadManager } from '@/components/upload/SongUploadManager';

const Upload = () => {
  return (
    <div className="container mx-auto px-4 py-8 pb-40 lg:pb-28 max-w-7xl">
      <SongUploadManager />
    </div>
  );
};

export default Upload;