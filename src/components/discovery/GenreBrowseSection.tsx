import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music2, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface GenreData {
  genre: string;
  count: number;
  color: string;
}

const GENRE_COLORS = [
  'bg-gradient-to-br from-purple-500 to-pink-500',
  'bg-gradient-to-br from-blue-500 to-cyan-500', 
  'bg-gradient-to-br from-green-500 to-emerald-500',
  'bg-gradient-to-br from-orange-500 to-red-500',
  'bg-gradient-to-br from-indigo-500 to-purple-500',
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-teal-500 to-green-500',
  'bg-gradient-to-br from-yellow-500 to-orange-500',
];


export const GenreBrowseSection = () => {
  const [genres, setGenres] = useState<GenreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      // Get popular artists (we'll use this as genres for now)
      const { data: songs } = await supabase
        .from('songs')
        .select('artist')
        .eq('approved', true);

      if (songs) {
        // Count occurrences of each artist/genre
        const genreCounts = songs.reduce((acc, song) => {
          const genre = song.artist;
          acc[genre] = (acc[genre] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Convert to array and sort by count
        const sortedGenres = Object.entries(genreCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([genre, count], index) => ({
            genre,
            count,
            color: GENRE_COLORS[index % GENRE_COLORS.length]
          }));

        setGenres(sortedGenres);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreClick = (genre: string) => {
    navigate(`/search?q=${encodeURIComponent(genre)}`);
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="w-5 h-5" />
              Browse by Artist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Browse by Artist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            Browse by Artist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.genre}
                className={`${genre.color} aspect-square rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform flex flex-col justify-between text-white`}
                onClick={() => handleGenreClick(genre.genre)}
              >
                <div>
                  <h3 className="font-bold text-lg truncate">{genre.genre}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white border-none">
                    {genre.count} songs
                  </Badge>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};