import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';

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

const PwaInstallBanner = () => {
  const { t } = useTranslation('app');
  const { triggerLight } = useHaptics();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      /* noop */
    }
    if (dismissed) return;

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

  const install = useCallback(async () => {
    triggerLight();
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') setVisible(false);
    } catch {
      /* noop */
    }
    setDeferred(null);
  }, [deferred, triggerLight]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-zinc-700/60 bg-zinc-900/90 backdrop-blur-xl shadow-2xl p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <Download className="h-5 w-5 text-cyan-400" />
        </span>
        <p className="flex-1 text-xs leading-snug text-zinc-300">{t('pwa.message')}</p>
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-500/25 active:scale-95"
        >
          {t('pwa.install')}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('pwa.dismiss')}
          className="shrink-0 rounded-xl p-2 text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
