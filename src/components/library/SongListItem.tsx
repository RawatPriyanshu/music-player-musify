import React, { useState } from 'react';
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

interface SongListItemProps {
  song: Song;
  onPlay: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showModerationActions?: boolean;
}

export function SongListItem({ 
  song, 
  onPlay, 
  onApprove, 
  onReject, 
  showModerationActions = false 
}: SongListItemProps) {
  const { state } = usePlayer();
  const [imageError, setImageError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { createPlaylist } = usePlaylists();

  const isCurrentSong = state.currentSong?.id === song.id;
  const isPlaying = isCurrentSong && state.isPlaying;

  return (
    <div className={cn(
      "flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group",
      isCurrentSong && "bg-accent border border-primary/20"
    )}>
      {/* Play Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPlay}
        className={cn(
          "h-8 w-8 p-0 rounded-full",
          isCurrentSong && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      {/* Album Art */}
      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {song.cover_url && !imageError ? (
          <img
            src={song.cover_url}
            alt={`${song.title} cover`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {song.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">
            {song.title}
          </h3>
          {!song.approved && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {song.artist}
          {song.album && ` • ${song.album}`}
        </p>
      </div>

      {/* Duration */}
      <div className="text-sm text-muted-foreground tabular-nums">
        {formatDuration(song.duration)}
      </div>

      {/* Moderation Actions */}
      {showModerationActions && (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={onApprove}
            className="h-7 px-2 text-xs"
          >
            <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            className="h-7 px-2 text-xs"
          >
            <XCircle className="w-3 h-3 mr-1 text-red-600" />
            Reject
          </Button>
        </div>
      )}

      {/* Action Menu */}
      <div className="flex items-center space-x-2">
        {!showModerationActions && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => toggleFavorite(song.id)}
          >
            <Heart className={cn("h-4 w-4", isFavorite(song.id) && "fill-red-500 text-red-500")} />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
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
      
      <CreatePlaylistModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreatePlaylist={createPlaylist}
      />
    </div>
  );
}