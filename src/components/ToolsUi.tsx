import type { ReactNode } from 'react';
import CopyableValue from '@/components/CopyableValue';

/** Duży, kopiowalny wynik główny. */
export const BigResult = ({
  label,
  value,
  unit,
  copy,
}: {
  label: string;
  value: string;
  unit?: string;
  copy?: string;
}) => (
  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
    <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{label}</div>
    <CopyableValue value={copy ?? value}>
      <span className="text-3xl font-bold text-cyan-400 tabular-nums">
        {value}
        {unit ? <span className="ml-2 text-lg text-zinc-400">{unit}</span> : null}
      </span>
    </CopyableValue>
  </div>
);

/** Wiersz: etykieta po lewej, wartość po prawej. */
export const ResultRow = ({
  label,
  value,
  unit,
  copy,
  strong = false,
}: {
  label: ReactNode;
  value: string;
  unit?: string;
  copy?: string;
  strong?: boolean;
}) => (
  <div className="flex items-baseline justify-between gap-4 py-2 border-t border-zinc-800 first:border-t-0 text-sm">
    <span className="text-zinc-500">{label}</span>
    <CopyableValue value={copy ?? value}>
      <span className={`tabular-nums font-bold ${strong ? 'text-cyan-400' : 'text-zinc-200'}`}>
        {value}
        {unit ? <span className="ml-1 font-normal text-zinc-500">{unit}</span> : null}
      </span>
    </CopyableValue>
  </div>
);

/** Baner statusu: ok / ostrzeżenie / błąd. */
export const Banner = ({
  tone,
  children,
}: {
  tone: 'ok' | 'warn' | 'bad';
  children: ReactNode;
}) => {
  const cls =
    tone === 'ok'
      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
      : tone === 'warn'
        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
        : 'bg-red-500/10 border-red-500/40 text-red-400';
  return <div className={`rounded-xl border p-3 text-sm leading-relaxed ${cls}`}>{children}</div>;
};

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{children}</h2>
);

/** Zaokrągla do n miejsc, zamieniając -0 na 0. */
export const fmt = (v: number, digits = 3): string => {
  const s = v.toFixed(digits);
  return /^-0(\.0+)?$/.test(s) ? s.slice(1) : s;
};
