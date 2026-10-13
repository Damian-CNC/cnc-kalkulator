import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useQueryState from '@/hooks/useQueryState';
import useLength from '@/hooks/useLength';
import { RD_SIZES, calcRd } from '@/lib/rdThread';
import {
  DiameterCard,
  PitchCard,
  DepthCard,
  DrillCard,
} from '@/components/ThreadResultCards';

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
                  <DiameterCard
                    label={`${t('rd.major')} (6h)`}
                    limits={res.bolt.major}
                    unit="mm"
                    tolClass="6h"
                  />
                  <DiameterCard
                    label={`${t('rd.pitch')} (7h)`}
                    limits={res.bolt.pitch}
                    unit="mm"
                    tolClass="7h"
                  />
                  <DiameterCard
                    label={`${t('rd.minor')} (7h)`}
                    limits={res.bolt.minor}
                    unit="mm"
                    tolClass="7h"
                  />
                  <PitchCard
                    label={`${t('rd.pitch')} (P)`}
                    pitch={res.P}
                    unit="mm"
                    tpi={res.tpi}
                  />
                  <DepthCard
                    label={t('rd.depthBolt')}
                    depth={res.depth}
                    unit="mm"
                    note={`${t('rd.depthNote')} · ${t('rd.depthFrom')}`}
                  />
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <DiameterCard
                    label={t('rd.majorNut')}
                    limits={{ max: res.nut.majorMin, min: res.nut.majorMin }}
                    unit="mm"
                    note="min wg normy"
                  />
                  <DiameterCard
                    label={t('rd.pitchNut')}
                    limits={res.nut.pitch}
                    unit="mm"
                  />
                  <DiameterCard
                    label={t('rd.minorNut')}
                    limits={res.nut.minor}
                    unit="mm"
                  />
                  <PitchCard
                    label={`${t('rd.pitch')} (P)`}
                    pitch={res.P}
                    unit="mm"
                    tpi={res.tpi}
                  />
                  <DepthCard
                    label={t('rd.depthNut')}
                    depth={res.depth}
                    unit="mm"
                    note={`${t('rd.depthNote')} · ${t('rd.depthFromNut')}`}
                  />
                  <DrillCard
                    label={t('rd.drill')}
                    diameter={(res.nut.minor.min + res.nut.minor.max) / 2}
                    unit="mm"
                    note={t('rd.drillNote')}
                    digits={3}
                  />
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

export default RdThreadPage;
