import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Download, Monitor, Share2, Smartphone, X } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';

export type InstallDevice = 'pc' | 'android' | 'ios';

interface PwaInstallGuideModalProps {
  open: boolean;
  onClose: () => void;
  initialDevice?: InstallDevice;
}

const detectDefaultDevice = (): InstallDevice => {
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

const PwaInstallGuideModal = ({
  open,
  onClose,
  initialDevice,
}: PwaInstallGuideModalProps) => {
  const { t } = useTranslation('app');
  const { triggerLight } = useHaptics();
  const [activeTab, setActiveTab] = useState<InstallDevice>(() => initialDevice ?? detectDefaultDevice());

  useEffect(() => {
    if (open) {
      if (initialDevice) setActiveTab(initialDevice);
      else setActiveTab(detectDefaultDevice());
    }
  }, [open, initialDevice]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleTabChange = (tab: InstallDevice) => {
    triggerLight();
    setActiveTab(tab);
  };

  const tabs: Array<{ id: InstallDevice; label: string; icon: typeof Monitor }> = [
    { id: 'pc', label: t('pwa.tabPc'), icon: Monitor },
    { id: 'android', label: t('pwa.tabAndroid'), icon: Smartphone },
    { id: 'ios', label: t('pwa.tabIos'), icon: Share2 },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-guide-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <h2 id="pwa-guide-title" className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                {t('pwa.modalTitle')}
              </h2>
              <p className="text-xs text-zinc-400">{t('pwa.modalSubtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('pwa.dismiss')}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl border border-zinc-800 bg-zinc-950/70 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                  active
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="overflow-y-auto pr-1 space-y-3 flex-1 max-h-[55vh]">
          {activeTab === 'pc' && (
            <div className="space-y-2.5">
              <div className="rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-3.5">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 mb-1">
                  <Monitor className="w-4 h-4" />
                  {t('pwa.pc.title')}
                </h3>
                <p className="text-xs text-zinc-400">
                  Aplikacja działa w osobnym oknie bez pasków przeglądarki – jak natywny program Windows/Mac.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                    1
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.pc.step1')}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                    2
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.pc.step2')}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    3
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.pc.step3')}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-2.5">
              <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-3.5">
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4" />
                  {t('pwa.android.title')}
                </h3>
                <p className="text-xs text-zinc-400">
                  Działa na pełnym ekranie i jest dostępna prosto z pulpitu telefonu bez wpisywania adresu.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    1
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.android.step1')}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    2
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.android.step2')}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    3
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.android.step3')}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    4
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.android.step4')}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-2.5">
              <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-3.5">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4" />
                  {t('pwa.ios.title')}
                </h3>
                <p className="text-xs text-zinc-400">
                  System iOS wymaga przeglądarki Safari do dodania aplikacji na ekran początkowy.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                    1
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.ios.step1')}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                    2
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.ios.step2')}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                    3
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.ios.step3')}</p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                    4
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{t('pwa.ios.step4')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-semibold transition-colors active:scale-98"
          >
            {t('pwa.dismiss')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PwaInstallGuideModal;
