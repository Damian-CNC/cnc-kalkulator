import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, MessageSquarePlus } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UnitSwitcher from '@/components/UnitSwitcher';
import ChangelogModal from '@/components/ChangelogModal';
import FeedbackModal from '@/components/FeedbackModal';

const AppFooter = ({ className = '' }: { className?: string }) => {
  const { t } = useTranslation('app');
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <footer
      className={`w-full max-w-4xl mt-10 pt-6 border-t border-zinc-800/80 flex flex-col items-center gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <LanguageSwitcher />
        <UnitSwitcher />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md text-zinc-300 text-sm font-semibold tracking-wide transition-colors hover:text-cyan-400 hover:border-cyan-500/40 active:scale-95"
        >
          <History className="w-4 h-4 text-cyan-400" />
          {t('footer.changelog')}
        </button>
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md text-zinc-400 hover:text-zinc-100 transition-colors text-xs sm:text-sm font-semibold tracking-wide hover:border-cyan-500/40 active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 text-cyan-400" />
          {t('footer.feedback')}
        </button>
      </div>

      <p className="text-zinc-600 text-xs tracking-wide">
        {t('footer.version')} • {t('footer.copyright')}
      </p>

      <ChangelogModal open={open} onClose={() => setOpen(false)} />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

    </footer>
  );
};

export default AppFooter;
