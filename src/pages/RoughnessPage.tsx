import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';
import useLength from '@/hooks/useLength';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';
import FormulaHelper from '@/components/FormulaHelper';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';

const RADII = [0.1, 0.2, 0.4, 0.8, 1.2, 1.6, 2.4];

const isoClasses = [
  { n: 'N1', ra: 0.025 },
  { n: 'N2', ra: 0.05 },
  { n: 'N3', ra: 0.1 },
  { n: 'N4', ra: 0.2 },
  { n: 'N5', ra: 0.4 },
  { n: 'N6', ra: 0.8 },
  { n: 'N7', ra: 1.6 },
  { n: 'N8', ra: 3.2 },
  { n: 'N9', ra: 6.3 },
  { n: 'N10', ra: 12.5 },
  { n: 'N11', ra: 25 },
  { n: 'N12', ra: 50 },
];

const raColor = (ra: number) => {
  if (ra <= 1.6) return 'text-emerald-400';
  if (ra <= 3.2) return 'text-yellow-400';
  return 'text-orange-400';
};

const isoClassFor = (ra: number) => isoClasses.find((c) => ra <= c.ra)?.n ?? '> N12';

const RoughnessPage = () => {
  const { t } = useTranslation(['roughness', 'translation']);
  const { t: th } = useTranslation('app');
  const [mode, setMode] = useQueryState('mode', 'forward', ['forward', 'reverse'] as const, 'roughness-mode');
  const L = useLength('mm');
  const imp = L.isImperial;
  const UIN = 39.3701; // µin w 1 µm
  const [radiusMm, setRadiusMm] = usePersistedState<string>('roughness-radius', '0.4');
  const [radiusIn, setRadiusIn] = usePersistedState<string>('roughness-radius-in', '0.0157');
  const radius = imp ? radiusIn : radiusMm;
  const setRadius = imp ? setRadiusIn : setRadiusMm;
  const unitLabel = (txt: string) => txt.replace(/\bmm\b/g, 'in').replace(/µm/g, 'µin');
  const [feed, setFeed] = usePersistedState<string>('roughness-feed', '');
  const [targetRa, setTargetRa] = usePersistedState<string>('roughness-target-ra', '');

  const raLabel = (ra: number) => {
    if (ra <= 1.6) return t('finishing');
    if (ra <= 3.2) return t('standard');
    return t('rough');
  };

  // obliczenia w mm i µm; w systemie calowym wpisy są w calach i µin
  const r = parseFloat(radius.replace(',', '.')) * (imp ? 25.4 : 1);
  const f = parseFloat(feed.replace(',', '.')) * (imp ? 25.4 : 1);
  const raT = parseFloat(targetRa.replace(',', '.')) / (imp ? UIN : 1);
  const showRa = (um: number) => (imp ? (um * UIN).toFixed(1) : um.toFixed(2));

  const result = useMemo(() => {
    if (!r || r <= 0) return null;
    if (mode === 'forward') {
      if (!f || f <= 0) return null;
      return {
        ra: ((f * f) / (32 * r)) * 1000,
        rz: ((f * f) / (8 * r)) * 1000,
        fmax: null as number | null,
      };
    }
    if (!raT || raT <= 0) return null;
    const fmax = Math.sqrt((32 * r * raT) / 1000);
    return { ra: raT, rz: ((fmax * fmax) / (8 * r)) * 1000, fmax };
  }, [mode, r, f, raT]);

  const invalid =
    (mode === 'forward' && feed !== '' && (!f || f <= 0)) ||
    (mode === 'reverse' && targetRa !== '' && (!raT || raT <= 0)) ||
    (radius !== '' && (!r || r <= 0));

  const clear = () => {
    setFeed('');
    setTargetRa('');
    setRadiusMm('0.4');
    setRadiusIn('0.0157');
  };

  return (
    <PageLayout title={t('pages.roughness', { ns: 'translation' })} wideDesktop>
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
        {/* Lewa kolumna: kontrolki i dane wejściowe */}
        <div className="glass-module space-y-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
            <h2 className="text-sm uppercase tracking-wider text-zinc-300 font-bold">Ra / Rz</h2>
            <FormulaHelper
              title={th('formulas.roughness.title')}
              formula="Ra ≈ (fn² / (32 · rε)) · 1000"
              note={th('formulas.roughness.note')}
              label={th('formulas.help')}
              params={[
                { symbol: 'Ra', desc: th('formulas.roughness.p.Ra') },
                { symbol: 'fn', desc: th('formulas.roughness.p.fn') },
                { symbol: 'rε', desc: th('formulas.roughness.p.re') },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['forward', 'reverse'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  mode === m
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m === 'forward' ? t('modeForward') : t('modeReverse')}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
              {unitLabel(t('cornerRadius'))}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {RADII.map((v) => (
                <button
                  key={v}
                  onClick={() => setRadius(imp ? (v / 25.4).toFixed(4) : String(v))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold border transition-all ${
                    (imp ? Math.abs(parseFloat(radius) - v / 25.4) < 0.00006 : parseFloat(radius) === v)
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {imp ? (v / 25.4).toFixed(4) : v.toFixed(1)}
                </button>
              ))}
            </div>
            <input
              type="text"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              onFocus={selectOnFocus}
              value={radius}
              onChange={(e) => setRadius(sanitizeDecimal(e.target.value))}
              className="input-field"
            />
          </div>

          <div>
            {mode === 'forward' ? (
              <>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                  {unitLabel(t('feed'))}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  onFocus={selectOnFocus}
                  value={feed}
                  onChange={(e) => setFeed(sanitizeDecimal(e.target.value))}
                  className="input-field"
                />
              </>
            ) : (
              <>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                  {unitLabel(t('targetRa'))}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  onFocus={selectOnFocus}
                  value={targetRa}
                  onChange={(e) => setTargetRa(sanitizeDecimal(e.target.value))}
                  className="input-field"
                />
              </>
            )}
          </div>

          {invalid && (
            <p className="text-xs text-red-400">{t('positiveValuesRequired')}</p>
          )}
        </div>

        {/* Prawa kolumna: wyniki i tabela klas ISO */}
        <div className="space-y-5 min-w-0">
          {result && (
            <div className="glass-module">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Ra</div>
                  <div className={`text-2xl md:text-3xl font-bold ${raColor(result.ra)}`}>
                    {showRa(result.ra)}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{imp ? 'µin' : 'µm'} · {isoClassFor(result.ra)}</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Rz ≈ Rt</div>
                  <div className={`text-2xl md:text-3xl font-bold ${raColor(result.ra)}`}>
                    {showRa(result.rz)}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{imp ? 'µin' : 'µm'}</div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-zinc-300">
                {t('surfaceClass')} <span className={`font-bold ${raColor(result.ra)}`}>{raLabel(result.ra)}</span>
              </div>

              {result.fmax !== null && (
                <div className="result-box mt-4 text-xl md:text-2xl font-bold">
                  f max = {imp ? (result.fmax / 25.4).toFixed(4) : result.fmax.toFixed(3)} {L.unit}/{t('perRev')}
                </div>
              )}
            </div>
          )}

          <div className="glass-module">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{t('isoClasses')}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {isoClasses.map((c) => (
                <div
                  key={c.n}
                  className={`border rounded-lg px-2 py-2 text-center transition-colors ${
                    result && isoClassFor(result.ra) === c.n
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="text-cyan-400 font-bold text-sm">{c.n}</div>
                  <div className="text-[11px] text-zinc-400">Ra {imp ? Math.round(c.ra * UIN) : c.ra} {imp ? 'µin' : 'µm'}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
              {t('theoreticalFormulas')}
            </p>
          </div>
        </div>
      </div>

      <div className="h-10" />
      <ClearFab onClear={clear} />
    </PageLayout>
  );
};

export default RoughnessPage;
