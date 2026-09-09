import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, MessageSquarePlus, ShieldCheck, RefreshCw } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UnitSwitcher from '@/components/UnitSwitcher';
import ChangelogModal from '@/components/ChangelogModal';
import FeedbackModal from '@/components/FeedbackModal';
import { LegalModal } from '@/components/DisclaimerGateModal';

/** Unified footer control surface + typography. */
const BTN =
  'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-800/60 shadow-sm transition-all active:scale-95';
const TXT = 'text-xs font-medium text-zinc-300 hover:text-white transition-colors';
const ICON = 'text-cyan-400 w-3.5 h-3.5 shrink-0';

const AppFooter = ({ className = '' }: { className?: string }) => {
  const { t } = useTranslation('app');
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  const handleForceUpdate = async () => {
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
      className={`w-full max-w-4xl mt-10 pt-6 border-t border-zinc-800/80 flex flex-col items-center gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <LanguageSwitcher btnClass={BTN} txtClass={TXT} iconClass={ICON} />
        <UnitSwitcher containerClass={BTN} />
        <button type="button" onClick={handleForceUpdate} className={`${BTN} ${TXT}`}>
          <RefreshCw className={ICON} />
          {t('common.forceUpdate', { defaultValue: 'Wymuś aktualizację' })}
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
      </div>

      <p className="text-zinc-600 text-xs tracking-wide">
        {t('footer.version')} • {t('footer.copyright')}
      </p>

      <ChangelogModal open={open} onClose={() => setOpen(false)} />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <LegalModal open={legalOpen} onClose={() => setLegalOpen(false)} />
    </footer>
  );
};

export default AppFooter;
