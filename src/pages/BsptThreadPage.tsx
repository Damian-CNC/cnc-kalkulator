import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import { BSPT_SIZES, calcBspt } from '@/lib/bsptThread';
import { PitchCard, DepthCard, AuxCard } from '@/components/ThreadResultCards';

type State = { size: string };

/** Local section component – shows three diameters (d, d2, d1) for one BSPT cross-section. */
function ThreadSection({
  label,
  d,
  d2,
  d1,
}: {
  label: string;
  d: number;
  d2: number;
  d1: number;
}) {
  const L = useLength('mm');

  const cell = (name: string, v: number) => (
    <div>
      <p className="text-zinc-500 text-[11px] uppercase tracking-wider mb-0.5">{name}</p>
      <p className="text-lg md:text-xl font-bold text-emerald-400 leading-tight">
        <CopyableValue value={L.raw(v)}>{L.val(v)}</CopyableValue>
        <span className="text-xs text-zinc-500 font-normal ml-1">{L.unit}</span>
      </p>
    </div>
  );

  return (
    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
      <p className="text-emerald-300 text-sm font-semibold mb-3">{label}</p>
      <div className="grid grid-cols-3 gap-3">
        {cell('zewn. d', d)}
        {cell('podziałowa d2', d2)}
        {cell('wewn. d1', d1)}
      </div>
    </div>
  );
}

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

        {/* Designation badge */}
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
            R / Rc {size.id}″
          </span>
          <p className="text-zinc-500 text-xs mt-2">
            {t('bspt.basicInfo', { p: L.fmt(r.P), tpi: r.tpi })}
          </p>
        </div>

        {/* Cross-sections */}
        <ThreadSection
          label={t('bspt.gauge')}
          d={r.gauge.d}
          d2={r.gauge.d2}
          d1={r.gauge.d1}
        />
        <ThreadSection
          label={t('bspt.small')}
          d={r.small.d}
          d2={r.small.d2}
          d1={r.small.d1}
        />
        <ThreadSection
          label={t('bspt.end', { x: L.fmt(r.L, 2, 1) })}
          d={r.end.d}
          d2={r.end.d2}
          d1={r.end.d1}
        />

        {/* Pitch */}
        <PitchCard
          label={t('bspt.pitch')}
          pitch={r.P}
          unit="mm"
          tpi={r.tpi}
          digits={4}
        />

        {/* Depth of cut */}
        <DepthCard
          label={t('bspt.depth')}
          depth={r.h}
          unit="mm"
          note={t('bspt.depthNote')}
          digits={4}
        />

        {/* Gauge length */}
        <AuxCard
          label={t('bspt.gaugeLength')}
          value={r.a}
          unit="mm"
          note={t('bspt.gaugeLengthNote')}
          digits={3}
        />

        {/* Thread length */}
        <AuxCard
          label={t('bspt.length')}
          value={r.L}
          unit="mm"
          note={t('bspt.lengthNote')}
          digits={3}
        />

        {/* Taper info footer */}
        <p className="text-xs text-zinc-500 text-center leading-relaxed">
          {t('bspt.taper', {
            angle: `${Math.floor(r.halfAngle)}°${Math.round((r.halfAngle % 1) * 60)}′`,
          })}
        </p>
        <p className="text-zinc-600 text-xs text-center leading-relaxed">{t('bspt.footer')}</p>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default BsptThreadPage;
