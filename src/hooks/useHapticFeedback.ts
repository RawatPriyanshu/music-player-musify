import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const useHapticFeedback = () => {
  const isNative = Capacitor.isNativePlatform();

  const impact = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isNative) return;
    
    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];
      
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isNative) return;
    
    try {
      await Haptics.notification({ 
        type: type.toUpperCase() as any 
      });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  const vibrate = async (pattern: number[] = [200]) => {
    if (!isNative && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
      return;
    }
    
    if (isNative) {
      try {
        await Haptics.vibrate({ duration: pattern[0] || 200 });
      } catch (error) {
        console.warn('Vibration not available:', error);
      }
    }
  };

  return {
    impact,
    notification,
    vibrate,
    isSupported: isNative || 'vibrate' in navigator
  };
};