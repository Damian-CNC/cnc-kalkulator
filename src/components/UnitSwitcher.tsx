import { memo } from 'react';
import { useUnits } from '@/contexts/UnitContext';

const UnitSwitcher = ({ className = '' }: { className?: string }) => {
  const { system, setSystem } = useUnits();

  const base =
    'px-2 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-colors';

  return (
    <div
      role="group"
      aria-label="Units"
      className={`flex items-center gap-0.5 p-0.5 rounded-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md ${className}`}
    >
      <button
        type="button"
        onClick={() => setSystem('metric')}
        aria-pressed={system === 'metric'}
        className={`${base} ${
          system === 'metric' ? 'bg-cyan-500/15 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        MM
      </button>
      <button
        type="button"
        onClick={() => setSystem('imperial')}
        aria-pressed={system === 'imperial'}
        className={`${base} ${
          system === 'imperial' ? 'bg-cyan-500/15 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        INCH
      </button>
    </div>
  );
};

export default memo(UnitSwitcher);
