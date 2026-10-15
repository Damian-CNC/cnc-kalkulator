import { useTranslation } from 'react-i18next';
import { MinusCircle, X } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';

interface MenuSpacerProps {
  id: string;
  index: number;
  isEditMode: boolean;
  onRemove: (id: string) => void;
}

export const MenuSpacer = ({
  id,
  index,
  isEditMode,
  onRemove,
}: MenuSpacerProps) => {
  const { t } = useTranslation();
  const { triggerWarning } = useHaptics();

  if (!isEditMode) {
    // W trybie zwykłym: niewidoczny blok zajmujący 1 slot w siatce
    return (
      <div
        aria-hidden="true"
        className="relative aspect-square w-full pointer-events-none invisible"
      />
    );
  }

  const jiggleClass =
    index % 2 === 0 ? 'animate-jiggle' : 'animate-jiggle-alt';

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerWarning();
    onRemove(id);
  };

  return (
    <div
      className={`relative aspect-square w-full select-none rounded-2xl border-2 border-dashed border-zinc-700/80 bg-zinc-900/40 flex flex-col items-center justify-center gap-1.5 p-3 text-center cursor-grab active:cursor-grabbing touch-manipulation transition-all hover:border-zinc-500 hover:bg-zinc-800/30 ${jiggleClass}`}
    >
      {/* Przycisk usuwania odstępu */}
      <button
        type="button"
        onClick={handleRemove}
        aria-label={t('menuEdit.removeSpacer')}
        className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 hover:bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        <X className="w-4 h-4" />
      </button>

      <MinusCircle className="w-8 h-8 text-zinc-500 stroke-1" />
      <span className="text-xs font-medium text-zinc-400">
        {t('menuEdit.spacerLabel')}
      </span>
    </div>
  );
};

export default MenuSpacer;
