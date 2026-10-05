import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useQueryState from '@/hooks/useQueryState';
import useLength from '@/hooks/useLength';
import { RD_SIZES, calcRd, type Range } from '@/lib/rdThread';

type State = { size: string };
const INITIAL: State = { size: '20' };

const RdThreadPage = () => {
  const { t } = useTranslation('tools');
  const L = useLength('mm');
  const [s, setS, reset] = usePersistedState<State>('rd-thread', INITIAL);
  const [tab, setTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'rd-tab');

  const size = RD_SIZES.find((z) => String(z.d) === s.size) ?? RD_SIZES[0];
  const res = useMemo(() => calcRd(size), [size]);

  return (
    <PageLayout title={t('rd.title')} backRoute="/gwinty">
      <div className="space-y-5">
        <SelectField
          label={t('rd.size')}
          value={String(size.d)}
          onChange={(e) => setS({ size: e.target.value })}
          options={RD_SIZES.map((z) => ({
            value: String(z.d),
            label: `Rd ${z.d} × 1/${z.tpi}″${z.series2 ? ' †' : ''}`,
          }))}
        />

        {res && (
          <>
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
                {res.designation}
              </span>
              <p className="text-zinc-500 text-xs mt-2">
                {t('rd.basicInfo', { p: L.fmt(res.P, 4, 3), tpi: res.tpi })}
              </p>
              {res.series2 && <p className="text-amber-500/80 text-xs mt-1">{t('rd.series2')}</p>}
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger
                  value="external"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔩 {t('rd.bolt')}
                </TabsTrigger>
                <TabsTrigger
                  value="internal"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔧 {t('rd.nut')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="external">
                <div className="space-y-3 mt-3">
                  <LimitCard label={`${t('rd.major')} (6h)`} lim={res.bolt.major} tolLabel={t('rd.tolerance')} />
                  <LimitCard label={`${t('rd.pitch')} (7h)`} lim={res.bolt.pitch} tolLabel={t('rd.tolerance')} />
                  <LimitCard label={`${t('rd.minor')} (7h)`} lim={res.bolt.minor} tolLabel={t('rd.tolerance')} />
                  <CamCard label={t('rd.depthBolt')} mm={res.depth} note={`${t('rd.depthNote')} · ${t('rd.depthFrom')}`} />
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <ValueCard label={t('rd.majorNut')} mm={res.nut.majorMin} prefix="min" />
                  <LimitCard label={t('rd.pitchNut')} lim={res.nut.pitch} tolLabel={t('rd.tolerance')} />
                  <LimitCard label={t('rd.minorNut')} lim={res.nut.minor} tolLabel={t('rd.tolerance')} />
                  <CamCard label={t('rd.depthNut')} mm={res.depth} note={`${t('rd.depthNote')} · ${t('rd.depthFromNut')}`} />
                  <DrillCard label={t('rd.drill')} min={res.nut.minor.min} max={res.nut.minor.max} note={t('rd.drillNote')} />
                </div>
              </TabsContent>
              <p className="text-zinc-600 text-xs text-center mt-4 leading-relaxed">{t('rd.footer')}</p>
            </Tabs>
          </>
        )}
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

function LimitCard({ label, lim, tolLabel }: { label: string; lim: Range; tolLabel: string }) {
  const L = useLength('mm');
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
      <p className="text-emerald-300 text-sm font-medium mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        {(['max', 'min'] as const).map((k) => (
          <div key={k}>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">{k}</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">
              <CopyableValue value={L.raw(lim[k])}>{L.val(lim[k])}</CopyableValue>
              <span className="text-xs text-zinc-500 font-normal ml-1">{L.unit}</span>
            </p>
          </div>
        ))}
      </div>
      <p className="text-emerald-700 text-xs mt-2">
        {tolLabel} {L.fmt(lim.tol)}
      </p>
    </div>
  );
}

function ValueCard({ label, mm, prefix }: { label: string; mm: number; prefix?: string }) {
  const L = useLength('mm');
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-100">
        {prefix ? `${prefix} ` : ''}
        <CopyableValue value={L.raw(mm)}>{L.val(mm)}</CopyableValue>
        <span className="text-sm text-zinc-500 font-normal ml-1">{L.unit}</span>
      </p>
    </div>
  );
}

function CamCard({ label, mm, note }: { label: string; mm: number; note?: string }) {
  const L = useLength('mm');
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">
        <CopyableValue value={L.raw(mm)}>{L.val(mm)}</CopyableValue>
        <span className="text-base text-cyan-600 font-normal ml-1">{L.unit}</span>
      </p>
      {note && <p className="text-cyan-600 text-xs mt-1.5">({note})</p>}
    </div>
  );
}

function DrillCard({ label, min, max, note }: { label: string; min: number; max: number; note: string }) {
  const L = useLength('mm');
  const mid = (min + max) / 2;
  let drill: number | null = null;
  for (let d = Math.ceil(min * 10) / 10; d <= max + 1e-9; d += 0.1) {
    if (drill === null || Math.abs(d - mid) < Math.abs(drill - mid)) drill = Math.round(d * 10) / 10;
  }
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">
        <CopyableValue value={L.raw(mid, 4, 2)}>{L.val(mid, 4, 2)}</CopyableValue>
        <span className="text-base text-cyan-600 font-normal ml-1">{L.unit}</span>
      </p>
      {!L.isImperial && drill !== null && <p className="text-cyan-500 text-sm">Ø{drill.toFixed(1)} mm</p>}
      <p className="text-cyan-600 text-xs mt-1.5">({note})</p>
    </div>
  );
}

export default RdThreadPage;
