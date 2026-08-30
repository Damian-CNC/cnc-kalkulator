import { useEffect, useRef, useState, memo } from 'react';
import { Info } from 'lucide-react';

export interface FormulaParam {
  symbol: string;
  desc: string;
}

interface FormulaHelperProps {
  title: string;
  formula: string;
  params?: FormulaParam[];
  note?: string;
  label?: string;
}

const FormulaHelper = ({ title, formula, params = [], note, label }: FormulaHelperProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label ?? title}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="p-1 rounded-full text-zinc-500 hover:text-cyan-400 transition-colors"
      >
        <Info className="w-4 h-4" />
      </button>

      {open && (
        <span
          role="dialog"
          className="absolute left-0 top-8 z-50 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-zinc-700/70 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-4 text-left"
        >
          <span className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">{title}</span>
          <span className="block rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-3 py-2 font-mono text-sm text-cyan-400 mb-3">
            {formula}
          </span>
          {params.length > 0 && (
            <span className="block space-y-1.5">
              {params.map((p) => (
                <span key={p.symbol} className="flex gap-2 text-xs leading-relaxed">
                  <span className="font-mono font-bold text-zinc-200 shrink-0">{p.symbol}</span>
                  <span className="text-zinc-400">{p.desc}</span>
                </span>
              ))}
            </span>
          )}
          {note && <span className="block mt-3 text-[11px] text-zinc-500">{note}</span>}
        </span>
      )}
    </span>
  );
};

export default memo(FormulaHelper);
