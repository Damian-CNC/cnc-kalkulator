import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import { useUnits } from '@/contexts/UnitContext';
import { parseDecimal } from '@/lib/numericInput';
import { Banner, ResultRow, SectionTitle, fmt } from '@/components/ToolsUi';
import CopyableValue from '@/components/CopyableValue';
import { PLANES, arcFromCenter, arcFromRadius, type ArcResult, type Plane } from '@/lib/arcIjk';

type State = {
  plane: Plane; mode: 'radius' | 'center'; dir: 'G2' | 'G3'; size: 'minor' | 'major';
  su: string; sv: string; eu: string; ev: string; r: string; iu: string; iv: string;
};
const INITIAL: State = {
  plane: 'G17', mode: 'radius', dir: 'G3', size: 'minor', su: '', sv: '', eu: '', ev: '', r: '', iu: '', iv: '',
};

const ArcIjkPage = () => {
  const { t } = useTranslation('tools');
  const { u, isImperial } = useUnits();
  const [s, setS, reset] = usePersistedState<State>('arc-ijk', INITIAL);
  const set = (k: keyof State) => (e: { target: { value: string } }) => setS((p) => ({ ...p, [k]: e.target.value }));
  const dg = isImperial ? 4 : 3;
  const ax = PLANES[s.plane];

  const su = parseDecimal(s.su);
  const sv = parseDecimal(s.sv);
  const eu = parseDecimal(s.eu);
  const ev = parseDecimal(s.ev);
  const r = parseDecimal(s.r);
  const iu = parseDecimal(s.iu);
  const iv = parseDecimal(s.iv);
  const ccw = s.dir === 'G3';

  let res: ArcResult | string | null = null;
  if (su !== null && sv !== null && eu !== null && ev !== null) {
    if (s.mode === 'radius' && r !== null) res = arcFromRadius(su, sv, eu, ev, r, ccw, s.size === 'major');
    if (s.mode === 'center' && iu !== null && iv !== null) res = arcFromCenter(su, sv, eu, ev, iu, iv, ccw);
  }
  const arc = res && typeof res !== 'string' ? res : null;
  const err = typeof res === 'string' ? res : null;

  const n = (v: number) => fmt(v, dg);
  // zapis G-code: osie w kolejności alfabetycznej, jak w programach
  const axes = [[ax.u, eu], [ax.v, ev]].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  const offs = [[ax.iu, arc?.iu], [ax.iv, arc?.iv]].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  const gIJ = arc
    ? `${s.dir} ${axes.map(([a, v]) => `${a}${n(v as number)}`).join(' ')} ${offs.map(([a, v]) => `${a}${n(v as number)}`).join(' ')}`
    : '';
  const gR = arc ? `${s.dir} ${axes.map(([a, v]) => `${a}${n(v as number)}`).join(' ')} R${n(arc.rSigned)}` : '';
  const full = arc && Math.abs(arc.sweepDeg - 360) < 1e-6;

  return (
    <PageLayout title={t('ijk.title')}>
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="glass-module">
          <SectionTitle>{t('ijk.setupTitle')}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label={t('ijk.plane')}
              value={s.plane}
              onChange={set('plane')}
              options={(['G17', 'G18', 'G19'] as Plane[]).map((p) => ({ value: p, label: `${p} (${PLANES[p].u}${PLANES[p].v})` }))}
            />
            <SelectField
              label={t('ijk.dir')}
              value={s.dir}
              onChange={set('dir')}
              options={[{ value: 'G2', label: t('ijk.cw') }, { value: 'G3', label: t('ijk.ccw') }]}
            />
            <SelectField
              label={t('ijk.mode')}
              value={s.mode}
              onChange={set('mode')}
              options={[{ value: 'radius', label: t('ijk.fromRadius') }, { value: 'center', label: t('ijk.fromCenter') }]}
            />
            {s.mode === 'radius' && (
              <SelectField
                label={t('ijk.arcSize')}
                value={s.size}
                onChange={set('size')}
                options={[{ value: 'minor', label: t('ijk.minor') }, { value: 'major', label: t('ijk.major') }]}
              />
            )}
          </div>
        </div>

        <div className="glass-module">
          <SectionTitle>{t('ijk.pointsTitle')}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={`${t('ijk.start')} ${ax.u} [${u.length}]`} value={s.su} onChange={set('su')} inputMode="decimal" />
            <InputField label={`${t('ijk.start')} ${ax.v} [${u.length}]`} value={s.sv} onChange={set('sv')} inputMode="decimal" />
            <InputField label={`${t('ijk.end')} ${ax.u} [${u.length}]`} value={s.eu} onChange={set('eu')} inputMode="decimal" />
            <InputField label={`${t('ijk.end')} ${ax.v} [${u.length}]`} value={s.ev} onChange={set('ev')} inputMode="decimal" />
            {s.mode === 'radius' ? (
              <InputField label={`R [${u.length}]`} value={s.r} onChange={set('r')} inputMode="decimal" />
            ) : (
              <>
                <InputField label={`${ax.iu} [${u.length}]`} value={s.iu} onChange={set('iu')} inputMode="decimal" />
                <InputField label={`${ax.iv} [${u.length}]`} value={s.iv} onChange={set('iv')} inputMode="decimal" />
              </>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{t('ijk.hint')}</p>
        </div>

        {err && <Banner tone="bad">{t(`ijk.err.${err}`)}</Banner>}

        {arc && (
          <div className="glass-module">
            <SectionTitle>{t('ijk.resultTitle')}</SectionTitle>
            <div className="space-y-3">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{t('ijk.gIJ')}</div>
                <CopyableValue value={gIJ}>
                  <span className="text-xl font-bold text-cyan-400 tabular-nums break-all">{gIJ}</span>
                </CopyableValue>
              </div>
              {!full && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{t('ijk.gR')}</div>
                  <CopyableValue value={gR}>
                    <span className="text-xl font-bold text-zinc-100 tabular-nums break-all">{gR}</span>
                  </CopyableValue>
                </div>
              )}
            </div>
            <div className="mt-3">
              <ResultRow label={`${ax.iu} (${t('ijk.fromStart')})`} value={n(arc.iu)} unit={u.length} strong />
              <ResultRow label={`${ax.iv} (${t('ijk.fromStart')})`} value={n(arc.iv)} unit={u.length} strong />
              <ResultRow label={`${t('ijk.center')} ${ax.u}`} value={n(arc.cu)} unit={u.length} />
              <ResultRow label={`${t('ijk.center')} ${ax.v}`} value={n(arc.cv)} unit={u.length} />
              <ResultRow label={t('ijk.radius')} value={n(arc.r)} unit={u.length} />
              <ResultRow label={t('ijk.sweep')} value={fmt(arc.sweepDeg, 2)} unit="°" />
              <ResultRow label={t('ijk.length')} value={n(arc.length)} unit={u.length} />
            </div>
            {arc.endMismatch > 0.002 && (
              <div className="mt-3">
                <Banner tone="warn">{t('ijk.mismatch', { v: fmt(arc.endMismatch, 4) })}</Banner>
              </div>
            )}
            {!full && Math.abs(arc.sweepDeg - 180) < 1e-6 && (
              <p className="text-xs text-zinc-500 mt-3">{t('ijk.halfHint')}</p>
            )}
          </div>
        )}
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default ArcIjkPage;
