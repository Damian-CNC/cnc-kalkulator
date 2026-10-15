import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Sparkles, X } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';

const HINT_STORAGE_KEY = 'cnc_menu_hint_dismissed';

interface MenuOnboardingHintProps {
  onStartEdit: () => void;
}

export const MenuOnboardingHint = ({ onStartEdit }: MenuOnboardingHintProps) => {
  const { t } = useTranslation();
  const { triggerLight } = useHaptics();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(HINT_STORAGE_KEY) === 'true';
      if (!dismissed) {
        setVisible(true);
      }
    } catch {
      /* noop */
    }
  }, []);

  const dismiss = () => {
    triggerLight();
    setVisible(false);
    try {
      localStorage.setItem(HINT_STORAGE_KEY, 'true');
    } catch {
      /* noop */
    }
  };

  const handleTryNow = () => {
    dismiss();
    onStartEdit();
  };

  if (!visible) return null;

  return (
    <div className="w-full max-w-4xl md:max-w-[44.8rem] mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="relative rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-zinc-900/90 to-zinc-900/90 p-4 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('common.clear')}
          className="absolute top-3 right-3 p-1 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
            <SlidersHorizontal className="h-5 w-5" />
          </span>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                Nowość
              </span>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100">
                {t('menuEdit.hintTitle')}
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-3">
              {t('menuEdit.hintDesc')}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTryNow}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all active:scale-95"
              >
                {t('menuEdit.hintTry')}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {t('menuEdit.hintCta')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOnboardingHint;
