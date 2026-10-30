/**
 * ThreadResultCards – Unified display components for all thread calculator pages.
 *
 * Color scheme (strictly consistent across ALL thread types):
 *  🟢 Emerald – Diameter cards (Średnica zewnętrzna / podziałowa / wewnętrzna)
 *  🟡 Amber   – Pitch card (Skok gwintu / TPI / Lead)
 *  🔵 Cyan    – Depth of cut card (Głębokość nacinania)
 *  🟣 Violet  – Drill card (Wiertło pod gwintownik / otwór)
 *  ⚪ Zinc    – Auxiliary cards (Spłaszczenia, promienie, długości)
 *
 * Each diameter card shows:
 *  - Label (in emerald-300)
 *  - MAX & MIN dimensions with copyable values
 *  - Tolerance band (MAX − MIN) + tolerance class badge (e.g. 6g, 6H, 7e, 2A)
 */

import CopyableValue from '@/components/CopyableValue';
import useLength from '@/hooks/useLength';
import { useTranslation } from 'react-i18next';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

export type BaseUnit = 'mm' | 'in';

export interface MinMax {
  max: number;
  min: number;
  tol?: number;
}

/* ─────────────────────────────────────────────
   DiameterCard  🟢  (średnice: zewnętrzna / podziałowa / wewnętrzna)
───────────────────────────────────────────── */

export interface DiameterCardProps {
  /** Card label, e.g. "Średnica zewnętrzna (d)" */
  label: string;
  /** Raw numeric limits in the native unit (mm or in) */
  limits: MinMax | null;
  /** Unit system the raw values are stored in */
  unit: BaseUnit;
  /** Optional nominal / theoretical value */
  nominal?: number | null;
  /** Tolerance class string, e.g. "6g", "6H", "7e", "2A" */
  tolClass?: string;
  /** Decimal precision override */
  digits?: number;
  /** Optional footnote note */
  note?: string;
}

