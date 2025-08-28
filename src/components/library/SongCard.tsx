import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song } from '@/types';
import { 
  Play, 
  Pause, 
  MoreVertical, 
  Heart, 
  ListPlus, 
  Download, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { formatDuration } from '@/utils/fileValidator';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { AddToPlaylistDropdown } from '@/components/playlist/AddToPlaylistDropdown';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import { usePlaylists } from '@/hooks/usePlaylists';

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showModerationActions?: boolean;
}

export function SongCard({ 
  song, 
  onPlay, 
  onApprove, 
  onReject, 
  showModerationActions = false 
}: SongCardProps) {
  const { state } = usePlayer();
  const [imageError, setImageError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { createPlaylist } = usePlaylists();

  const isCurrentSong = state.currentSong?.id === song.id;
  const isPlaying = isCurrentSong && state.isPlaying;

  return (
    <Card className={cn(
      "group transition-all duration-200 hover:shadow-lg cursor-pointer",
      isCurrentSong && "ring-2 ring-primary"
    )}>
      <CardContent className="p-4">
        {/* Cover Art */}
        <div className="relative mb-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            {song.artwork_url && !imageError ? (
              <img
                src={song.artwork_url}
                alt={`${song.title} cover`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {song.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
            <Button
              size="sm"
              onClick={onPlay}
              className={cn(
                "h-12 w-12 rounded-full shadow-lg transition-all",
                "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100",
                isCurrentSong && "opacity-100 scale-100"
              )}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          </div>
          
          {/* Status Badge */}
          {!song.approved && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-orange-100 text-orange-800"
            >
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>

        {/* Song Info */}
        <div className="space-y-1 mb-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {song.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {song.artist}
          </p>
          {song.album && (
            <p className="text-xs text-muted-foreground/80 line-clamp-1">
              {song.album}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDuration(song.duration)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {showModerationActions ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onApprove}
                className="h-8 px-2 text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onReject}
                className="h-8 px-2 text-xs"
              >
                <XCircle className="w-3 h-3 mr-1 text-red-600" />
                Reject
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => toggleFavorite(song.id)}
            >
              <Heart className={cn("w-4 h-4", isFavorite(song.id) && "fill-red-500 text-red-500")} />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPlay}>
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </DropdownMenuItem>
              <AddToPlaylistDropdown 
                songId={song.id} 
                onCreateNewPlaylist={() => setShowCreateModal(true)} 
              />
              <DropdownMenuItem onClick={() => toggleFavorite(song.id)}>
                <Heart className={cn("w-4 h-4 mr-2", isFavorite(song.id) && "fill-red-500 text-red-500")} />
                {isFavorite(song.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      
      <CreatePlaylistModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreatePlaylist={createPlaylist}
      />
    </Card>
  );
}