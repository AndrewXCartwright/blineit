import { useEffect, useState } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';

export const NetworkStatus = () => {
  const { isOnline } = usePWA();
  const [showOnline, setShowOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowOnline(true);
      const timer = setTimeout(() => setShowOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Offline banner
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2 animate-fade-in">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">No internet connection</span>
      </div>
    );
  }

  // Back online banner
  if (showOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-2 flex-1 justify-center">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-white hover:bg-white/20"
          onClick={() => setShowOnline(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return null;
};
