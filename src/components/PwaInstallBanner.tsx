import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, HelpCircle, X } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';
import PwaInstallGuideModal, { InstallDevice } from '@/components/PwaInstallGuideModal';

const DISMISS_KEY = 'pwa_banner_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = () => {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
};

const isIosDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
};

const PwaInstallBanner = () => {
  const { t } = useTranslation('app');
  const { triggerLight } = useHaptics();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideDevice, setGuideDevice] = useState<InstallDevice | undefined>(undefined);

  useEffect(() => {
    if (isStandalone()) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      /* noop */
    }
    if (dismissed) return;

    // Na iOS Safari beforeinstallprompt nigdy nie odpala, ale możemy wyświetlić baner z instrukcją
    if (isIosDevice()) {
      setVisible(true);
      setGuideDevice('ios');
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    triggerLight();
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      /* noop */
    }
  }, [triggerLight]);

  const openGuide = useCallback(
    (device?: InstallDevice) => {
      triggerLight();
      setGuideDevice(device);
      setGuideOpen(true);
    },
    [triggerLight],
  );

  const install = useCallback(async () => {
    triggerLight();
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === 'accepted') setVisible(false);
      } catch {
        /* noop */
      }
      setDeferred(null);
    } else {
      // Jeśli brak bezpośredniego promptu (np. iOS lub przeglądarka bez wsparcia API), pokaż przewodnik
      openGuide(isIosDevice() ? 'ios' : undefined);
    }
  }, [deferred, openGuide, triggerLight]);

  return (
    <>
      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none animate-in slide-in-from-bottom duration-300">
          <div className="pointer-events-auto mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-zinc-700/70 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Download className="h-5 w-5 text-cyan-400" />
            </span>
            <p className="flex-1 text-xs leading-snug text-zinc-300 font-medium">
              {t('pwa.message')}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => openGuide()}
                title={t('pwa.guide')}
                className="flex items-center gap-1 rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-2.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-all active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">{t('pwa.guide')}</span>
              </button>
              <button
                type="button"
                onClick={install}
                className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-xs sm:text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-500/25 active:scale-95"
              >
                {t('pwa.install')}
              </button>
              <button
                type="button"
                onClick={dismiss}
                aria-label={t('pwa.dismiss')}
                className="rounded-xl p-2 text-zinc-500 transition-colors hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <PwaInstallGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        initialDevice={guideDevice}
      />
    </>
  );
};

export default PwaInstallBanner;
