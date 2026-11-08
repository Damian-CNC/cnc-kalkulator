import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { History, MessageSquarePlus, ShieldCheck, RefreshCw, Coffee, BarChart2, Download, Smartphone } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UnitSwitcher from '@/components/UnitSwitcher';
import ChangelogModal from '@/components/ChangelogModal';
import FeedbackModal from '@/components/FeedbackModal';
import { LegalModal } from '@/components/DisclaimerGateModal';
import PwaInstallGuideModal from '@/components/PwaInstallGuideModal';
import { usePwaInstall } from '@/hooks/usePwaInstall';

/** Unified footer control surface + typography. */
const BTN =
  'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-800/60 shadow-sm transition-all active:scale-95';
const TXT = 'text-xs font-medium text-zinc-300 hover:text-white transition-colors';
const ICON = 'text-cyan-400 w-3.5 h-3.5 shrink-0';

const AppFooter = ({ className = '' }: { className?: string }) => {
  const { t } = useTranslation('app');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const { isInstalled, isInstallable, device, triggerInstall } = usePwaInstall();

  const handleRefresh = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      window.location.reload();
    } catch (error) {
      console.error('Update error:', error);
      window.location.reload();
    }
  };

  return (
    <footer
      className={`w-full max-w-4xl mx-auto mt-10 pt-6 border-t border-zinc-800/80 flex flex-col items-center gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${className}`}
    >
      {/* Mobile-first Install Promo Banner (visible when not running in standalone mode) */}
      {!isInstalled && (
        <div className="w-full rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-zinc-900/90 to-zinc-950 p-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs sm:text-sm font-bold text-zinc-100">
                  {t('footer.installCardTitle', { defaultValue: 'Zainstaluj kalkulator na telefonie' })}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {t('footer.installCardSubtitle', { defaultValue: 'Działa bez internetu na warsztacie i otwiera się prosto z pulpitu (Android & iOS)' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {device === 'android' && isInstallable ? (
              <button
                type="button"
                onClick={triggerInstall}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                {t('pwa.installNow', { defaultValue: 'Zainstaluj teraz' })}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setInstallModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-semibold text-xs active:scale-95 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              {t('footer.installGuideBtn', { defaultValue: 'Instrukcja (Android & iOS)' })}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <LanguageSwitcher btnClass={BTN} txtClass={TXT} iconClass={ICON} />
        <UnitSwitcher
          containerClass="flex items-center gap-1 px-1.5 py-1 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-800/60 shadow-sm transition-all"
        />
        <button type="button" onClick={() => setInstallModalOpen(true)} className={`${BTN} ${TXT}`}>
          <Download className={ICON} />
          {t('footer.installApp', { defaultValue: 'Zainstaluj' })}
        </button>
        <button type="button" onClick={handleRefresh} className={`${BTN} ${TXT}`}>
          <RefreshCw className={ICON} />
          {t('footer.refresh', { defaultValue: 'Odśwież' })}
        </button>
        <button type="button" onClick={() => setOpen(true)} className={`${BTN} ${TXT}`}>
          <History className={ICON} />
          {t('footer.changelog')}
        </button>
        <button type="button" onClick={() => setFeedbackOpen(true)} className={`${BTN} ${TXT}`}>
          <MessageSquarePlus className={ICON} />
          {t('footer.feedback')}
        </button>
        <button type="button" onClick={() => setLegalOpen(true)} className={`${BTN} ${TXT}`}>
          <ShieldCheck className={ICON} />
          {t('footer.legal')}
        </button>
        <button type="button" onClick={() => navigate('/stats')} className={`${BTN} ${TXT}`}>
          <BarChart2 className={ICON} />
          {t('footer.stats', { defaultValue: 'Statystyki' })}
        </button>
        <a
          href="https://buymeacoffee.com/cnchub"
          target="_blank"
          rel="noopener noreferrer"
          className={`${BTN} ${TXT} border-amber-500/30 bg-amber-500/10 hover:border-amber-400/60 hover:bg-amber-500/20 group`}
        >
          <Coffee className="w-3.5 h-3.5 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-amber-300 group-hover:text-amber-200">
            {t('footer.support', { defaultValue: 'Postaw kawę ☕' })}
          </span>
        </a>
      </div>

      <p className="text-zinc-600 text-xs tracking-wide">
        {t('footer.version')} • {t('footer.copyright')}
      </p>

      {/* Modale przez portal: strona ma animację (transform), która psuje position: fixed */}
      {createPortal(
        <>
          <ChangelogModal open={open} onClose={() => setOpen(false)} />
          <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
          <LegalModal open={legalOpen} onClose={() => setLegalOpen(false)} />
          <PwaInstallGuideModal open={installModalOpen} onClose={() => setInstallModalOpen(false)} />
        </>,
        document.body,
      )}
    </footer>
  );
};

export default AppFooter;
