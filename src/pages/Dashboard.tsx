import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { Music, TrendingUp, Clock, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +20% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Playlists</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  +2 new this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Listening Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127h</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  +12 from last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recently Played */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recently Played</CardTitle>
              <CardDescription>Your music history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-md flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">Song Title {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">Artist Name</p>
                    </div>
                    <div className="text-sm text-muted-foreground">3:24</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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