import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Play, GripVertical, MoreVertical, Trash2, Heart } from 'lucide-react';
import type { PlaylistSong } from '@/hooks/usePlaylistSongs';
import { useFavorites } from '@/hooks/useFavorites';

interface SortablePlaylistItemProps {
  playlistSong: PlaylistSong;
  index: number;
  onPlay: () => void;
  onRemove: () => void;
}

export const SortablePlaylistItem: React.FC<SortablePlaylistItemProps> = ({
  playlistSong,
  index,
  onPlay,
  onRemove
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: playlistSong.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLiked = isFavorite(playlistSong.song.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Track number / Play button */}
      <div className="w-8 flex items-center justify-center">
        <span className="text-sm text-muted-foreground group-hover:hidden">
          {index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 hidden group-hover:flex hover:bg-primary hover:text-primary-foreground"
          onClick={onPlay}
        >
          <Play className="h-3 w-3 fill-current" />
        </Button>
      </div>

      {/* Album art */}
      <div className="w-12 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
        {playlistSong.song.cover_url ? (
          <img 
            src={playlistSong.song.cover_url} 
            alt={playlistSong.song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <div className="text-xs font-bold text-primary">
              {playlistSong.song.title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">
          {playlistSong.song.title}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {playlistSong.song.artist}
        </div>
      </div>

      {/* Duration */}
      <div className="text-sm text-muted-foreground hidden sm:block">
        {formatDuration(playlistSong.song.duration)}
      </div>

      {/* Favorite button */}
      <Button
        variant="ghost"
        size="icon"
        className={`w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity ${
          isLiked ? 'text-red-500 opacity-100' : 'hover:text-red-500'
        }`}
        onClick={() => toggleFavorite(playlistSong.song.id)}
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      </Button>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from playlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};