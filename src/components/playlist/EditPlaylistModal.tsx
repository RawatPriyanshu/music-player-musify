import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Playlist } from '@/hooks/usePlaylists';

const editPlaylistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100, 'Name too long'),
  description: z.string().optional()
});

type EditPlaylistForm = z.infer<typeof editPlaylistSchema>;

interface EditPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: Playlist | null;
  onUpdatePlaylist: (playlistId: string, updates: { name?: string; description?: string }) => Promise<boolean>;
}

export const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({
  open,
  onOpenChange,
  playlist,
  onUpdatePlaylist
}) => {
  const form = useForm<EditPlaylistForm>({
    resolver: zodResolver(editPlaylistSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    if (playlist) {
      form.reset({
        name: playlist.name,
        description: playlist.description || ''
      });
    }
  }, [playlist, form]);

  const onSubmit = async (data: EditPlaylistForm) => {
    if (!playlist) return;
    
    const success = await onUpdatePlaylist(playlist.id, {
      name: data.name,
      description: data.description || undefined
    });
    
    if (success) {
      onOpenChange(false);
    }
  };

  if (!playlist) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Playlist</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playlist Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Awesome Playlist" 
                      {...field}
                      className="bg-input border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your playlist..."
                      rows={3}
                      {...field}
                      className="bg-input border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};