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
    <PageLayout title={t('pg.title')} backRoute="/gwinty">
      <div className="space-y-5">
        <SelectField
          label={t('pg.size')}
          value={size.id}
          onChange={(e) => setS({ size: e.target.value })}
          options={PG_SIZES.map((z) => ({ value: z.id, label: `${z.id} – ${z.tpi}` }))}
        />

        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
            {r.id}
          </span>
          <p className="text-zinc-500 text-xs mt-2">{t('pg.basicInfo', { p: L.fmt(r.P, 4, 3), tpi: r.tpi })}</p>
          {r.metric && <p className="text-zinc-600 text-xs mt-1">{t('pg.metric', { m: r.metric })}</p>}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
          <TabsList className="w-full bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
              🔩 {t('pg.bolt')}
            </TabsTrigger>
            <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
              🔧 {t('pg.nut')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="external">
            <div className="space-y-3 mt-3">
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

          <TabsContent value="internal">
            <div className="space-y-3 mt-3">
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
              <AuxCard label={t('pg.hole')} value={r.d} unit="mm" digits={1} note={t('pg.holeNote')} />
            </div>
          </TabsContent>
          <p className="text-zinc-600 text-xs text-center mt-4 leading-relaxed">{t('pg.footer')}</p>
        </Tabs>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default PgThreadPage;
