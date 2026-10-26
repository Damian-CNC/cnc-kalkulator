import { useTranslation } from 'react-i18next';
import InputField from './InputField';
import ResultDisplay from './ResultDisplay';
import usePersistedState from '@/hooks/usePersistedState';
import ClearFab from '@/components/ClearFab';
import useLength from '@/hooks/useLength';

const DrillConeCalculator = () => {
  const { t } = useTranslation();
  const L = useLength('mm');
  const [diameter, setDiameter] = usePersistedState<string>('cone-diameter', '');
  const [angle, setAngle] = usePersistedState<string>('cone-angle', '');

  const calculateConeHeight = () => {
    const D = parseFloat(diameter);
    const alpha = parseFloat(angle);

    if (D > 0 && alpha > 0 && alpha < 180) {
      const alphaRad = (alpha / 2) * (Math.PI / 180);
      return (D / 2) / Math.tan(alphaRad);
    }
    return null;
  };

  const result = calculateConeHeight();

  const handleClear = () => {
    setDiameter('');
    setAngle('');
  };

  return (
    <div className="glass-container">
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        {/* Left: Inputs */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="glass-module">
            <h2 className="text-primary font-semibold text-base mb-4 flex items-center gap-2">
              🔺 {t('cone.title')}
            </h2>

            <div className="flex flex-col gap-4">
              <InputField
                label={t('cone.drillDiameter').replace('[mm]', `[${L.unit}]`)}
                type="number"
                step="0.1"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
              />
              <div>
                <InputField
                  label={t('cone.pointAngle')}
                  type="number"
                  step="0.1"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                />
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {[118, 135, 90].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAngle(String(preset))}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        angle === String(preset)
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {preset}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Diagram & Results */}
        <div className="space-y-4">
          <div className="glass-module">
            {/* SVG Drill Diagram */}
            <div className="flex justify-center p-3 mb-4">
              <svg viewBox="0 0 240 130" className="w-56 h-32" fill="none">
                {/* Centerline */}
                <line x1="20" y1="65" x2="220" y2="65" stroke="rgb(82,82,91)" strokeWidth="1" strokeDasharray="6 3" />
                {/* Drill body outline */}
                <path
                  d="M 20,25 L 140,25 L 205,65 L 140,105 L 20,105"
                  stroke="rgb(6,182,212)"
                  strokeWidth="2"
                  fill="rgba(6,182,212,0.08)"
                />
                {/* Diameter D line */}
                <line x1="140" y1="20" x2="140" y2="110" stroke="rgb(52,211,153)" strokeWidth="1" strokeDasharray="3 2" />
                <text x="130" y="68" fill="rgb(52,211,153)" fontSize="11" fontWeight="bold" textAnchor="end">D</text>
                {/* Height h line */}
                <line x1="140" y1="118" x2="205" y2="118" stroke="rgb(251,191,36)" strokeWidth="1.5" />
                <line x1="140" y1="113" x2="140" y2="123" stroke="rgb(251,191,36)" strokeWidth="1" />
                <line x1="205" y1="113" x2="205" y2="123" stroke="rgb(251,191,36)" strokeWidth="1" />
                <text x="172.5" y="114" fill="rgb(251,191,36)" fontSize="10" fontWeight="bold" textAnchor="middle">h</text>
                {/* Point Angle label */}
                <text x="210" y="58" fill="rgb(244,114,182)" fontSize="10" fontWeight="bold">α</text>
              </svg>
            </div>

            <ResultDisplay className="!min-h-[5rem]">
              {result !== null ? (
                <div className="text-center w-full">
                  <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                    {t('cone.resultLabel')} (h)
                  </div>
                  <div className="text-3xl font-black text-cyan-300 mb-2 tabular-nums">
                    {result.toFixed(L.isImperial ? 4 : 3)} {L.unit}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 px-2">
                    {t('cone.hint')}
                  </div>
                </div>
              ) : (
                diameter && angle ? (
                  <span className="text-muted-foreground">{t('cone.invalid')}</span>
                ) : (
                  <span className="text-xs text-zinc-500">{t('cone.hint')}</span>
                )
              )}
            </ResultDisplay>
          </div>
        </div>
      </div>

      <ClearFab onClear={handleClear} />
    </div>
  );
};

export default DrillConeCalculator;
