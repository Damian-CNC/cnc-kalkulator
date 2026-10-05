import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import { BSPT_SIZES, calcBspt } from '@/lib/bsptThread';

type State = { size: string };

const Row = ({ label, d, d2, d1 }: { label: string; d: number; d2: number; d1: number }) => {
  const L = useLength('mm');
  const cell = (name: string, v: number) => (
    <div>
      <p className="text-zinc-500 text-xs uppercase tracking-wider">{name}</p>
      <p className="text-lg md:text-xl font-bold text-emerald-400">
        <CopyableValue value={L.raw(v)}>{L.val(v)}</CopyableValue>
        <span className="text-xs text-zinc-500 font-normal ml-1">{L.unit}</span>
      </p>
    </div>
  );
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
      <p className="text-emerald-300 text-sm font-medium mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-3">
        {cell('d', d)}
        {cell('d2', d2)}
        {cell('d1', d1)}
      </div>
    </div>
  );
};

const Single = ({ label, mm, note, accent }: { label: string; mm: number; note?: string; accent?: boolean }) => {
  const L = useLength('mm');
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? 'border-cyan-800/40 bg-cyan-950/20' : 'border-zinc-800 bg-zinc-900/70'
      }`}
    >
      <p className={`text-sm font-medium mb-1 ${accent ? 'text-cyan-300' : 'text-zinc-400'}`}>{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-cyan-400' : 'text-zinc-100'}`}>
        <CopyableValue value={L.raw(mm)}>{L.val(mm)}</CopyableValue>
        <span className="text-sm text-zinc-500 font-normal ml-1">{L.unit}</span>
      </p>
      {note && <p className={`text-xs mt-1.5 ${accent ? 'text-cyan-600' : 'text-zinc-600'}`}>({note})</p>}
    </div>
  );
};

const BsptThreadPage = () => {
  const { t } = useTranslation('tools');
  const L = useLength('mm');
  const [s, setS, reset] = usePersistedState<State>('bspt-thread', { size: '1/2' });
  const size = BSPT_SIZES.find((z) => z.id === s.size) ?? BSPT_SIZES[0];
  const r = useMemo(() => calcBspt(size), [size]);

  return (
    <PageLayout title={t('bspt.title')} backRoute="/gwinty">
      <div className="space-y-4">
        <SelectField
          label={t('bspt.size')}
          value={size.id}
          onChange={(e) => setS({ size: e.target.value })}
          options={BSPT_SIZES.map((z) => ({ value: z.id, label: `R ${z.id}″ – ${z.tpi}` }))}
        />

        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
            R / Rc {size.id}″
          </span>
          <p className="text-zinc-500 text-xs mt-2">
            {t('bspt.basicInfo', { p: L.fmt(r.P), tpi: r.tpi })}
          </p>
        </div>

        <Row label={t('bspt.gauge')} d={r.gauge.d} d2={r.gauge.d2} d1={r.gauge.d1} />
        <Row label={t('bspt.small')} d={r.small.d} d2={r.small.d2} d1={r.small.d1} />
        <Row label={t('bspt.end', { x: L.fmt(r.L, 2, 1) })} d={r.end.d} d2={r.end.d2} d1={r.end.d1} />

        <Single label={t('bspt.depth')} mm={r.h} accent note={`${t('bspt.depthNote')}`} />
        <Single label={t('bspt.gaugeLength')} mm={r.a} note={t('bspt.gaugeLengthNote')} />
        <Single label={t('bspt.length')} mm={r.L} note={t('bspt.lengthNote')} />

        <p className="text-xs text-zinc-500 text-center leading-relaxed">
          {t('bspt.taper', { angle: `${Math.floor(r.halfAngle)}°${Math.round((r.halfAngle % 1) * 60)}′` })}
        </p>
        <p className="text-zinc-600 text-xs text-center leading-relaxed">{t('bspt.footer')}</p>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default BsptThreadPage;
