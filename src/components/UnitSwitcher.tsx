import { memo } from 'react';
import { useUnits } from '@/contexts/UnitContext';
import useHaptics from '@/hooks/useHaptics';

type Props = {
  className?: string;
  containerClass?: string;
};

const UnitSwitcher = ({ className = '', containerClass = '' }: Props) => {
  const { system, setSystem } = useUnits();
  const { triggerLight } = useHaptics();

  const base = 'px-2 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-colors';

  const pick = (s: 'metric' | 'imperial') => {
    triggerLight();
    setSystem(s);
  };

  return (
    <div
      role="group"
      aria-label="Units"
      className={`flex items-center gap-1 ${containerClass} ${className}`}
    >
      <button
        type="button"
        onClick={() => pick('metric')}
        aria-pressed={system === 'metric'}
        className={`${base} ${
          system === 'metric'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        MM
      </button>
      <button
        type="button"
        onClick={() => pick('imperial')}
        aria-pressed={system === 'imperial'}
        className={`${base} ${
          system === 'imperial'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        INCH
      </button>
    </div>
  );
};

export default memo(UnitSwitcher);
