import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GripVertical } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';
import { type TileDefinition, LUCIDE_ICONS } from '@/types/menu';

const HOLD_DURATION = 1500; // 1.5 sekundy
const MOVE_TOLERANCE = 12; // piksele przesunięcia anulujące przytrzymanie (np. przy scrollu)

interface MenuTileProps {
  tile: TileDefinition;
  index: number;
  isEditMode: boolean;
  onStartEdit: () => void;
}

export const MenuTile = ({
  tile,
  index,
  isEditMode,
  onStartEdit,
}: MenuTileProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { triggerLight, triggerSuccess } = useHaptics();

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isHoldingRef = useRef(false);

  const cancelHold = useCallback(() => {
    isHoldingRef.current = false;
    setIsHolding(false);
    setHoldProgress(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
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
    startTimeRef.current = Date.now();
    isHoldingRef.current = true;
    setIsHolding(true);
    setHoldProgress(0);

    const updateProgress = () => {
      if (!isHoldingRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION);
      setHoldProgress(progress);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);

    timerRef.current = setTimeout(() => {
      if (!isHoldingRef.current) return;
      cancelHold();
      triggerSuccess();
      onStartEdit();
    }, HOLD_DURATION);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current || !isHoldingRef.current) return;
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
    // Jeśli nie jesteśmy w trybie edycji i kliknięcie było krótkie:
    triggerLight();
    navigate(tile.route);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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
        className="w-[60px] h-[60px] md:w-[67px] md:h-[67px] text-cyan-400 shrink-0 pointer-events-none transition-transform"
        strokeWidth={isLucide ? 0.85 : 2.25}
      />

      {/* Tytuł kafelka */}
      <span className="text-sm sm:text-base md:text-sm font-semibold text-zinc-200 leading-tight pointer-events-none">
        {t(tile.labelKey)}
      </span>
    </div>
  );
};

export default MenuTile;
