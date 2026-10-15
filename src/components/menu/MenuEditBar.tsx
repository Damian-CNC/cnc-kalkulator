import { useTranslation } from 'react-i18next';
import { Check, Plus, RotateCcw } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';

interface MenuEditBarProps {
  onAddSpacer: () => void;
  onReset: () => void;
  onDone: () => void;
}

export const MenuEditBar = ({
  onAddSpacer,
  onReset,
  onDone,
}: MenuEditBarProps) => {
  const { t } = useTranslation();
  const { triggerLight, triggerSuccess, triggerWarning } = useHaptics();

  const handleAdd = () => {
    triggerLight();
    onAddSpacer();
  };

  const handleReset = () => {
    triggerWarning();
    if (window.confirm(t('menuEdit.resetConfirm'))) {
      onReset();
    }
  };

  const handleDone = () => {
    triggerSuccess();
    onDone();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none animate-in slide-in-from-bottom duration-300">
      <div className="pointer-events-auto mx-auto flex max-w-xl items-center justify-between gap-2 rounded-2xl border border-cyan-500/40 bg-zinc-900/95 p-2.5 backdrop-blur-xl shadow-2xl shadow-cyan-950/50">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dodaj puste miejsce */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white hover:border-zinc-500 hover:bg-zinc-700/80 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>{t('menuEdit.addSpacer')}</span>
          </button>

          {/* Domyślny układ */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">{t('menuEdit.reset')}</span>
          </button>
        </div>

        {/* Zakończ edycję */}
        <button
          type="button"
          onClick={handleDone}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-zinc-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-cyan-300 transition-all active:scale-95"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{t('menuEdit.done')}</span>
        </button>
      </div>
    </div>
  );
};

export default MenuEditBar;
