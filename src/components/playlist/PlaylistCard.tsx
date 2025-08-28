import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Play, MoreVertical, Edit, Trash2, Copy, Share2 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import type { Playlist } from '@/hooks/usePlaylists';

interface PlaylistCardProps {
  playlist: Playlist & { 
    song_count?: number; 
    total_duration?: number;
    is_public?: boolean;
  };
  onEdit: (playlist: Playlist) => void;
  onDelete: (playlistId: string) => void;
  onDuplicate: (playlistId: string) => void;
  onShare: (playlistId: string, isPublic: boolean) => void;
  onClick: (playlistId: string) => void;
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onClick
}) => {
  const { actions } = usePlayer();

  const handlePlayPlaylist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement play playlist functionality
    console.log('Playing playlist:', playlist.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6" onClick={() => onClick(playlist.id)}>
        <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg mb-4 relative overflow-hidden">
          {playlist.cover_url ? (
            <img 
              src={playlist.cover_url} 
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl font-bold text-primary/60">
                {playlist.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
              onClick={handlePlayPlaylist}
            >
              <Play className="h-6 w-6 text-primary-foreground fill-current" />
            </Button>
          </div>

          {/* Dropdown menu */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(playlist);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(playlist.id);
                }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onShare(playlist.id, playlist.is_public || false);
                }}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {playlist.is_public ? 'Make Private' : 'Make Public'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(playlist.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground truncate">{playlist.name}</h3>
          {playlist.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{playlist.song_count || 0} songs</span>
            <span>{formatDuration(playlist.total_duration || 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};