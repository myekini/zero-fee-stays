import { useState, useEffect, useCallback } from 'react';

interface DeviceInfo {
  isTouch: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isPWA: boolean;
  supportsHaptics: boolean;
  connectionType: string;
  devicePixelRatio: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface MobileOptimizations {
  device: DeviceInfo;
  location: LocationData | null;
  locationError: string | null;
  isOnline: boolean;
  isLowData: boolean;
  requestLocation: () => Promise<void>;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
  shareContent: (data: ShareData) => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  addToHomeScreen: () => void;
  preloadImages: (urls: string[]) => Promise<void>;
}

export const useMobileOptimizations = (): MobileOptimizations => {
  const [device] = useState<DeviceInfo>(() => {
    const userAgent = navigator.userAgent;
    return {
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isMobile: /Mobi|Android/i.test(userAgent),
      isPWA: window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator as any).standalone === true,
      supportsHaptics: 'vibrate' in navigator,
      connectionType: (navigator as any)?.connection?.effectiveType || 'unknown',
      devicePixelRatio: window.devicePixelRatio || 1
    };
  });

  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLowData, setIsLowData] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor connection quality
  useEffect(() => {
    const connection = (navigator as any)?.connection;
    if (connection) {
      const checkDataSaver = () => {
        setIsLowData(
          connection.saveData === true ||
          connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g'
        );
      };

      checkDataSaver();
      connection.addEventListener('change', checkDataSaver);

      return () => {
        connection.removeEventListener('change', checkDataSaver);
      };
    }
    return undefined;
  }, []);

  const requestLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setLocationError(null);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Location unavailable');
    }
  }, []);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (!device.supportsHaptics) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    };

    navigator.vibrate(patterns[type]);
  }, [device.supportsHaptics]);

  const shareContent = useCallback(async (data: ShareData): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to clipboard
        if (data.url) {
          await navigator.clipboard.writeText(data.url);
        }
      }
    } else {
      // Fallback for browsers without native sharing
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
      }
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }, []);

  const addToHomeScreen = useCallback(() => {
    // This would be triggered by a beforeinstallprompt event
    // stored in a state variable
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        (window as any).deferredPrompt = null;
      });
    }
  }, []);

  const preloadImages = useCallback(async (urls: string[]): Promise<void> => {
    if (isLowData) {
      console.log('Skipping image preload due to low data mode');
      return;
    }

    const preloadPromises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load ${url}`));
        img.src = url;
      });
    });

    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.error('Image preload failed:', error);
    }
  }, [isLowData]);

  return {
    device,
    location,
    locationError,
    isOnline,
    isLowData,
    requestLocation,
    triggerHaptic,
    shareContent,
    requestNotificationPermission,
    addToHomeScreen,
    preloadImages
  };
};

// Hook for responsive image loading
export const useResponsiveImages = () => {
  const { device, isLowData } = useMobileOptimizations();

  const getOptimalImageUrl = useCallback((baseUrl: string, sizes: Record<string, string>) => {
    if (isLowData) {
      return sizes.low || sizes.medium || baseUrl;
    }

    const pixelRatio = device.devicePixelRatio;
    
    if (pixelRatio >= 3) {
      return sizes.high || sizes.medium || baseUrl;
    } else if (pixelRatio >= 2) {
      return sizes.medium || baseUrl;
    }
    
    return sizes.low || baseUrl;
  }, [device.devicePixelRatio, isLowData]);

  return { getOptimalImageUrl };
};

// Hook for managing app install prompt
export const useAppInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    
    return outcome === 'accepted';
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
  };

  return {
    showInstallPrompt,
    installApp,
    dismissPrompt
  };
};