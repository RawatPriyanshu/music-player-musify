import { useAuth } from '@/hooks/useAuth';
import { TrendingSection } from '@/components/discovery/TrendingSection';
import { RecentlyAddedSection } from '@/components/discovery/RecentlyAddedSection';
import { RecommendedSection } from '@/components/discovery/RecommendedSection';
import { GenreBrowseSection } from '@/components/discovery/GenreBrowseSection';
import { RandomDiscoverySection } from '@/components/discovery/RandomDiscoverySection';
import { Music, TrendingUp, Clock, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalSongs: 0,
    playlists: 0,
    favorites: 0,
    listeningTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id) return;
      
      try {
        // Fetch total approved songs
        const { count: totalSongs } = await supabase
          .from('songs')
          .select('*', { count: 'exact', head: true })
          .eq('approved', true);

        // Fetch user's playlists count
        const { count: playlists } = await supabase
          .from('playlists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        // Fetch user's favorites count
        const { count: favorites } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        // Calculate listening time from user's favorites (duration in seconds, convert to hours)
        const { data: favoritesSongs } = await supabase
          .from('favorites')
          .select(`
            songs:song_id (
              duration
            )
          `)
          .eq('user_id', profile.id);

        const totalDuration = favoritesSongs?.reduce((acc, fav: any) => {
          return acc + (fav.songs?.duration || 0);
        }, 0) || 0;

        const listeningTimeHours = Math.round(totalDuration / 3600);

        setStats({
          totalSongs: totalSongs || 0,
          playlists: playlists || 0,
          favorites: favorites || 0,
          listeningTime: listeningTimeHours
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile?.id]);

  return (
    <div className="bg-background">
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {profile?.username || 'Music Lover'}!
            </h1>
            <p className="text-muted-foreground">
              Discover new music and enjoy your favorite tracks
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats.totalSongs.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available on platform
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Playlists</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats.playlists}
                </div>
                <p className="text-xs text-muted-foreground">
                  Personal collections
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Listening Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : `${stats.listeningTime}h`}
                </div>
                <p className="text-xs text-muted-foreground">
                  From your favorites
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Favorites</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats.favorites}
                </div>
                <p className="text-xs text-muted-foreground">
                  Loved tracks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Music Discovery Sections */}
          <div className="space-y-8">
            <TrendingSection />
            <RecentlyAddedSection />
            <RecommendedSection />
            <GenreBrowseSection />
            <RandomDiscoverySection />
          </div>

          {/* Admin Section */}
          {profile?.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Admin Panel</CardTitle>
                <CardDescription>Administrative controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium mb-2">User Management</h3>
                    <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium mb-2">Content Moderation</h3>
                    <p className="text-sm text-muted-foreground">Review and moderate user content</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium mb-2">Analytics</h3>
                    <p className="text-sm text-muted-foreground">View platform analytics and insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;