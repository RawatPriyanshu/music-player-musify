import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className }) => {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const { impact } = useHapticFeedback();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isInstalled || isDismissed) return null;

  const handleInstall = async () => {
    impact('medium');
    const success = await installPWA();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    impact('light');
    setIsDismissed(true);
  };

  return (
    <Card className={cn(
      "fixed bottom-20 left-4 right-4 z-40 p-4 bg-gradient-to-r from-primary to-primary-variant text-primary-foreground lg:hidden",
      "animate-slide-in-right shadow-lg border-0",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <Smartphone className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Install Musify</h3>
          <p className="text-xs opacity-90 leading-tight">
            Add to home screen for the best experience
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleInstall}
            size="sm"
            variant="secondary"
            className="h-8 px-3 bg-white/20 text-white hover:bg-white/30 border-0"
          >
            <Download className="h-3 w-3 mr-1" />
            Install
          </Button>
          
          <Button
            onClick={handleDismiss}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};