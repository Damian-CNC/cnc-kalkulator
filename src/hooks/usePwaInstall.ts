import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((fn) => fn(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((fn) => fn(null));
  });
}

export const isStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
};

export const detectDevice = (): 'android' | 'ios' | 'pc' => {
  if (typeof window === 'undefined') return 'pc';
  const ua = window.navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream) {
    return 'ios';
  }
  if (/Android/i.test(ua)) {
    return 'android';
  }
  return 'pc';
};

export const detectIosBrowser = (): 'inapp' | 'safari' | 'chrome' | 'other' => {
  if (typeof window === 'undefined') return 'safari';
  const ua = window.navigator.userAgent;
  // Przeglądarki wbudowane w aplikacje (Facebook, Messenger, Instagram, TikTok, LinkedIn)
  if (/FBAN|FBAV|Instagram|Messenger|musical_ly|BytedanceWebview|LinkedInApp/i.test(ua)) {
    return 'inapp';
  }
  // Google Chrome na iOS
  if (/CriOS/i.test(ua)) {
    return 'chrome';
  }
  // Domyślna Safari na iOS
  if (/Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) {
    return 'safari';
  }
  return 'other';
};

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandaloneMode());

  useEffect(() => {
    const handler = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      setIsInstalled(isStandaloneMode());
    };
    promptListeners.add(handler);
    return () => {
      promptListeners.delete(handler);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!globalDeferredPrompt) return 'unavailable';
    try {
      await globalDeferredPrompt.prompt();
      const choice = await globalDeferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
      return choice.outcome;
    } catch {
      return 'unavailable';
    }
  }, []);

  const device = detectDevice();
  const iosBrowser = detectIosBrowser();

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    device,
    iosBrowser,
    triggerInstall,
    deferredPrompt,
  };
}

export default usePwaInstall;
