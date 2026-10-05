import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useQueryState from '@/hooks/useQueryState';
import useLength from '@/hooks/useLength';
import { parseDecimal } from '@/lib/numericInput';
import { BUTTRESS_SIZES, calcButtress } from '@/lib/buttressThread';

type State = { size: string; customD: string; customP: string };
const INITIAL: State = { size: '40x7', customD: '', customP: '' };

const Card = ({
  label,
  mm,
  note,
  accent,
}: {
  label: string;
  mm: number;
  note?: string;
  accent?: boolean;
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
        <CopyableValue value={L.raw(mm)}>{L.val(mm)}</CopyableValue>
        <span className="text-sm text-zinc-500 font-normal ml-1">{L.unit}</span>
      </p>
      {note && <p className={`text-xs mt-1.5 ${accent ? 'text-cyan-600' : 'text-emerald-700'}`}>({note})</p>}
    </div>
  );
};

const ButtressThreadPage = () => {
  const { t } = useTranslation('tools');
  const Lx = useLength('mm');
  const [s, setS, reset] = usePersistedState<State>('buttress-thread', INITIAL);
  const [tab, setTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'buttress-tab');

  const custom = s.size === 'custom';
  const std = BUTTRESS_SIZES.find((z) => `${z.d}x${z.P}` === s.size);
  const toMm = (v: number | null) => (v === null ? null : Lx.isImperial ? v * 25.4 : v);
  const d = custom ? toMm(parseDecimal(s.customD)) : std?.d ?? null;
  const P = custom ? toMm(parseDecimal(s.customP)) : std?.P ?? null;
  const res = useMemo(() => (d !== null && P !== null ? calcButtress(d, P) : null), [d, P]);

  return (
    <PageLayout title={t('buttress.title')} backRoute="/gwinty">
      <div className="space-y-5">
        <SelectField
          label={t('buttress.size')}
          value={s.size}
          onChange={(e) => setS((p) => ({ ...p, size: e.target.value }))}
          options={[
            ...BUTTRESS_SIZES.map((z) => ({ value: `${z.d}x${z.P}`, label: `S ${z.d} × ${z.P}` })),
            { value: 'custom', label: t('buttress.custom') },
          ]}
        />
        {custom && (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={t('buttress.customD').replace('[mm]', `[${Lx.unit}]`)}
              value={s.customD}
              onChange={(e) => setS((p) => ({ ...p, customD: e.target.value }))}
              inputMode="decimal"
            />
            <InputField
              label={t('buttress.customP').replace('[mm]', `[${Lx.unit}]`)}
              value={s.customP}
              onChange={(e) => setS((p) => ({ ...p, customP: e.target.value }))}
              inputMode="decimal"
            />
          </div>
        )}

        {res && (
          <>
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
                {res.designation}
              </span>
              <p className="text-zinc-500 text-xs mt-2">{t('buttress.basicInfo')}</p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger
                  value="external"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔩 {t('buttress.bolt')}
                </TabsTrigger>
                <TabsTrigger
                  value="internal"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔧 {t('buttress.nut')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="external">
                <div className="space-y-3 mt-3">
                  <Card label={t('buttress.major')} mm={res.d} />
                  <Card label={t('buttress.pitch')} mm={res.d2} />
                  <Card label={t('buttress.minor')} mm={res.d3} />
                  <Card label={t('buttress.depthBolt')} mm={res.h3} accent note={`${t('buttress.depthNote')} · ${t('buttress.depthFrom')}`} />
                  <Card label={t('buttress.radius')} mm={res.R} />
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <Card label={t('buttress.majorNut')} mm={res.d} note={t('buttress.majorNutNote')} />
                  <Card label={t('buttress.pitchNut')} mm={res.d2} />
                  <Card label={t('buttress.minorNut')} mm={res.D1} accent note={t('buttress.drillNote')} />
                  <Card label={t('buttress.depthNut')} mm={res.H1} accent note={`${t('buttress.depthNote')} · ${t('buttress.depthFromNut')}`} />
                </div>
              </TabsContent>
              <p className="text-zinc-600 text-xs text-center mt-4 leading-relaxed">{t('buttress.footer')}</p>
            </Tabs>
          </>
        )}
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default ButtressThreadPage;
