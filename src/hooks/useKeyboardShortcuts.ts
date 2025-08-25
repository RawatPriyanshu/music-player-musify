import { useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

export function useKeyboardShortcuts() {
  const { state, actions } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (state.currentSong) {
            if (state.isPlaying) {
              actions.pauseSong();
            } else {
              actions.resumeSong();
            }
          }
          break;

        case 'ArrowRight':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            actions.nextSong();
          }
          break;

        case 'ArrowLeft':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            actions.previousSong();
          }
          break;

        case 'ArrowUp':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const newVolume = Math.min(100, state.volume + 5);
            actions.setVolume(newVolume);
          }
          break;

        case 'ArrowDown':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const newVolume = Math.max(0, state.volume - 5);
            actions.setVolume(newVolume);
          }
          break;

        case 'KeyS':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            actions.toggleShuffle();
          }
          break;

        case 'KeyR':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            actions.cycleRepeatMode();
          }
          break;

        case 'KeyM':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (state.volume === 0) {
              actions.setVolume(75);
            } else {
              actions.setVolume(0);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isPlaying, state.currentSong, state.volume, actions]);
}