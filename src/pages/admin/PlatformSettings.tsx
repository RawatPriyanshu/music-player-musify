import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Upload, 
  Shield, 
  Bell, 
  Database,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlatformSettings = () => {
  const { toast } = useToast();
  
  // Platform Settings State
  const [settings, setSettings] = useState({
    // Upload Settings
    maxFileSize: 50,
    allowedFormats: ['mp3', 'wav'],
    requireApproval: true,
    autoApprove: false,
    
    // Content Settings
    enableSearch: true,
    publicPlaylists: true,
    userProfiles: true,
    
    // Security Settings
    requireEmailVerification: true,
    sessionTimeout: 24,
    twoFactorAuth: false,
    
    // Feature Flags
    uploadEnabled: true,
    playlistsEnabled: true,
    favoritesEnabled: true,
    adminModeration: true,
    
    // System Settings
    maintenanceMode: false,
    systemAnnouncement: '',
    analyticsEnabled: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    // In a real app, this would save to the database
    toast({
      title: "Settings Saved",
      description: "Platform settings have been updated successfully.",
    });
  };

  const resetToDefaults = () => {
    // Reset to default values
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Settings</span>
            </CardTitle>
            <CardDescription>
              Configure file upload restrictions and policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Allowed Audio Formats</Label>
              <div className="flex flex-wrap gap-2">
                {['mp3', 'wav', 'flac', 'aac'].map(format => (
                  <Badge 
                    key={format}
                    variant={settings.allowedFormats.includes(format) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const formats = settings.allowedFormats.includes(format)
                        ? settings.allowedFormats.filter(f => f !== format)
                        : [...settings.allowedFormats, format];
                      handleSettingChange('allowedFormats', formats);
                    }}
                  >
                    {format.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireApproval">Require Admin Approval</Label>
                <p className="text-sm text-muted-foreground">
                  All uploads must be approved before going live
                </p>
              </div>
              <Switch
                id="requireApproval"
                checked={settings.requireApproval}
                onCheckedChange={(checked) => handleSettingChange('requireApproval', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="uploadEnabled">Enable Uploads</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to upload new content
                </p>
              </div>
              <Switch
                id="uploadEnabled"
                checked={settings.uploadEnabled}
                onCheckedChange={(checked) => handleSettingChange('uploadEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription>
              Configure authentication and security policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailVerification">Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch
                id="emailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Select 
                value={settings.sessionTimeout.toString()} 
                onValueChange={(value) => handleSettingChange('sessionTimeout', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enable 2FA for enhanced security
                </p>
              </div>
              <Switch
                id="twoFactor"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Feature Management</span>
            </CardTitle>
            <CardDescription>
              Enable or disable platform features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="playlists">Playlists</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to create and manage playlists
                </p>
              </div>
              <Switch
                id="playlists"
                checked={settings.playlistsEnabled}
                onCheckedChange={(checked) => handleSettingChange('playlistsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="favorites">Favorites</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to favorite songs
                </p>
              </div>
              <Switch
                id="favorites"
                checked={settings.favoritesEnabled}
                onCheckedChange={(checked) => handleSettingChange('favoritesEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publicProfiles">Public User Profiles</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to view each other's profiles
                </p>
              </div>
              <Switch
                id="publicProfiles"
                checked={settings.userProfiles}
                onCheckedChange={(checked) => handleSettingChange('userProfiles', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="search">Global Search</Label>
                <p className="text-sm text-muted-foreground">
                  Enable search across all content
                </p>
              </div>
              <Switch
                id="search"
                checked={settings.enableSearch}
                onCheckedChange={(checked) => handleSettingChange('enableSearch', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>System Settings</span>
            </CardTitle>
            <CardDescription>
              Platform-wide system configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the platform in maintenance mode
                </p>
              </div>
              <Switch
                id="maintenance"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement">System Announcement</Label>
              <Textarea
                id="announcement"
                placeholder="Enter a system-wide announcement message..."
                value={settings.systemAnnouncement}
                onChange={(e) => handleSettingChange('systemAnnouncement', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Analytics Collection</Label>
                <p className="text-sm text-muted-foreground">
                  Collect usage analytics and metrics
                </p>
              </div>
              <Switch
                id="analytics"
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => handleSettingChange('analyticsEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>System Status</span>
          </CardTitle>
          <CardDescription>
            Current system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">File Storage</p>
                <p className="text-sm text-muted-foreground">75% Used</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">CDN</p>
                <p className="text-sm text-muted-foreground">High Latency</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <div className="space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={saveSettings}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;