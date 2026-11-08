import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Download,
  Smartphone,
  Apple,
  Monitor,
  X,
  Compass,
  MessageCircle,
  Chrome,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export type InstallDevice = 'android' | 'ios' | 'pc';
export type IosBrowserTab = 'safari' | 'inapp' | 'chrome';

interface PwaInstallGuideModalProps {
  open: boolean;
  onClose: () => void;
  initialDevice?: InstallDevice;
}

const PwaInstallGuideModal = ({
  open,
  onClose,
  initialDevice,
}: PwaInstallGuideModalProps) => {
  const { t } = useTranslation('app');
  const { triggerLight, triggerSuccess } = useHaptics();
  const { isInstallable, isInstalled, device: detectedDevice, iosBrowser, triggerInstall } = usePwaInstall();

  const [activeDevice, setActiveDevice] = useState<InstallDevice>(() => initialDevice ?? (detectedDevice === 'ios' ? 'ios' : detectedDevice === 'android' ? 'android' : 'pc'));
  const [iosTab, setIosTab] = useState<IosBrowserTab>(() => (iosBrowser === 'inapp' ? 'inapp' : iosBrowser === 'chrome' ? 'chrome' : 'safari'));
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialDevice) {
        setActiveDevice(initialDevice);
      } else {
        setActiveDevice(detectedDevice === 'ios' ? 'ios' : detectedDevice === 'android' ? 'android' : 'pc');
      }
      setIosTab(iosBrowser === 'inapp' ? 'inapp' : iosBrowser === 'chrome' ? 'chrome' : 'safari');
      setCopied(false);
      setInstallSuccess(false);
    }
  }, [open, initialDevice, detectedDevice, iosBrowser]);

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

  const handleDeviceChange = (dev: InstallDevice) => {
    triggerLight();
    setActiveDevice(dev);
  };

  const handleIosTabChange = (tab: IosBrowserTab) => {
    triggerLight();
    setIosTab(tab);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin || 'https://cnchub.app');
      triggerSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleTriggerInstall = async () => {
    triggerLight();
    setIsInstalling(true);
    try {
      const outcome = await triggerInstall();
      if (outcome === 'accepted') {
        triggerSuccess();
        setInstallSuccess(true);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const deviceTabs: Array<{ id: InstallDevice; label: string; icon: typeof Smartphone; badge?: string }> = [
    { id: 'android', label: 'Android', icon: Smartphone, badge: detectedDevice === 'android' ? t('pwa.yourDevice', { defaultValue: 'Twój tel.' }) : undefined },
    { id: 'ios', label: 'iPhone / iOS', icon: Apple, badge: detectedDevice === 'ios' ? t('pwa.yourDevice', { defaultValue: 'Twój tel.' }) : undefined },
    { id: 'pc', label: 'PC / Mac', icon: Monitor, badge: detectedDevice === 'pc' ? t('pwa.yourDevice', { defaultValue: 'Twój sprzęt' }) : undefined },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-guide-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <h2 id="pwa-guide-title" className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                {t('pwa.modalTitle', { defaultValue: 'Instalacja aplikacji CNC HUB' })}
              </h2>
              <p className="text-xs text-zinc-400">
                {t('pwa.modalSubtitle', { defaultValue: 'Wybierz swój system, aby szybko zainstalować aplikację' })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('pwa.dismiss', { defaultValue: 'Zamknij' })}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl border border-zinc-800 bg-zinc-900/70 mb-4">
          {deviceTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeDevice === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleDeviceChange(tab.id)}
                className={`relative flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                  active
                    ? tab.id === 'android'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                      : tab.id === 'ios'
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-zinc-800/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 ml-0.5">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Section (Scrollable) */}
        <div className="overflow-y-auto pr-1 space-y-3.5 flex-1 max-h-[60vh] scrollbar-thin scrollbar-thumb-zinc-700">
          
          {/* ===================== TAB: ANDROID ===================== */}
          {activeDevice === 'android' && (
            <div className="space-y-3">
              {/* Status or 1-Click Banner */}
              {isInstalled ? (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-200">
                      {t('pwa.installedSuccess', { defaultValue: 'Aplikacja jest już zainstalowana!' })}
                    </p>
                    <p className="text-emerald-400/80">
                      {t('pwa.installedSuccessDesc', { defaultValue: 'Możesz uruchamiać CNC HUB bezpośrednio z ekranu głównego telefonu.' })}
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="p-3.5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('pwa.quickInstall', { defaultValue: 'Bezpośrednia instalacja' })}
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      {t('pwa.quickInstallDesc', { defaultValue: 'Twoja przeglądarka wspiera instalację 1 kliknięciem!' })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerInstall}
                    disabled={isInstalling || installSuccess}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {installSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('pwa.installedLabel', { defaultValue: 'Zainstalowano!' })}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {t('pwa.installNow', { defaultValue: 'Zainstaluj teraz' })}
                      </>
                    )}
                  </button>
                </div>
              ) : null}

              {/* General Description Card */}
              <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/15 p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-300">
                    {t('pwa.android.title', { defaultValue: 'Instrukcja dla Androida (Chrome / Edge / Brave)' })}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('pwa.androidDesc', { defaultValue: 'Aplikacja PWA działa na pełnym ekranie jak program ze sklepu Google Play – bez paska adresu i z obsługą offline na warsztacie.' })}
                </p>
              </div>

              {/* Step-by-step instructions */}
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {t('pwa.android.step1Title', { defaultValue: 'Otwórz menu przeglądarki' })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {t('pwa.android.step1', { defaultValue: 'W przeglądarce Chrome/Brave dotknij ikony trzech kropek (⋮) w prawym górnym rogu ekranu.' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {t('pwa.android.step2Title', { defaultValue: 'Wybierz instalację' })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {t('pwa.android.step2', { defaultValue: 'Z listy wybierz opcję „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {t('pwa.android.step3Title', { defaultValue: 'Zatwierdź komunikat' })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {t('pwa.android.step3', { defaultValue: 'Dotknij przycisku „Zainstaluj” w oknie potwierdzenia.' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/30 text-emerald-300 text-xs font-bold">
                    4
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {t('pwa.android.step4Title', { defaultValue: 'Gotowe!' })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {t('pwa.android.step4', { defaultValue: 'Ikona CNC HUB pojawi się na Twoim pulpicie. Aplikacja otwiera się błyskawicznie i działa również offline.' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB: IOS (IPHONE / IPAD) ===================== */}
          {activeDevice === 'ios' && (
            <div className="space-y-3">
              {/* In-app Browser Warning Alert */}
              {(iosBrowser === 'inapp' || iosTab === 'inapp') && (
                <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-300">
                        {t('pwa.ios.inAppWarning', { defaultValue: 'Otwarto w aplikacji Facebook / Messenger / Instagram' })}
                      </p>
                      <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
                        {t('pwa.ios.inAppDesc', {
                          defaultValue: 'Apple blokuje instalację aplikacji wewnątrz przeglądarek portali społecznościowych. Aby dodać aplikację do ekranu głównego, musisz otworzyć tę stronę w Safari.',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? t('pwa.ios.linkCopied', { defaultValue: 'Skopiowano link!' }) : t('pwa.ios.copyLink', { defaultValue: 'Skopiuj link (cnchub.app)' })}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* iOS Browser Sub-Tabs */}
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 mb-1.5 px-0.5">
                  {t('pwa.ios.selectBrowser', { defaultValue: 'W jakiej przeglądarce jesteś na iPhone?' })}
                </p>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <button
                    type="button"
                    onClick={() => handleIosTabChange('safari')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      iosTab === 'safari'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Safari</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIosTabChange('inapp')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      iosTab === 'inapp'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">FB / Messenger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIosTabChange('chrome')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      iosTab === 'chrome'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Chrome className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Chrome</span>
                  </button>
                </div>
              </div>

              {/* Sub-content: Safari */}
              {iosTab === 'safari' && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                      1
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.safariStep1Title', { defaultValue: 'Dotknij przycisku Udostępnij' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.step2', { defaultValue: 'Na dolnym pasku Safari dotknij ikony Udostępnij (kwadrat ze strzałką w górę ⎋).' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                      2
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.safariStep2Title', { defaultValue: 'Wybierz „Do ekranu początkowego”' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.step3', { defaultValue: 'Przewiń menu w dół i stuknij opcję „Do ekranu początkowego” (z ikoną plusa +).' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/30 text-amber-300 text-xs font-bold">
                      3
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.safariStep3Title', { defaultValue: 'Dotknij „Dodaj”' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.step4', { defaultValue: 'W prawym górnym rogu dotknij „Dodaj”. Ikona CNC HUB pojawi się na ekranie iPhone’a!' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-content: Facebook / Messenger */}
              {iosTab === 'inapp' && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                      1
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.inAppStep1Title', { defaultValue: 'Dotknij ikony menu w rogu' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.inAppStep1', { defaultValue: 'W prawym górnym rogu (lub w prawym dolnym) stuknij ikonę trzech kropek (⋯) lub ikonę Udostępnij.' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                      2
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.inAppStep2Title', { defaultValue: 'Wybierz „Otwórz w Safari”' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.inAppStep2', { defaultValue: 'Z wyświetlonego menu wybierz opcję „Otwórz w Safari” lub „Otwórz w domyślnej przeglądarce”.' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/30 text-amber-300 text-xs font-bold">
                      3
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.inAppStep3Title', { defaultValue: 'Zainstaluj z poziomu Safari' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.inAppStep3', { defaultValue: 'W Safari kliknij ikonę Udostępnij (kwadrat ze strzałką) ➔ „Do ekranu początkowego” ➔ „Dodaj”.' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-content: Chrome on iOS */}
              {iosTab === 'chrome' && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                      1
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.chromeStep1Title', { defaultValue: 'Dotknij ikony Udostępnij w Chrome' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.chromeStep1', { defaultValue: 'W pasku adresu Chrome dotknij ikony Udostępnij (lub menu z trzema kropkami ⋯).' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                      2
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.chromeStep2Title', { defaultValue: 'Wybierz „Do ekranu początkowego”' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.chromeStep2', { defaultValue: 'Przewiń w dół i dotknij „Dodaj do ekranu początkowego” (wspierane w iOS 16.4 i nowszych).' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/30 text-amber-300 text-xs font-bold">
                      3
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {t('pwa.ios.chromeStep3Title', { defaultValue: 'Brak opcji w Chrome?' })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        {t('pwa.ios.chromeStep3', { defaultValue: 'Jeśli nie widzisz tej opcji, skopiuj link cnchub.app i otwórz go w domyślnej przeglądarce Safari.' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB: PC / MAC ===================== */}
          {activeDevice === 'pc' && (
            <div className="space-y-3">
              {isInstallable && (
                <div className="p-3.5 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 to-zinc-900/80 flex items-center justify-between gap-3 shadow-lg">
                  <div>
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('pwa.quickInstall', { defaultValue: 'Instalacja w systemie' })}
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      {t('pwa.pcPromptAvailable', { defaultValue: 'Zainstaluj CNC HUB jako osobną aplikację na pulpicie Windows/Mac.' })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerInstall}
                    disabled={isInstalling || installSuccess}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installSuccess ? t('pwa.installedLabel', { defaultValue: 'Zainstalowano!' }) : t('pwa.installNow', { defaultValue: 'Zainstaluj' })}</span>
                  </button>
                </div>
              )}

              <div className="rounded-2xl border border-cyan-900/30 bg-cyan-950/15 p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-cyan-300">
                    {t('pwa.pc.title', { defaultValue: 'Instrukcja dla komputerów (Chrome / Edge / Opera)' })}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('pwa.desktopDesc', { defaultValue: 'Aplikacja otwiera się w osobnym, wygodnym oknie roboczym bez pasków przeglądarki – jak natywny program Windows lub macOS.' })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {t('pwa.pc.step1Title', { defaultValue: 'Pasek adresu przeglądarki' })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {t('pwa.pc.step1', { defaultValue: 'W pasku adresu przeglądarki po prawej stronie kliknij ikonę instalacji (komputer ze strzałką lub symbol +).' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {t('pwa.pc.step2Title', { defaultValue: 'Lub przez menu opcji' })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {t('pwa.pc.step2', { defaultValue: 'Alternatywnie: kliknij menu trzech kropek (⋮) w prawym górnym rogu i wybierz „Zainstaluj CNC HUB”.' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/30 text-cyan-300 text-xs font-bold">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      {t('pwa.pc.step3Title', { defaultValue: 'Gotowe!' })}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {t('pwa.pc.step3', { defaultValue: 'Aplikacja pojawi się w menu Start / Launchpadzie i uruchamia się błyskawicznie w osobnym oknie.' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <p className="text-[11px] text-zinc-500 hidden sm:block">
            {t('pwa.freeAppNotice', { defaultValue: 'Aplikacja jest w 100% darmowa i nie wymaga pobierania z Google Play / App Store.' })}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto ml-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-all active:scale-95"
          >
            {t('pwa.dismiss', { defaultValue: 'Zamknij' })}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PwaInstallGuideModal;
