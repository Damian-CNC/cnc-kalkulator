import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import usePersistedState from '@/hooks/usePersistedState';
import { MATERIALS, MAT_GROUPS, searchText, type Material, type MatGroup } from '@/lib/materials';
import { CATALOG_COLUMNS } from '@/lib/materialsCatalog';

type State = { q: string; group: MatGroup | 'all' };

// Kolory grup jak w katalogu: P niebieski, M żółty, K łososiowy, N zielony, S pomarańczowy, H szaroniebieski, O szary
const GROUP_STYLE: Record<MatGroup, { on: string; off: string; card: string; badge: string }> = {
  P: {
    on: 'bg-blue-600 border-blue-500 text-white',
    off: 'bg-blue-950/40 border-blue-800/60 text-blue-300 hover:border-blue-600',
    card: 'border-blue-800/50 border-l-4 border-l-blue-400 bg-blue-950/20',
    badge: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
  },
  M: {
    on: 'bg-yellow-500 border-yellow-400 text-zinc-900',
    off: 'bg-yellow-950/30 border-yellow-800/50 text-yellow-300 hover:border-yellow-600',
    card: 'border-yellow-800/40 border-l-4 border-l-yellow-400 bg-yellow-950/15',
    badge: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',
  },
  K: {
    on: 'bg-rose-600 border-rose-500 text-white',
    off: 'bg-rose-950/30 border-rose-800/50 text-rose-300 hover:border-rose-600',
    card: 'border-rose-800/40 border-l-4 border-l-rose-400 bg-rose-950/15',
    badge: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
  },
  N: {
    on: 'bg-emerald-600 border-emerald-500 text-white',
    off: 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 hover:border-emerald-600',
    card: 'border-emerald-800/40 border-l-4 border-l-emerald-400 bg-emerald-950/15',
    badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  },
  S: {
    on: 'bg-orange-600 border-orange-500 text-white',
    off: 'bg-orange-950/30 border-orange-800/50 text-orange-300 hover:border-orange-600',
    card: 'border-orange-800/40 border-l-4 border-l-orange-400 bg-orange-950/15',
    badge: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
  },
  H: {
    on: 'bg-slate-500 border-slate-400 text-white',
    off: 'bg-slate-800/50 border-slate-600/60 text-slate-300 hover:border-slate-400',
    card: 'border-slate-600/50 border-l-4 border-l-slate-400 bg-slate-800/25',
    badge: 'bg-slate-500/20 border-slate-400/40 text-slate-300',
  },
  O: {
    on: 'bg-zinc-500 border-zinc-400 text-white',
    off: 'bg-zinc-800/60 border-zinc-600 text-zinc-300 hover:border-zinc-400',
    card: 'border-zinc-600/50 border-l-4 border-l-zinc-400 bg-zinc-800/30',
    badge: 'bg-zinc-500/20 border-zinc-400/40 text-zinc-300',
  },
};

const EQ_LABEL: Record<(typeof CATALOG_COLUMNS)[number], string> = {
  din: 'DIN', afnor: 'AFNOR', uni: 'UNI', csn: 'ČSN', bs: 'BS', sis: 'SIS', une: 'UNE',
  jis: 'JIS', gost: 'GOST', uns: 'UNS', usa: 'USA',
};

const PAGE = 60;
const norm = (x: string) => x.toLowerCase().replace(/[\s\-/]+/g, '');

