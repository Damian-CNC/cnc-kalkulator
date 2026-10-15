import { useTranslation } from 'react-i18next';
import { MinusCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';

interface MenuSpacerProps {
  id: string;
  index: number;
  totalItems: number;
  isEditMode: boolean;
  onRemove: (id: string) => void;
  onMove?: (direction: 'left' | 'right') => void;
}

export const MenuSpacer = ({
  id,
  index,
  totalItems,
  isEditMode,
  onRemove,
  onMove,
}: MenuSpacerProps) => {
  const { t } = useTranslation();
  const { triggerLight, triggerWarning } = useHaptics();

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
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
      style={{ touchAction: 'none' }}
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

      {/* Przyciski przesuwania w lewo / w prawo w trybie edycji (dla PC i wygody) */}
      {isEditMode && onMove && (
        <div className="absolute inset-x-2 bottom-1.5 flex items-center justify-between pointer-events-none z-30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerLight();
              onMove('left');
            }}
            disabled={index === 0}
            aria-label={t('menuEdit.moveLeft')}
            title={t('menuEdit.moveLeft')}
            className={`pointer-events-auto p-1 rounded-lg bg-zinc-950/80 border border-zinc-700/80 text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/60 active:scale-90 transition-all ${
              index === 0 ? 'opacity-25 pointer-events-none' : 'hover:bg-zinc-800'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerLight();
              onMove('right');
            }}
            disabled={index >= totalItems - 1}
            aria-label={t('menuEdit.moveRight')}
            title={t('menuEdit.moveRight')}
            className={`pointer-events-auto p-1 rounded-lg bg-zinc-950/80 border border-zinc-700/80 text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/60 active:scale-90 transition-all ${
              index >= totalItems - 1 ? 'opacity-25 pointer-events-none' : 'hover:bg-zinc-800'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuSpacer;
