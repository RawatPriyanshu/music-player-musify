import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Song } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Play, Check, X, Trash2, Music, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

const SongModeration = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, searchTerm, statusFilter]);

  const loadSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*, audio_url:file_url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error loading songs:', error);
      toast({
        title: "Error",
        description: "Failed to load songs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSongs = () => {
    let filtered = songs;

    if (statusFilter === 'pending') {
      filtered = filtered.filter(song => !song.approved);
    } else if (statusFilter === 'approved') {
      filtered = filtered.filter(song => song.approved);
    }

    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSongs(filtered);
  };

  const handleSongAction = async (songId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        const { error } = await supabase
          .from('songs')
          .update({ approved: true })
          .eq('id', songId);

        if (error) throw error;

        setSongs(prev => prev.map(song => 
          song.id === songId ? { ...song, approved: true } : song
        ));

        toast({
          title: "Success",
          description: "Song approved successfully",
        });
      } else {
        const { error } = await supabase
          .from('songs')
          .delete()
          .eq('id', songId);

        if (error) throw error;

        setSongs(prev => prev.filter(song => song.id !== songId));

        toast({
          title: "Success",
          description: "Song rejected and removed",
        });
      }
    } catch (error) {
      console.error('Error processing song:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} song`,
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedSongs.size === 0) return;

    try {
      const songIds = Array.from(selectedSongs);
      
      if (action === 'approve') {
        const { error } = await supabase
          .from('songs')
          .update({ approved: true })
          .in('id', songIds);

        if (error) throw error;

        setSongs(prev => prev.map(song => 
          songIds.includes(song.id) ? { ...song, approved: true } : song
        ));

        toast({
          title: "Success",
          description: `${songIds.length} songs approved`,
        });
      } else {
        const { error } = await supabase
          .from('songs')
          .delete()
          .in('id', songIds);

        if (error) throw error;

        setSongs(prev => prev.filter(song => !songIds.includes(song.id)));

        toast({
          title: "Success",
          description: `${songIds.length} songs rejected and removed`,
        });
      }

      setSelectedSongs(new Set());
    } catch (error) {
      console.error('Error processing bulk action:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} selected songs`,
        variant: "destructive",
      });
    }
  };

  const toggleSongSelection = (songId: string) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else {
      newSelected.add(songId);
    }
    setSelectedSongs(newSelected);
  };

  const selectAllSongs = () => {
    if (selectedSongs.size === filteredSongs.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(new Set(filteredSongs.map(song => song.id)));
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCount = songs.filter(song => !song.approved).length;
  const approvedCount = songs.filter(song => song.approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Song Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate user-uploaded content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Songs</p>
                <p className="text-2xl font-bold">{songs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Songs ({filteredSongs.length})</CardTitle>
          <CardDescription>
            Manage song approvals and content moderation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by title or artist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Songs</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedSongs.size > 0 && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedSongs.size} song{selectedSongs.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleBulkAction('approve')}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve All
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('reject')}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject All
                </Button>
              </div>
            </div>
          )}

          {/* Songs List */}
          <div className="space-y-4">
            {filteredSongs.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedSongs.size === filteredSongs.length}
                  onCheckedChange={selectAllSongs}
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </div>
            )}

            {filteredSongs.map((song) => (
              <div key={song.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                <Checkbox
                  checked={selectedSongs.has(song.id)}
                  onCheckedChange={() => toggleSongSelection(song.id)}
                />
                
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{song.title}</h3>
                    <Badge variant={song.approved ? 'default' : 'secondary'}>
                      {song.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(song.duration)}
                    </span>
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Uploaded {formatDate(song.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedSong(song)}>
                        <Play className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Song Preview</DialogTitle>
                        <DialogDescription>
                          Review song details and listen to preview
                        </DialogDescription>
                      </DialogHeader>
                      {selectedSong && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Title</label>
                              <p className="text-sm text-muted-foreground">{selectedSong.title}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Artist</label>
                              <p className="text-sm text-muted-foreground">{selectedSong.artist}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Duration</label>
                              <p className="text-sm text-muted-foreground">
                                {formatDuration(selectedSong.duration)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Badge variant={selectedSong.approved ? 'default' : 'secondary'}>
                                {selectedSong.approved ? 'Approved' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                          
          <div>
            <label className="text-sm font-medium">Audio Preview</label>
            <audio controls className="w-full mt-2">
              <source src={selectedSong.audio_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

                          {!selectedSong.approved && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  handleSongAction(selectedSong.id, 'approve');
                                  setSelectedSong(null);
                                }}
                                className="flex-1"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  handleSongAction(selectedSong.id, 'reject');
                                  setSelectedSong(null);
                                }}
                                className="flex-1"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {!song.approved && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleSongAction(song.id, 'approve')}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSongAction(song.id, 'reject')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredSongs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No songs found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SongModeration;