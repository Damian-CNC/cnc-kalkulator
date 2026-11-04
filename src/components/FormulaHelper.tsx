import { useEffect, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('app');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={label ?? title}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="p-1 rounded-full text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors inline-flex items-center justify-center shrink-0"
      >
        <Info className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-zinc-800 bg-zinc-950 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
            >
              {/* Header with Title & Close button */}
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-wide truncate">
                    {title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t('common.close', { defaultValue: 'Zamknij' })}
                  className="-m-1 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formula box */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  {t('formulas.formulaLabel', { defaultValue: 'Wzór obliczeniowy' })}
                </p>
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2.5 font-mono text-sm sm:text-base text-cyan-300 font-semibold text-center select-all">
                  {formula}
                </div>
              </div>

              {/* Parameters breakdown */}
              {params.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {t('formulas.paramsLabel', { defaultValue: 'Oznaczenia parametrów' })}
                  </p>
                  <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3">
                    {params.map((p) => (
                      <div key={p.symbol} className="flex items-baseline gap-2.5 text-xs leading-relaxed">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-cyan-300 shrink-0 min-w-[2.25rem] text-center">
                          {p.symbol}
                        </span>
                        <span className="text-zinc-300 flex-1">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional explanatory note */}
              {note && (
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs text-zinc-400 leading-relaxed">
                  💡 {note}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default memo(FormulaHelper);
