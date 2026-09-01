import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy } from 'lucide-react';
import ClearFab from '@/components/ClearFab';
import useHaptics from '@/hooks/useHaptics';
import { parseDecimal, sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';
import {
  chamferTolerances,
  findRow,
  linearTolerances,
  type Iso2768Class,
  type Iso2768Row,
} from '@/data/iso2768Data';

const CLASSES: Iso2768Class[] = ['f', 'm', 'c', 'v'];

const fmt = (v: number) => v.toFixed(3);
const fmtDev = (v: number) => v.toFixed(v < 1 ? 2 : 1);

const Iso2768Calculator = () => {
  const { t } = useTranslation('iso2768');
  const { triggerSuccess, triggerLight } = useHaptics();

  const [nominal, setNominal] = useState('');
  const [cls, setCls] = useState<Iso2768Class>('m');
  const [type, setType] = useState<'linear' | 'chamfer'>('linear');
  const [copied, setCopied] = useState(false);

  const rows = type === 'linear' ? linearTolerances : chamferTolerances;
  const value = parseDecimal(nominal);

  const activeRow: Iso2768Row | null = useMemo(
    () => (value !== null && value > 0 ? findRow(rows, value) : null),
    [rows, value]
  );

  const deviation = activeRow ? activeRow[cls] : null;

  const shopText =
    value !== null && deviation !== null
      ? `${value} ±${fmtDev(deviation)} mm (${fmt(value - deviation)} – ${fmt(value + deviation)} mm)`
      : '';

  const handleCopy = async () => {
    if (!shopText) return;
    try {
      await navigator.clipboard.writeText(shopText);
      triggerSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  const clear = () => {
    setNominal('');
    setCls('m');
    setType('linear');
    setCopied(false);
  };

  return (
    <>
      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{t('title')}</h2>

        <div className="flex flex-col mb-5">
          <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
            {t('nominal')}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={nominal}
            onFocus={selectOnFocus}
            onChange={(e) => setNominal(sanitizeDecimal(e.target.value))}
            className="input-field"
          />
        </div>

        <div className="mb-5">
          <span className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
            {t('toleranceClass')}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  triggerLight();
                  setCls(c);
                }}
                className={`px-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  cls === c
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {t(`classes.${c}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <span className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
            {t('dimensionType')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(['linear', 'chamfer'] as const).map((ty) => (
              <button
                key={ty}
                onClick={() => {
                  triggerLight();
                  setType(ty);
                }}
                className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                  type === ty
                    ? 'border-cyan-500/60 bg-cyan-500/10'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <span
                  className={`block text-sm font-semibold ${
                    type === ty ? 'text-cyan-300' : 'text-zinc-300'
                  }`}
                >
                  {t(ty)}
                </span>
                <span className="block text-[11px] text-zinc-500 leading-tight mt-0.5">
                  {t(`${ty}Hint`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          {value === null || value <= 0 ? (
            <p className="text-sm text-zinc-500">{t('enterPrompt')}</p>
          ) : !activeRow ? (
            <p className="text-sm text-amber-400">{t('outOfRange')}</p>
          ) : deviation === null ? (
            <p className="text-sm text-amber-400">{t('noData')}</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs uppercase tracking-wider text-zinc-500">
                  {t('deviation')}
                </span>
                <span className="text-2xl font-bold text-cyan-400">±{fmtDev(deviation)} mm</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                  <span className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                    {t('maxDim')}
                  </span>
                  <span className="text-lg font-bold text-cyan-400">
                    {fmt(value + deviation)} mm
                  </span>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                  <span className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                    {t('minDim')}
                  </span>
                  <span className="text-lg font-bold text-cyan-400">
                    {fmt(value - deviation)} mm
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                    {t('shopNotation')}
                  </span>
                  <span className="block text-sm font-semibold text-zinc-200 break-words">
                    {shopText}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  aria-label={t('copy')}
                  className="ml-auto shrink-0 flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300 active:scale-95"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="hidden sm:inline">{copied ? t('copied') : t('copy')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-module mt-6">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">{t('tableTitle')}</h2>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="text-left font-semibold py-1 pr-2">{t('tableRange')}</th>
                {CLASSES.map((c) => (
                  <th key={c} className="text-right font-semibold py-1 px-2">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isActive = activeRow === row;
                return (
                  <tr
                    key={row.labelKey}
                    className={`transition-all ${
                      isActive ? 'bg-cyan-500/10' : 'bg-zinc-900/40'
                    }`}
                  >
                    <td
                      className={`py-2 pl-2 pr-2 rounded-l-lg whitespace-nowrap border-y border-l ${
                        isActive
                          ? 'border-cyan-500/50 text-cyan-300 font-semibold'
                          : 'border-zinc-800 text-zinc-300'
                      }`}
                    >
                      {t(`ranges.${row.labelKey}`)}
                    </td>
                    {CLASSES.map((c, i) => (
                      <td
                        key={c}
                        className={`py-2 px-2 text-right tabular-nums border-y ${
                          i === CLASSES.length - 1 ? 'rounded-r-lg border-r' : ''
                        } ${
                          isActive
                            ? `border-cyan-500/50 ${c === cls ? 'text-cyan-300 font-bold' : 'text-zinc-300'}`
                            : `border-zinc-800 ${c === cls ? 'text-zinc-200 font-semibold' : 'text-zinc-500'}`
                        }`}
                      >
                        {row[c] === null ? '–' : `±${fmtDev(row[c] as number)}`}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed">{t('note')}</p>
      </div>

      <ClearFab onClear={clear} />
    </>
  );
};

export default Iso2768Calculator;
