import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SongCard } from './SongCard';
import { SongListItem } from './SongListItem';
import { Song } from '@/types';
import { Search, Grid, List, Music, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SortOption = 'title' | 'artist' | 'created_at' | 'duration';
type ViewMode = 'grid' | 'list';

export function SongLibrary() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  
  const { actions: playerActions } = usePlayer();
  const { profile } = useAuth();
  const { toast } = useToast();

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    loadSongs();
  }, [showPendingOnly, isAdmin]);

  useEffect(() => {
    filterAndSortSongs();
  }, [songs, searchQuery, sortBy]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('songs')
        .select('*');

      if (showPendingOnly && isAdmin) {
        query = query.eq('approved', false);
      } else if (!isAdmin) {
        query = query.eq('approved', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform database results to match Song interface
      const transformedSongs = (data || []).map(song => ({
        ...song,
        audio_url: song.file_url,
        artwork_url: song.cover_url,
      }));
      
      setSongs(transformedSongs);
    } catch (error) {
      console.error('Error loading songs:', error);
      toast({
        title: "Error loading songs",
        description: "Failed to load the song library",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSongs = () => {
    let filtered = songs;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredSongs(filtered);
  };

  const handlePlaySong = (song: Song) => {
    playerActions.playSong(song, filteredSongs);
  };

  const handleApproveSong = async (songId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('songs')
        .update({ approved: true })
        .eq('id', songId);

      if (error) throw error;

      toast({
        title: "Song approved",
        description: "The song has been approved and is now publicly available",
      });

      loadSongs();
    } catch (error) {
      console.error('Error approving song:', error);
      toast({
        title: "Error approving song",
        description: "Failed to approve the song",
        variant: "destructive",
      });
    }
  };

  const handleRejectSong = async (songId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;

      toast({
        title: "Song rejected",
        description: "The song has been removed from the library",
      });

      loadSongs();
    } catch (error) {
      console.error('Error rejecting song:', error);
      toast({
        title: "Error rejecting song",
        description: "Failed to reject the song",
        variant: "destructive",
      });
    }
  };

  const pendingCount = songs.filter(song => !song.approved).length;
  const approvedCount = songs.filter(song => song.approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Music Library</h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all songs and pending uploads' : 'Discover and play music'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-green-500 shrink-0" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{approvedCount}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Approved Songs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{pendingCount}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{filteredSongs.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {searchQuery ? 'Filtered Results' : 'Total Shown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search songs, artists, or albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="artist">Artist A-Z</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
            
            {isAdmin && (
              <Button
                variant={showPendingOnly ? 'default' : 'outline'}
                onClick={() => setShowPendingOnly(!showPendingOnly)}
                className="whitespace-nowrap"
              >
                {showPendingOnly ? 'Show All' : 'Pending Only'}
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Songs Display */}
      {filteredSongs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No songs found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'No songs available in the library'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
        }`}>
          {filteredSongs.map((song) => (
            viewMode === 'grid' ? (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => handlePlaySong(song)}
                onApprove={isAdmin ? () => handleApproveSong(song.id) : undefined}
                onReject={isAdmin ? () => handleRejectSong(song.id) : undefined}
                showModerationActions={isAdmin && !song.approved}
              />
            ) : (
              <SongListItem
                key={song.id}
                song={song}
                onPlay={() => handlePlaySong(song)}
                onApprove={isAdmin ? () => handleApproveSong(song.id) : undefined}
                onReject={isAdmin ? () => handleRejectSong(song.id) : undefined}
                showModerationActions={isAdmin && !song.approved}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}