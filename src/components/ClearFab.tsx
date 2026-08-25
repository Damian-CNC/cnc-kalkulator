import { RotateCcw } from 'lucide-react';

interface ClearFabProps {
  onClear: () => void;
  label?: string;
}

const ClearFab = ({ onClear, label = 'Wyczyść' }: ClearFabProps) => (
  <button
    onClick={onClear}
    aria-label={label}
    className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-700/60 text-zinc-300 text-sm font-semibold tracking-wide shadow-lg backdrop-blur-md transition-all active:scale-95 hover:text-zinc-100 hover:border-zinc-600"
    style={{
      backgroundColor: 'rgba(24, 24, 27, 0.65)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
      marginBottom: 'env(safe-area-inset-bottom)',
    }}
  >
    <RotateCcw className="w-4 h-4 text-cyan-400" />
    <span>{label}</span>
  </button>
);

export default ClearFab;
