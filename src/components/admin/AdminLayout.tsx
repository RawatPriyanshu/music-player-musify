import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Music, 
  Settings, 
  Home,
  Shield,
  TrendingUp,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { profile } = useAuth();
  const location = useLocation();

  const adminNavItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: BarChart3,
      exact: true
    },
    {
      href: '/admin/users',
      label: 'User Management',
      icon: Users
    },
    {
      href: '/admin/songs',
      label: 'Song Moderation',
      icon: Music
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: TrendingUp
    },
    {
      href: '/admin/settings',
      label: 'Platform Settings',
      icon: Settings
    }
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 min-h-screen bg-card border-r border-border">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <Badge variant="default" className="text-xs">
                  {profile?.role}
                </Badge>
              </div>
            </div>

            <nav className="space-y-2">
              {/* Back to App */}
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Back to App</span>
              </Link>

              <div className="border-t border-border my-4"></div>

              {/* Admin Navigation */}
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Info Card */}
          <div className="p-6 mt-auto">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {(profile?.username || profile?.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Administrator
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;