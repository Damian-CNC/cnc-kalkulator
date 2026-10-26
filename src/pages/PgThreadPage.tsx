import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useQueryState from '@/hooks/useQueryState';
import useLength from '@/hooks/useLength';
import { PG_SIZES, calcPg } from '@/lib/pgThread';
import {
  DiameterCard,
  AuxCard,
  PitchCard,
  DepthCard,
  DrillCard,
} from '@/components/ThreadResultCards';

const PgThreadPage = () => {
  const { t } = useTranslation('tools');
  const L = useLength('mm');
  const [s, setS, reset] = usePersistedState<{ size: string }>('pg-thread', { size: 'Pg 11' });
  const [tab, setTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'pg-tab');
  const size = PG_SIZES.find((z) => z.id === s.size) ?? PG_SIZES[0];
  const r = useMemo(() => calcPg(size), [size]);

  return (
    <PageLayout title={t('pg.title')} backRoute="/gwinty" wideDesktop>
      <div className="space-y-5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
            {/* Lewa kolumna: wybór i kontrolki (sticky na PC) */}
            <div className="space-y-4 lg:sticky lg:top-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
              <SelectField
                label={t('pg.size')}
                value={size.id}
                onChange={(e) => setS({ size: e.target.value })}
                options={PG_SIZES.map((z) => ({ value: z.id, label: `${z.id} – ${z.tpi}` }))}
              />

              <div className="text-center pt-1 border-t border-zinc-800/60">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-sm md:text-base tracking-wide border border-emerald-500/30">
                  {r.id}
                </span>
                <p className="text-zinc-500 text-xs mt-1">{t('pg.basicInfo', { p: L.fmt(r.P, 4, 3), tpi: r.tpi })}</p>
                {r.metric && <p className="text-zinc-400 text-xs mt-0.5">{t('pg.metric', { m: r.metric })}</p>}
              </div>

              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm">
                  🔩 {t('pg.bolt')}
                </TabsTrigger>
                <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm">
                  🔧 {t('pg.nut')}
                </TabsTrigger>
              </TabsList>

              <p className="text-zinc-500 text-[11px] text-center pt-2 border-t border-zinc-800/60 leading-relaxed">{t('pg.footer')}</p>
            </div>

            {/* Prawa kolumna: karty wyników */}
            <div className="min-w-0">
              <TabsContent value="external" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DiameterCard label={t('pg.major')} limits={{ max: r.d, min: r.d }} unit="mm" digits={2} />
                  <DiameterCard label={t('pg.pitch')} limits={{ max: r.d2, min: r.d2 }} unit="mm" digits={2} />
                  <DiameterCard label={t('pg.minor')} limits={{ max: r.d1, min: r.d1 }} unit="mm" digits={2} />
                  <PitchCard label="Skok gwintu (P)" pitch={r.P} unit="mm" tpi={r.tpi} digits={4} />
                  <DepthCard
                    label={t('pg.depthBolt')}
                    depth={r.H1}
                    unit="mm"
                    digits={2}
                    note={`${t('pg.depthNote')} · H1`}
                  />
                  <AuxCard label={t('pg.radius')} value={r.R} unit="mm" digits={2} />
                </div>
              </TabsContent>

              <TabsContent value="internal" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DiameterCard label={t('pg.majorNut')} limits={{ max: r.d, min: r.d }} unit="mm" digits={2} />
                  <DiameterCard label={t('pg.pitchNut')} limits={{ max: r.d2, min: r.d2 }} unit="mm" digits={2} />
                  <DiameterCard label={t('pg.minorNut')} limits={{ max: r.d1, min: r.d1 }} unit="mm" digits={2} />
                  <PitchCard label="Skok gwintu (P)" pitch={r.P} unit="mm" tpi={r.tpi} digits={4} />
                  <DepthCard
                    label={t('pg.depthNut')}
                    depth={r.H1}
                    unit="mm"
                    digits={2}
                    note={`${t('pg.depthNote')} · H1`}
                  />
                  <DrillCard label={t('pg.drill')} diameter={r.drill} unit="mm" digits={1} note={t('pg.drillNote')} />
                  <div className="md:col-span-2">
                    <AuxCard label={t('pg.hole')} value={r.d} unit="mm" digits={1} note={t('pg.holeNote')} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default PgThreadPage;
