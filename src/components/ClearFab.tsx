import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { m, useIsPresent } from 'framer-motion';
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
  // Strona wyjeżdżająca (AnimatePresence) zostaje w DOM do końca animacji.
  // Portal jest poza nią, więc bez tego przycisk wisiałby nad wjeżdżającym menu
  // i znikał dopiero po animacji (mrugnięcie ekranu).
  const isPresent = useIsPresent();
  // Przycisk montujemy dopiero po wjeździe strony (animacja trwa 0,28 s), żeby nie
  // obciążać jej renderowaniem i nie dokładać półprzezroczystego, rozmytego elementu
  // na ruchomą warstwę (na iPhonie powodowało to przycinanie).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 320);
    return () => window.clearTimeout(id);
  }, []);
  const text = label ?? t('common.clearAll');

  const button = (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
    <button
      onClick={() => {
        triggerWarning();
        onClear();
      }}
      aria-label={text}
      className="fixed right-4 sm:right-8 z-50 flex items-center justify-center gap-2 w-12 h-12 p-0 sm:w-auto sm:px-4 sm:py-2.5 rounded-full border border-zinc-700/60 bg-zinc-900/95 text-zinc-300 text-sm font-semibold tracking-wide shadow-xl transition-colors duration-200 active:scale-95 hover:text-red-400 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(2rem+env(safe-area-inset-bottom))]"
    >
      <RotateCcw className="w-5 h-5 sm:w-4 sm:h-4 text-cyan-400" />
      <span className="hidden sm:inline">{text}</span>
    </button>
    </m.div>
  );

  if (!isPresent || !ready) return null;

  // Portal do <body>: animowana strona ma transform, który robi z niej
  // "kontener" dla position: fixed. Przycisk przypinałby się wtedy do dołu
  // strony zamiast do dołu ekranu.
  return createPortal(button, document.body);
};

export default memo(ClearFab);
