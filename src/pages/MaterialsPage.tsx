import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import usePersistedState from '@/hooks/usePersistedState';
import { MATERIALS, MAT_GROUPS, type MatGroup } from '@/lib/materials';

type State = { q: string; group: MatGroup | 'all' };

const MaterialsPage = () => {
  const { t } = useTranslation('tools');
  const [s, setS, reset] = usePersistedState<State>('materials-db', { q: '', group: 'all' });

  const list = useMemo(() => {
    const norm = (x: string) => x.toLowerCase().replace(/[\s\-/]+/g, '');
    const q = norm(s.q.trim());
    const rows = MATERIALS.filter((m) => {
      if (s.group !== 'all' && m.group !== s.group) return false;
      if (!q) return true;
      return norm(`${m.name} ${m.en} ${m.pn} ${m.us} ${m.alt}`).includes(q);
    });
    if (!q) return rows;
    // trafienia dokładne w oznaczeniu PN lub numerze najpierw (np. „PA4” przed „PA45”)
    const rank = (m: (typeof rows)[number]) => {
      const pn = norm(m.pn.replace(/\(.*\)/, ''));
      const nums = m.en.split('/').map(norm);
      return pn === q || nums.includes(q) || norm(m.name) === q ? 0 : 1;
    };
    return [...rows].sort((a, b) => rank(a) - rank(b));
  }, [s.q, s.group]);

  return (
    <PageLayout title={t('mat.title')}>
      <div className="space-y-4 max-w-xl mx-auto">
        <InputField
          label={t('mat.search')}
          value={s.q}
          onChange={(e) => setS((p) => ({ ...p, q: e.target.value }))}
          numeric={false}
          placeholder="NC11LV, 2H13, PA4, 1.2379, 1045, 304…"
        />

        <div className="flex flex-wrap gap-2">
          {(['all', ...MAT_GROUPS] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setS((p) => ({ ...p, group: g }))}
              className={`px-3 py-2 rounded-xl font-bold text-xs transition-all border ${
                s.group === g
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {g === 'all' ? t('mat.all') : `${g} · ${t(`mat.groups.${g}`)}`}
            </button>
          ))}
        </div>

        <p className="text-xs text-zinc-500">{t('mat.count', { n: list.length })}</p>

        <div className="space-y-3">
          {list.map((m) => (
            <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-zinc-100">{m.name}</p>
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  {m.group}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">{t('mat.en')}</p>
                  <p className="text-zinc-300">{m.en}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{t('mat.pn')}</p>
                  <p className="text-zinc-300">{m.pn || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{t('mat.us')}</p>
                  <p className="text-zinc-300">{m.us}</p>
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
            </div>
          ))}
          {list.length === 0 && <p className="text-sm text-zinc-500 text-center py-6">{t('mat.empty')}</p>}
        </div>

        <p className="text-xs text-zinc-600 text-center leading-relaxed px-2">{t('mat.footer')}</p>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default MaterialsPage;
