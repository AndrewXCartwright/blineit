import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Zap, Bell, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { useAuth } from '@/hooks/useAuth';

export const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, isIOS, showIOSPrompt, installApp, dismissIOSPrompt } = usePWA();
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show prompt after login on mobile, if not installed
    if (user && (isInstallable || (isIOS && showIOSPrompt)) && !isInstalled && !dismissed) {
      const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000) {
        // Wait a bit before showing
        const timer = setTimeout(() => setShowPrompt(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isInstallable, isInstalled, isIOS, showIOSPrompt, dismissed]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    if (isIOS) {
      dismissIOSPrompt(false);
    }
  };

  const handleDontShowAgain = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', (Date.now() + 365 * 24 * 60 * 60 * 1000).toString());
    if (isIOS) {
      dismissIOSPrompt(true);
    }
  };

  if (!showPrompt || isInstalled) return null;

  // iOS-specific prompt
  if (isIOS) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-md bg-card border-border animate-scale-in">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Add to Home Screen</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-muted-foreground mb-6">
              To install B-LINE-IT on your iPhone:
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-foreground font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">Look for ⬆️ at the bottom of your screen</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-foreground font-medium">Scroll down and tap</p>
                  <p className="text-sm text-muted-foreground">"Add to Home Screen" ➕</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="text-foreground font-medium">Tap "Add" in the top right</p>
                  <p className="text-sm text-muted-foreground">The app will appear on your home screen</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleDontShowAgain}>
                Don't Show Again
              </Button>
              <Button className="flex-1" onClick={handleDismiss}>
                Got It
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Android/Desktop install prompt
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md bg-card border-border animate-scale-in">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Install B-LINE-IT App</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-muted-foreground mb-4">
            Add to your home screen for the best experience:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">Faster loading</span>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">Push notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">Works offline</span>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">Full-screen mode</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleDismiss}>
              Maybe Later
            </Button>
            <Button className="flex-1" onClick={handleInstall}>
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
