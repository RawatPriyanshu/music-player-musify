import React from 'react';
import { SongLibrary } from '@/components/library/SongLibrary';

const Library = () => {
  return (
    <div className="container mx-auto px-4 py-8 pb-40 lg:pb-28 max-w-7xl">
      <SongLibrary />
    </div>
  );
};

export default Library;