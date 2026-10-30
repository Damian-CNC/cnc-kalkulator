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
  const { t } = useTranslation('tools');
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
        {cell(t('bspt.major_d', { defaultValue: 'zewn. d' }), d)}
        {cell(t('bspt.pitch_d2', { defaultValue: 'podziałowa d2' }), d2)}
        {cell(t('bspt.minor_d1', { defaultValue: 'wewn. d1' }), d1)}
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
    <PageLayout title={t('bspt.title')} backRoute="/gwinty" wideDesktop>
      <div className="space-y-5">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
          {/* Lewa kolumna: wybór i kontrolki (sticky na PC) */}
          <div className="space-y-4 lg:sticky lg:top-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
            <SelectField
              label={t('bspt.size')}
              value={size.id}
              onChange={(e) => setS({ size: e.target.value })}
              options={BSPT_SIZES.map((z) => ({ value: z.id, label: `R ${z.id}″ – ${z.tpi}` }))}
            />

            <div className="text-center pt-1 border-t border-zinc-800/60">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-sm md:text-base tracking-wide border border-emerald-500/30">
                R / Rc {size.id}″
              </span>
              <p className="text-zinc-500 text-xs mt-1">
                {t('bspt.basicInfo', { p: L.fmt(r.P), tpi: r.tpi })}
              </p>
            </div>

            <p className="text-xs text-zinc-500 text-center leading-relaxed pt-2 border-t border-zinc-800/60">
              {t('bspt.taper', {
                angle: `${Math.floor(r.halfAngle)}°${Math.round((r.halfAngle % 1) * 60)}′`,
              })}
            </p>
            <p className="text-zinc-600 text-[11px] text-center leading-relaxed">{t('bspt.footer')}</p>
          </div>

          {/* Prawa kolumna: karty wyników */}
          <div className="space-y-3 min-w-0">
            {/* Przekroje gwintu */}
            <ThreadSection
              label={t('bspt.gauge')}
              d={r.gauge.d}
              d2={r.gauge.d2}
              d1={r.gauge.d1}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PitchCard
                label={t('bspt.pitch')}
                pitch={r.P}
                unit="mm"
                tpi={r.tpi}
                digits={4}
              />
              <DepthCard
                label={t('bspt.depth')}
                depth={r.h}
                unit="mm"
                note={t('bspt.depthNote')}
                digits={4}
              />
              <AuxCard
                label={t('bspt.gaugeLength')}
                value={r.a}
                unit="mm"
                note={t('bspt.gaugeLengthNote')}
                digits={3}
              />
              <AuxCard
                label={t('bspt.length')}
                value={r.L}
                unit="mm"
                note={t('bspt.lengthNote')}
                digits={3}
              />
            </div>
          </div>
        </div>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default BsptThreadPage;
