import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, ListPlus } from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';
import { usePlaylistSongs } from '@/hooks/usePlaylistSongs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddToPlaylistDropdownProps {
  songId: string;
  onCreateNewPlaylist: () => void;
}

export const AddToPlaylistDropdown: React.FC<AddToPlaylistDropdownProps> = ({
  songId,
  onCreateNewPlaylist
}) => {
  const { playlists } = usePlaylists();
  const { addSongToPlaylist } = usePlaylistSongs(null);

  const handleAddToPlaylist = async (playlistId: string) => {
    // We'll create a temporary hook for this specific playlist
    const { error } = await supabase
      .from('playlist_songs')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)
      .maybeSingle();

    if (!error) {
      toast.error('Song is already in this playlist');
      return;
    }

    // Get the highest position in the playlist
    const { data: maxPosition } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (maxPosition?.[0]?.position || 0) + 1;

    const { error: insertError } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId,
        position: nextPosition
      });

    if (!insertError) {
      toast.success('Song added to playlist');
    } else {
      toast.error('Failed to add song to playlist');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <ListPlus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuItem onClick={onCreateNewPlaylist}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Playlist
        </DropdownMenuItem>
        
        {playlists.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {playlists.map((playlist) => (
              <DropdownMenuItem
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/40 rounded flex items-center justify-center text-xs font-bold text-primary">
                    {playlist.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{playlist.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {playlist.song_count || 0} songs
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};