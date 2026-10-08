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
import { PG_SIZES, calcPg } from '@/lib/pgThread';

const Card = ({
  label,
  mm,
  note,
  accent,
  digits = 3,
}: {
  label: string;
  mm: number;
  note?: string;
  accent?: boolean;
  digits?: number;
}) => {
  const L = useLength('mm');
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? 'border-cyan-800/40 bg-cyan-950/20' : 'border-emerald-800/40 bg-emerald-950/20'
      }`}
    >
      <p className={`text-sm font-medium mb-1 ${accent ? 'text-cyan-300' : 'text-emerald-300'}`}>{label}</p>
      <p className={`text-2xl md:text-3xl font-bold ${accent ? 'text-cyan-400' : 'text-emerald-400'}`}>
        <CopyableValue value={L.raw(mm, 4, digits)}>{L.val(mm, 4, digits)}</CopyableValue>
        <span className="text-sm text-zinc-500 font-normal ml-1">{L.unit}</span>
      </p>
      {note && <p className={`text-xs mt-1.5 ${accent ? 'text-cyan-600' : 'text-emerald-700'}`}>({note})</p>}
    </div>
  );
};

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
              <Card label={t('pg.major')} mm={r.d} digits={2} />
              <Card label={t('pg.pitch')} mm={r.d2} digits={2} />
              <Card label={t('pg.minor')} mm={r.d1} digits={2} />
              <Card label={t('pg.depthBolt')} mm={r.H1} accent digits={2} note={`${t('pg.depthNote')} · H1`} />
              <Card label={t('pg.radius')} mm={r.R} digits={2} />
            </div>
          </TabsContent>

          <TabsContent value="internal">
            <div className="space-y-3 mt-3">
              <Card label={t('pg.majorNut')} mm={r.d} digits={2} />
              <Card label={t('pg.pitchNut')} mm={r.d2} digits={2} />
              <Card label={t('pg.minorNut')} mm={r.d1} digits={2} />
              <Card label={t('pg.depthNut')} mm={r.H1} accent digits={2} note={`${t('pg.depthNote')} · H1`} />
              <Card label={t('pg.drill')} mm={r.drill} accent digits={1} note={t('pg.drillNote')} />
              <Card label={t('pg.hole')} mm={r.d} digits={1} note={t('pg.holeNote')} />
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
