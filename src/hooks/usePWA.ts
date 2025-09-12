import { useState, useEffect } from 'react';

export interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  updateAvailable: boolean;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstalled: false,
    isInstallable: false,
    updateAvailable: false,
  });

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      setPwaState(prev => ({ ...prev, isInstalled }));
    };

    // Handle online/offline status
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    // Handle service worker updates
    const handleServiceWorkerUpdate = () => {
      setPwaState(prev => ({ ...prev, updateAvailable: true }));
    };

    // Handle install prompt availability
    const handleBeforeInstallPrompt = () => {
      setPwaState(prev => ({ ...prev, isInstallable: true }));
    };

    // Handle app installation
    const handleAppInstalled = () => {
      setPwaState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }));
    };

    // Initial checks
    checkInstalled();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate);
      }
    };
  }, []);

  const reloadApp = () => {
    window.location.reload();
  };

  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setPwaState(prev => ({ ...prev, updateAvailable: false }));
        reloadApp();
      }
    }
  };

  return {
    ...pwaState,
    reloadApp,
    updateServiceWorker,
  };
};