export function DiameterCard({
  label,
  limits,
  unit,
  nominal,
  tolClass,
  digits = 3,
  note,
}: DiameterCardProps) {
  const L = useLength(unit);

  const fmt = (v: number) => {
    if (unit === 'in') return L.val(v, digits);
    return v.toFixed(digits);
  };
  const raw = (v: number) => {
    if (unit === 'in') return L.raw(v, digits);
    return v.toFixed(digits);
  };

  const dispUnit = L.unit;
  const tol = limits ? (limits.tol ?? Math.abs(limits.max - limits.min)) : null;
  const isToleranceZero = tol === 0 || (limits !== null && limits.max === limits.min);

  return (
    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 md:p-3">
      <div className="flex items-center justify-between mb-2 md:mb-1.5">
        <p className="text-emerald-300 text-sm md:text-xs font-semibold">{label}</p>
        {tolClass && (
          <span className="text-[11px] md:text-[10px] px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 font-mono font-bold tracking-wide">
            {tolClass}
          </span>
        )}
      </div>

      {nominal !== null && nominal !== undefined && (
        <p className="text-zinc-500 text-xs md:text-[11px] mb-2.5 md:mb-1.5">
          Nominalny:&nbsp;
          <span className="text-zinc-400 font-medium">
            {unit === 'in' ? L.val(nominal, digits) : nominal.toFixed(digits)} {dispUnit}
          </span>
        </p>
      )}

      {limits ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:gap-2">
            <div>
              <p className="text-zinc-500 text-[11px] md:text-[10px] uppercase tracking-wider mb-0.5">Max</p>
              <p className="text-xl md:text-lg font-bold text-emerald-400 leading-tight">
                <CopyableValue value={raw(limits.max)}>{fmt(limits.max)}</CopyableValue>
                <span className="text-xs text-zinc-500 font-normal ml-1">{dispUnit}</span>
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-[11px] md:text-[10px] uppercase tracking-wider mb-0.5">Min</p>
              <p className="text-xl md:text-lg font-bold text-emerald-300 leading-tight">
                <CopyableValue value={raw(limits.min)}>{fmt(limits.min)}</CopyableValue>
                <span className="text-xs text-zinc-500 font-normal ml-1">{dispUnit}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-emerald-900/40 text-[11px] md:text-[10px]">
            {!isToleranceZero && tol !== null ? (
              <span className="text-emerald-700 font-medium">
                Tolerancja: {unit === 'in' ? L.fmt(tol, digits) : tol.toFixed(digits)} {dispUnit}
              </span>
            ) : (
              <span className="text-zinc-500 italic">
                Wymiar bazowy / nominalny
              </span>
            )}
            {note && <span className="text-emerald-600/90 text-right">({note})</span>}
          </div>
        </>
      ) : (
        <div>
          {nominal !== null && nominal !== undefined ? (
            <p className="text-xl md:text-lg font-bold text-emerald-400">
              <CopyableValue value={raw(nominal)}>{fmt(nominal)}</CopyableValue>
              <span className="text-xs text-zinc-500 font-normal ml-1">{dispUnit}</span>
            </p>
          ) : (
            <p className="text-zinc-600 text-sm md:text-xs italic">Brak danych tolerancji</p>
          )}
          {note && <p className="text-emerald-700/80 text-[11px] md:text-[10px] mt-1.5">({note})</p>}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PitchCard  🟡  (skok gwintu / lead / TPI)
───────────────────────────────────────────── */

export interface PitchCardProps {
  label?: string;
  /** Pitch value in native unit (mm or in) */
  pitch: number;
  unit: BaseUnit;
  /** Optional lead (posuw) for multi-start threads */
  lead?: number;
  /** TPI (threads per inch) – optional */
  tpi?: number;
  /** Additional note (e.g. kąt wzniosu) */
  note?: string;
  digits?: number;
}

export function PitchCard({
  label = 'Skok gwintu (P)',
  pitch,
  unit,
  lead,
  tpi,
  note,
  digits = 4,
}: PitchCardProps) {
  const L = useLength(unit);
  const dispUnit = L.unit;

  const fmtVal = (v: number) => (unit === 'in' ? L.val(v, digits) : v.toFixed(digits));
  const rawVal = (v: number) => (unit === 'in' ? L.raw(v, digits) : v.toFixed(digits));

  const hasExtra = tpi !== undefined || (lead !== undefined && lead !== pitch);

  return (
    <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 md:p-3">
      <p className="text-amber-300 text-sm md:text-xs font-semibold mb-2 md:mb-1.5">{label}</p>

      <div className={`grid ${hasExtra ? 'grid-cols-2' : 'grid-cols-1'} gap-3 md:gap-2`}>
        <div>
          <p className="text-zinc-500 text-[11px] md:text-[10px] uppercase tracking-wider mb-0.5">Skok (P)</p>
          <p className="text-2xl md:text-xl font-bold text-amber-400 leading-tight">
            <CopyableValue value={rawVal(pitch)}>{fmtVal(pitch)}</CopyableValue>
            <span className="text-sm md:text-xs text-amber-500/80 font-normal ml-1">{dispUnit}</span>
          </p>
        </div>

        {tpi !== undefined && (
          <div>
            <p className="text-zinc-500 text-[11px] md:text-[10px] uppercase tracking-wider mb-0.5">Zwoje na cal</p>
            <p className="text-2xl md:text-xl font-bold text-amber-300 leading-tight">
              {tpi}
              <span className="text-xs text-amber-500/80 font-normal ml-1">TPI</span>
            </p>
          </div>
        )}

        {lead !== undefined && lead !== pitch && (
          <div>
            <p className="text-zinc-500 text-[11px] md:text-[10px] uppercase tracking-wider mb-0.5">Posuw (L)</p>
            <p className="text-xl md:text-lg font-bold text-amber-300 leading-tight">
              <CopyableValue value={rawVal(lead)}>{fmtVal(lead)}</CopyableValue>
              <span className="text-xs text-zinc-500 font-normal ml-1">{dispUnit}</span>
            </p>
          </div>
        )}
      </div>

      {note && <p className="text-amber-700/80 text-[11px] md:text-[10px] mt-2 pt-2 border-t border-amber-900/40">({note})</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DepthCard  🔵  (głębokość nacinania / thread height)
───────────────────────────────────────────── */

export interface DepthCardProps {
  label?: string;
  depth: number;
  unit: BaseUnit;
  note?: string;
  digits?: number;
}

export function DepthCard({
  label,
  depth,
  unit,
  note,
  digits = 3,
}: DepthCardProps) {
  const { t } = useTranslation('threadsCalc');
  const resolvedLabel = label ?? t('threads.threadDepth', { defaultValue: 'Głębokość nacinania' });
  const L = useLength(unit);
  const dispUnit = L.unit;
  const fmtVal = unit === 'in' ? L.val(depth, digits) : depth.toFixed(digits);
  const rawVal = unit === 'in' ? L.raw(depth, digits) : depth.toFixed(digits);

  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4 md:p-3">
      <p className="text-cyan-300 text-sm md:text-xs font-semibold mb-1">{resolvedLabel}</p>
      <p className="text-2xl md:text-xl font-bold text-cyan-400 leading-tight">
        <CopyableValue value={rawVal}>{fmtVal}</CopyableValue>
        <span className="text-base md:text-sm text-cyan-500/80 font-normal ml-1">{dispUnit}</span>
      </p>
      {note && <p className="text-cyan-600 text-[11px] md:text-[10px] mt-1.5">({note})</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DrillCard  🟣  (wiertło pod gwintownik / otwór)
───────────────────────────────────────────── */

export interface DrillCardProps {
  label?: string;
  diameter: number;
  unit: BaseUnit;
  note?: string;
  metricDrill?: number | null;
  digits?: number;
}

export function DrillCard({
  label,
  diameter,
  unit,
  note,
  metricDrill,
  digits = 3,
}: DrillCardProps) {
  const { t } = useTranslation('threadsCalc');
  const resolvedLabel = label ?? t('threads.tapDrill', { defaultValue: 'Wiertło pod gwintownik' });
  const L = useLength(unit);
  const dispUnit = L.unit;
  const fmtVal = unit === 'in' ? L.val(diameter, digits) : diameter.toFixed(digits);
  const rawVal = unit === 'in' ? L.raw(diameter, digits) : diameter.toFixed(digits);

  return (
    <div className="rounded-xl border border-violet-800/40 bg-violet-950/20 p-4 md:p-3">
      <p className="text-violet-300 text-sm md:text-xs font-semibold mb-1">{resolvedLabel}</p>
      <p className="text-2xl md:text-xl font-bold text-violet-400 leading-tight">
        Ø <CopyableValue value={rawVal}>{fmtVal}</CopyableValue>
        <span className="text-base md:text-sm text-violet-500/80 font-normal ml-1">{dispUnit}</span>
      </p>
      {metricDrill !== null && metricDrill !== undefined && !L.isImperial && (
        <p className="text-violet-400/90 text-sm md:text-xs mt-1">
          {t('threads.metricDrill', { val: metricDrill.toFixed(1), defaultValue: `Wiertło metryczne: Ø${metricDrill.toFixed(1)} mm` })}
        </p>
      )}
      {note && <p className="text-violet-600 text-[11px] md:text-[10px] mt-1.5">({note})</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AuxCard  ⚪  (wartości dodatkowe – spłaszczenia, promienie itp.)
───────────────────────────────────────────── */

export interface AuxCardProps {
  label: string;
  value: number;
  unit: BaseUnit;
  note?: string;
  prefix?: string;
  digits?: number;
}

export function AuxCard({
  label,
  value,
  unit,
  note,
  prefix,
  digits = 4,
}: AuxCardProps) {
  const L = useLength(unit);
  const dispUnit = L.unit;
  const fmtVal = unit === 'in' ? L.val(value, digits) : value.toFixed(digits);
  const rawVal = unit === 'in' ? L.raw(value, digits) : value.toFixed(digits);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 md:p-3">
      <p className="text-zinc-400 text-sm md:text-xs font-medium mb-1">{label}</p>
      <p className="text-xl md:text-lg font-bold text-zinc-100 leading-tight">
        {prefix && <span className="text-zinc-500 font-normal mr-1">{prefix}</span>}
        <CopyableValue value={rawVal}>{fmtVal}</CopyableValue>
        <span className="text-sm md:text-xs text-zinc-500 font-normal ml-1">{dispUnit}</span>
      </p>
      {note && <p className="text-zinc-600 text-[11px] md:text-[10px] mt-1.5">({note})</p>}
    </div>
  );
}
