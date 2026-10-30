import { useTranslation } from 'react-i18next';
import InputField from './InputField';
import SelectField from './SelectField';
import ResultDisplay from './ResultDisplay';
import { convertHardness, ConversionDirection } from '@/utils/isoHardnessConversion';
import usePersistedState from '@/hooks/usePersistedState';
import ClearFab from '@/components/ClearFab';

const HardnessConverter = () => {
  const { t } = useTranslation();
  const [direction, setDirection] = usePersistedState<ConversionDirection>('hardness-direction', 'hb-to-hrc');
  const [inputValue, setInputValue] = usePersistedState<string>('hardness-input', '');

  const directionOptions = [
    { value: 'hb-to-hrc', label: 'HB → HRC' },
    { value: 'hrc-to-hb', label: 'HRC → HB' },
  ];

  const getResult = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return null;
    return convertHardness(value, direction);
  };

  const result = getResult();

  const handleClear = () => {
    setInputValue('');
    setDirection('hb-to-hrc');
  };

  const handleDirectionChange = (newDirection: ConversionDirection) => {
    setDirection(newDirection);
    setInputValue('');
  };

  const getInputLabel = () => {
    return direction === 'hb-to-hrc' ? t('hardness.hbInput') : t('hardness.hrcInput');
  };

  const getResultLabel = () => {
    return direction === 'hb-to-hrc' ? 'HRC' : 'HB';
  };

  return (
    <div className="glass-container">
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        {/* Left Column: Direction & Input */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="glass-module">
            <h2 className="text-primary font-semibold text-base mb-4 flex items-center gap-2">
              💎 {t('hardness.title')}
            </h2>

            <div className="flex flex-col gap-4">
              <SelectField
                label={t('hardness.direction')}
                options={directionOptions}
                value={direction}
                onChange={(e) => handleDirectionChange(e.target.value as ConversionDirection)}
              />

              <InputField
                label={getInputLabel()}
                type="number"
                step="1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Result & Reference Guide */}
        <div className="space-y-4">
          <div className="glass-module">
            <ResultDisplay className="!min-h-[5rem]">
              {result !== null ? (
                result.success ? (
                  <div className="text-center w-full animate-fade-in py-2">
                    <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                      {t('hardness.resultTitle')}
                    </div>
                    <div className="text-3xl font-black text-cyan-300 mb-2 tabular-nums">
                      {result.value} {getResultLabel()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 px-2">
                      {t('hardness.standard')}
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full animate-fade-in py-2">
                    <div className="text-sm text-amber-400 px-2 font-medium">
                      ⚠️ {result.errorKey ? t(result.errorKey, result.errorParams) : result.message}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center text-zinc-500 text-xs py-4">
                  {t('hardness.standard')}
                </div>
              )}
            </ResultDisplay>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3">
              {t('hardness.typicalRanges', { defaultValue: 'Typowe zakresy twardości stali' })}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                <p className="text-zinc-400 font-medium">
                  {t('hardness.structural', { defaultValue: 'Konstrukcyjne (S355)' })}
                </p>
                <p className="text-cyan-400 font-bold mt-0.5">~140 – 190 HB</p>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                <p className="text-zinc-400 font-medium">
                  {t('hardness.quenched', { defaultValue: 'Do ulepszania (42CrMo4)' })}
                </p>
                <p className="text-cyan-400 font-bold mt-0.5">~28 – 34 HRC (270–320 HB)</p>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                <p className="text-zinc-400 font-medium">
                  {t('hardness.caseHardened', { defaultValue: 'Nawęglane / Azotowane' })}
                </p>
                <p className="text-cyan-400 font-bold mt-0.5">~55 – 62 HRC</p>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
                <p className="text-zinc-400 font-medium">
                  {t('hardness.toolSteel', { defaultValue: 'Narzędziowe / Hartowane' })}
                </p>
                <p className="text-cyan-400 font-bold mt-0.5">~60 – 66 HRC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClearFab onClear={handleClear} />
    </div>
  );
};

export default HardnessConverter;
