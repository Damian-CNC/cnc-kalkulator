import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Coffee, ExternalLink, Heart, Sparkles, X } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
  onSupportClick: () => void;
}

const SupportModal = ({ open, onClose, onSupportClick }: SupportModalProps) => {
  const { t } = useTranslation('app');
  const { triggerLight, triggerSuccess } = useHaptics();

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

  const handleCoffeeClick = () => {
    triggerSuccess();
    onSupportClick();
  };

  const handleDismiss = () => {
    triggerLight();
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-amber-500/30 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {/* Top Header & Close button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Coffee className="h-6 w-6 animate-pulse" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
                <Sparkles className="w-2.5 h-2.5" />
                {t('support.badge')}
              </div>
              <h2 id="support-modal-title" className="text-lg font-black text-zinc-100 leading-tight">
                {t('support.title')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t('support.later')}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Body */}
        <div className="space-y-3 mb-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p className="font-semibold text-zinc-200">
            {t('support.greeting')}
          </p>
          <p className="text-zinc-400">
            {t('support.desc')}
          </p>

          <div className="p-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 space-y-1.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>{t('support.whatFor', { defaultValue: 'Na co idzie wsparcie?' })}</span>
            </div>
            <ul className="space-y-1 text-zinc-400 pl-5 list-disc marker:text-amber-500/70">
              <li>{t('support.bullet1', { defaultValue: 'Opłacenie hostingu i szybkiej domeny cnchub.app' })}</li>
              <li>{t('support.bullet2', { defaultValue: 'Nowe normy gwintów i zaawansowane kalkulatory' })}</li>
              <li>{t('support.bullet3', { defaultValue: 'Aplikacja pozostaje w 100% darmowa dla każdego' })}</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleCoffeeClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-sm font-extrabold tracking-wide shadow-lg shadow-amber-500/20 transition-all active:scale-98"
          >
            <Coffee className="w-4 h-4 fill-zinc-950" />
            <span>{t('support.cta')}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
          >
            {t('support.later')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SupportModal;