const MaterialsPage = () => {
  const { t } = useTranslation('tools');
  const [s, setS, reset] = usePersistedState<State>('materials-db', { q: '', group: 'all' });
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => setLimit(PAGE), [s.q, s.group]);

  const index = useMemo(() => MATERIALS.map((m) => ({ m, text: norm(searchText(m)) })), []);

  const list = useMemo(() => {
    const q = norm(s.q.trim());
    const rows = index.filter(({ m, text }) => {
      if (s.group !== 'all' && !m.groups.includes(s.group)) return false;
      return !q || text.includes(q);
    });
    if (!q) return rows.map((r) => r.m);
    // trafienia dokładne (PN, numer, nazwa, odpowiednik) najpierw
    const exact = (m: Material) => {
      const keys = [
        m.pn.replace(/\(.*\)/, ''),
        m.name,
        ...m.en.split('/'),
        ...Object.values(m.eq).flatMap((v) => (v ?? '').split(';')),
      ].map(norm);
      return keys.includes(q);
    };
    return rows
      .map((r) => r.m)
      .sort((a, b) => Number(exact(b)) - Number(exact(a)));
  }, [index, s.q, s.group]);

  const shown = list.slice(0, limit);

  return (
    <PageLayout title={t('mat.title')}>
      <div className="space-y-4 max-w-xl mx-auto">
        <InputField
          label={t('mat.search')}
          value={s.q}
          onChange={(e) => setS((p) => ({ ...p, q: e.target.value }))}
          numeric={false}
          placeholder="NC11LV, 2H13, PA4, 1.2379, 1045, SUS304…"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setS((p) => ({ ...p, group: 'all' }))}
            className={`px-3 py-2 rounded-xl font-bold text-xs transition-all border ${
              s.group === 'all'
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {t('mat.all')}
          </button>
          {MAT_GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setS((p) => ({ ...p, group: g }))}
              className={`px-3 py-2 rounded-xl font-bold text-xs transition-all border ${
                s.group === g ? GROUP_STYLE[g].on : GROUP_STYLE[g].off
              }`}
            >
              {g} · {t(`mat.groups.${g}`)}
            </button>
          ))}
        </div>

        <p className="text-xs text-zinc-500">
          {t('mat.count', { n: list.length })}
        </p>

        <div className="space-y-3">
          {shown.map((m) => {
            const st = GROUP_STYLE[m.group];
            const eqEntries = CATALOG_COLUMNS.filter((c) => m.eq[c]).map((c) => [EQ_LABEL[c], m.eq[c]] as const);
            return (
              <div key={m.id} className={`rounded-xl border p-4 ${st.card}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-zinc-100 break-words">{m.name}</p>
                  <div className="flex shrink-0 gap-1">
                    {m.groups.map((g) => (
                      <span
                        key={g}
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GROUP_STYLE[g].badge}`}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                {m.cmc.length > 0 && (
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {t('mat.cmc')}: {m.cmc.join(' · ')}
                  </p>
                )}
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500">{t('mat.en')}</p>
                    <p className="text-zinc-300 break-words">{m.en || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t('mat.pn')}</p>
                    <p className="text-zinc-300">{m.pn || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t('mat.us')}</p>
                    <p className="text-zinc-300 break-words">{m.us}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t('mat.rho')} [g/cm³]</p>
                    {m.rho === null ? (
                      <span className="text-zinc-600">—</span>
                    ) : (
                      <CopyableValue value={String(m.rho)}>
                        <span className="text-emerald-400 font-semibold">{m.rho}</span>
                      </CopyableValue>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{t('mat.alpha')} [µm/(m·K)]</p>
                    {m.alpha === null ? (
                      <span className="text-zinc-600">—</span>
                    ) : (
                      <CopyableValue value={String(m.alpha)}>
                        <span className="text-emerald-400 font-semibold">{m.alpha}</span>
                      </CopyableValue>
                    )}
                  </div>
                </div>
                {m.alt && <p className="mt-2 text-xs text-zinc-500">{m.alt}</p>}
                {eqEntries.length > 0 && (
                  <details className="mt-2 group">
                    <summary className="cursor-pointer text-xs font-semibold text-cyan-400 select-none">
                      {t('mat.eqTitle')} ({eqEntries.length})
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {eqEntries.map(([label, value]) => (
                        <div key={label}>
                          <span className="text-zinc-500">{label}: </span>
                          <span className="text-zinc-300 break-words">{value}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
          {list.length === 0 && <p className="text-sm text-zinc-500 text-center py-6">{t('mat.empty')}</p>}
        </div>

        {list.length > shown.length && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLimit((l) => l + PAGE)}
              className="py-3 rounded-xl font-bold text-sm border bg-zinc-900 border-zinc-800 text-cyan-400 hover:border-zinc-700"
            >
              {t('mat.more')}
            </button>
            <button
              type="button"
              onClick={() => setLimit(list.length)}
              className="py-3 rounded-xl font-bold text-sm border bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            >
              {t('mat.showAll', { n: list.length })}
            </button>
          </div>
        )}

        <p className="text-xs text-zinc-600 text-center leading-relaxed px-2">{t('mat.footer')}</p>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default MaterialsPage;
