import { memo } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useHaptics from '@/hooks/useHaptics';

interface ClearFabProps {
  onClear: () => void;
  label?: string;
}

const ClearFab = ({ onClear, label }: ClearFabProps) => {
  const { t } = useTranslation();
  const { triggerWarning } = useHaptics();
  const text = label ?? t('common.clearAll');

  const button = (
    <button
      onClick={() => {
        triggerWarning();
        onClear();
      }}
      aria-label={text}
      className="fixed right-4 sm:right-8 z-50 flex items-center justify-center gap-2 w-12 h-12 p-0 sm:w-auto sm:px-4 sm:py-2.5 rounded-full border border-zinc-700/60 bg-zinc-900/85 text-zinc-300 text-sm font-semibold tracking-wide shadow-xl backdrop-blur-md transition-all duration-200 active:scale-95 hover:text-red-400 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(2rem+env(safe-area-inset-bottom))]"
    >
      <RotateCcw className="w-5 h-5 sm:w-4 sm:h-4 text-cyan-400" />
      <span className="hidden sm:inline">{text}</span>
    </button>
  );

  // Portal do <body>: animowana strona ma transform, który robi z niej
  // "kontener" dla position: fixed. Przycisk przypinałby się wtedy do dołu
  // strony zamiast do dołu ekranu.
  return createPortal(button, document.body);
};

export default memo(ClearFab);
