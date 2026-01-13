import { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Prevent reload loops when a new service worker takes control
  const refreshingRef = useRef(false);

  useEffect(() => {
    // Check if running in standalone mode
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };
    checkStandalone();

    // Check if iOS
    const checkIOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(isIOSDevice);

      // Show iOS prompt if on iOS, not installed, and not dismissed recently
      if (isIOSDevice && !isInstalled) {
        const lastDismissed = localStorage.getItem('pwa-ios-dismissed');
        if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000) {
          setShowIOSPrompt(true);
        }
      }
    };
    checkIOS();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // --- Service worker update checks (helps prevent "old cached" UI on iOS/PWA) ---
    let swRegistration: ServiceWorkerRegistration | null = null;
    let updateInterval: number | undefined;

    const checkForUpdates = async () => {
      if (!('serviceWorker' in navigator)) return;
      if (!navigator.onLine) return;

      try {
        const reg = swRegistration ?? (await navigator.serviceWorker.getRegistration());
        if (!reg) return;

        swRegistration = reg;
        await reg.update();

        // If an update was already downloaded
        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }
      } catch {
        // Ignore: iOS can throw during background/restore.
      }
    };

    const handleControllerChange = () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      window.location.reload();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      navigator.serviceWorker.ready.then((registration) => {
        swRegistration = registration;

        // If the browser already has a waiting SW (common after backgrounding)
        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        // Proactively check now + periodically
        void checkForUpdates();
        updateInterval = window.setInterval(checkForUpdates, 5 * 60 * 1000);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (updateInterval) {
        window.clearInterval(updateInterval);
      }
    };
  }, [isInstalled]);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }

      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  const dismissIOSPrompt = useCallback((dontShowAgain = false) => {
    setShowIOSPrompt(false);
    if (dontShowAgain) {
      localStorage.setItem('pwa-ios-dismissed', Date.now().toString());
    }
  }, []);

  const updateApp = useCallback(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(async (registration) => {
      try {
        await registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          // Give iOS a moment, then hard-reload (controllerchange will also reload)
          window.setTimeout(() => window.location.reload(), 2000);
          return;
        }

        // Fallback: force reload (also helps when Safari restores from bfcache)
        window.location.reload();
      } catch {
        window.location.reload();
      }
    });
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    isIOS,
    showIOSPrompt,
    updateAvailable,
    installApp,
    dismissIOSPrompt,
    updateApp,
  };
};
