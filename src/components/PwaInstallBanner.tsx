import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, HelpCircle, X } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';
import PwaInstallGuideModal, { InstallDevice } from '@/components/PwaInstallGuideModal';
import { usePwaInstall } from '@/hooks/usePwaInstall';

const DISMISS_KEY = 'pwa_banner_dismissed';

const PwaInstallBanner = () => {
  const { t } = useTranslation('app');
  const { triggerLight } = useHaptics();
  const { isInstalled, isInstallable, device, triggerInstall } = usePwaInstall();
  const [visible, setVisible] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideDevice, setGuideDevice] = useState<InstallDevice | undefined>(undefined);

  useEffect(() => {
    if (isInstalled) {
      setVisible(false);
      return;
    }
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      /* noop */
    }
    if (dismissed) return;

    // Pokaż baner jeśli nie zainstalowano i nie odrzucono
    setVisible(true);
    setGuideDevice(device);
  }, [isInstalled, device]);

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
    (dev?: InstallDevice) => {
      triggerLight();
      setGuideDevice(dev ?? device);
      setGuideOpen(true);
    },
    [device, triggerLight],
  );

  const handleInstallClick = useCallback(async () => {
    triggerLight();
    if (isInstallable) {
      try {
        const outcome = await triggerInstall();
        if (outcome === 'accepted') {
          setVisible(false);
        }
      } catch {
        openGuide(device);
      }
    } else {
      openGuide(device);
    }
  }, [isInstallable, triggerInstall, openGuide, device, triggerLight]);

  if (isInstalled || !visible) {
    return (
      <PwaInstallGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        initialDevice={guideDevice}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none animate-in slide-in-from-bottom duration-300">
        <div className="pointer-events-auto mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-zinc-700/70 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Download className="h-5 w-5 text-cyan-400" />
          </span>
          <p className="flex-1 text-xs leading-snug text-zinc-300 font-medium">
            {t('pwa.message', { defaultValue: 'Zainstaluj aplikację na telefonie lub PC, aby korzystać z niej błyskawicznie i offline na warsztacie' })}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => openGuide(device)}
              title={t('pwa.guide', { defaultValue: 'Instrukcja' })}
              className="flex items-center gap-1 rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-2.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-all active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{t('pwa.guide', { defaultValue: 'Instrukcja' })}</span>
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-xs sm:text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-500/25 active:scale-95"
            >
              {isInstallable ? t('pwa.install', { defaultValue: 'Instaluj' }) : t('pwa.installShort', { defaultValue: 'Zainstaluj' })}
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t('pwa.dismiss', { defaultValue: 'Zamknij' })}
              className="rounded-xl p-2 text-zinc-500 transition-colors hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <PwaInstallGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        initialDevice={guideDevice}
      />
    </>
  );
};

export default PwaInstallBanner;
