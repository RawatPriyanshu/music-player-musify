import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { PlayerBar } from "@/components/player/PlayerBar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Library from "./pages/Library";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Search from "./pages/Search";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import SongModeration from "./pages/admin/SongModeration";
import AdminLayout from "./components/admin/AdminLayout";
import Analytics from "./pages/admin/Analytics";
import PlatformSettings from "./pages/admin/PlatformSettings";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  useKeyboardShortcuts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background">
      {/* Show Navbar only for non-admin routes */}
      {!isAdminRoute && <Navbar />}
      
      <div className={!isAdminRoute ? "pt-16" : ""}>
        <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ) : (
              <Landing />
            )
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/library" 
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/playlists" 
          element={
            <ProtectedRoute>
              <Playlists />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/playlist/:id" 
          element={
            <ProtectedRoute>
              <PlaylistDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/favorites" 
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/songs" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <SongModeration />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <Analytics />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <PlatformSettings />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
      
      {/* Show PlayerBar only for non-admin routes */}
      {!isAdminRoute && (
        <div className="pb-20">
          <PlayerBar />
        </div>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PlayerProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
