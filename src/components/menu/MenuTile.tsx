import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';
import { type TileDefinition, LUCIDE_ICONS } from '@/types/menu';

const GRACE_DELAY = 500; // 0.5 sekundy bufora (żadnego naliczania i animacji - swobodny scroll)
const HOLD_DURATION = 750; // 0.75 sekundy widocznego ładowania kółka
const MOVE_TOLERANCE = 8; // małe przesunięcie palca podczas bufora od razu anuluje i pozwala na scroll

interface MenuTileProps {
  tile: TileDefinition;
  index: number;
  totalItems: number;
  isEditMode: boolean;
  onStartEdit: () => void;
  onMove?: (direction: 'left' | 'right') => void;
}

export const MenuTile = ({
  tile,
  index,
  totalItems,
  isEditMode,
  onStartEdit,
  onMove,
}: MenuTileProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { triggerLight, triggerSuccess } = useHaptics();

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const isGraceActiveRef = useRef(false);
  const isHoldingVisualRef = useRef(false);

  const cancelHold = useCallback(() => {
    isGraceActiveRef.current = false;
    isHoldingVisualRef.current = false;
    setIsHolding(false);
    setHoldProgress(0);
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditMode) return;
    // Tylko lewy przycisk myszy lub dotyk
    if (e.button !== 0) return;

    startPosRef.current = { x: e.clientX, y: e.clientY };
    isGraceActiveRef.current = true;

    // Faza 1: Cichy bufor 0.5s - żadnych animacji, pełna swoboda scrolla
    graceTimerRef.current = setTimeout(() => {
      if (!isGraceActiveRef.current) return;
      // Faza 2: Po 0.5s bezruchu aktywujemy widoczne ładowanie pierścienia przez 0.75s
      isGraceActiveRef.current = false;
      isHoldingVisualRef.current = true;
      setIsHolding(true);
      setHoldProgress(0);
      holdStartTimeRef.current = Date.now();

      const updateProgress = () => {
        if (!isHoldingVisualRef.current) return;
        const elapsed = Date.now() - holdStartTimeRef.current;
        const progress = Math.min(1, elapsed / HOLD_DURATION);
        setHoldProgress(progress);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };
      animFrameRef.current = requestAnimationFrame(updateProgress);

      holdTimerRef.current = setTimeout(() => {
        if (!isHoldingVisualRef.current) return;
        cancelHold();
        triggerSuccess();
        onStartEdit();
      }, HOLD_DURATION);
    }, GRACE_DELAY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current) return;
    if (!isGraceActiveRef.current && !isHoldingVisualRef.current) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) {
      cancelHold();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      return;
    }
    cancelHold();
    triggerLight();
    navigate(tile.route);
  };

  useEffect(() => {
    return () => {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const Icon = tile.icon;
  const isLucide = LUCIDE_ICONS.includes(Icon);
  const jiggleClass = isEditMode
    ? index % 2 === 0
      ? 'animate-jiggle'
      : 'animate-jiggle-alt'
    : '';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onClick={handleClick}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
      style={{ touchAction: isEditMode ? 'none' : 'pan-y' }}
      className={`relative aspect-square w-full select-none rounded-2xl border flex flex-col items-center justify-center gap-2 p-3 text-center cursor-pointer transition-all touch-manipulation md:gap-1.5 md:p-2.5 ${
        isEditMode
          ? `border-cyan-500/50 bg-zinc-900/90 shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-grab active:cursor-grabbing ${jiggleClass}`
          : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95'
      }`}
    >
      {/* Pierścień postępu przytrzymania (1.5s) */}
      {isHolding && !isEditMode && (
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none rounded-2xl -rotate-90 z-20"
          viewBox="0 0 100 100"
        >
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="16"
            fill="none"
            stroke="rgba(6,182,212,0.25)"
            strokeWidth="3.5"
          />
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="16"
            fill="none"
            stroke="#00f4e2"
            strokeWidth="3.5"
            strokeDasharray="376"
            strokeDashoffset={376 * (1 - holdProgress)}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Uchwyt przeciągania w trybie edycji */}
      {isEditMode && (
        <span className="absolute top-2 left-2 p-1 text-zinc-500 bg-zinc-950/60 rounded-md border border-zinc-800/80 pointer-events-none">
          <GripVertical className="w-3.5 h-3.5 text-cyan-400/80" />
        </span>
      )}

      {/* Etykieta NEW */}
      {tile.isNew && (
        <span className="absolute top-2 right-2 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
          {t('common.new')}
        </span>
      )}

      {/* Ikona kafelka */}
      <Icon
        className="w-[60px] h-[60px] md:w-[66px] md:h-[66px] text-cyan-400 shrink-0 pointer-events-none transition-transform"
        strokeWidth={isLucide ? 1.75 : 2.25}
      />

      {/* Tytuł kafelka */}
      <span className="text-sm sm:text-base md:text-sm font-semibold text-zinc-200 leading-tight pointer-events-none">
        {t(tile.labelKey)}
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

export default MenuTile;
