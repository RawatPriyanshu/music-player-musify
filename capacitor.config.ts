import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.73f3044c3db347d5b3773db56b1a1d00',
  appName: 'music-player-musify',
  webDir: 'dist',
  server: {
    url: 'https://73f3044c-3db3-47d5-b377-3db56b1a1d00.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Haptics: {
      enabled: true
    },
    Camera: {
      permissions: {
        camera: 'required',
        photos: 'required'
      }
    },
    Filesystem: {
      enabled: true
    }
  }
};

export default config;