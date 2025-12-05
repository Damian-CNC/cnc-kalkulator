import { useState } from 'react';
import InputField from './InputField';
import SelectField from './SelectField';
import ResultDisplay from './ResultDisplay';
import { convertHardness, ConversionDirection, ConversionResult, getHbRange, getHrcRange } from '@/utils/isoHardnessConversion';

const HardnessConverter = () => {
  const [direction, setDirection] = useState<ConversionDirection>('hb-to-hrc');
  const [inputValue, setInputValue] = useState('');

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
  };

  const handleDirectionChange = (newDirection: ConversionDirection) => {
    setDirection(newDirection);
    setInputValue('');
  };

  const getInputLabel = () => {
    if (direction === 'hb-to-hrc') {
      const range = getHbRange();
      return `Twardość HB (${range.min}–${range.max})`;
    } else {
      const range = getHrcRange();
      return `Twardość HRC (${range.min}–${range.max})`;
    }
  };

  const getResultLabel = () => {
    return direction === 'hb-to-hrc' ? 'HRC' : 'HB';
  };

  return (
    <div className="glass-container">
      <div className="glass-module">
        <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
          💎 Konwerter twardości
        </h2>

        <div className="flex flex-col gap-4">
          <SelectField
            label="Kierunek konwersji"
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

          <ResultDisplay className="!min-h-[5rem]">
            {result !== null ? (
              result.success ? (
                <div className="text-center w-full animate-fade-in">
                  <div className="text-lg text-primary font-semibold mb-1">
                    Wynik konwersji
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">
                    💎 {result.value} {getResultLabel()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 px-2">
                    Konwersja zgodna z ISO 18265 (ISO 6506/6508)
                  </div>
                </div>
              ) : (
                <div className="text-center w-full animate-fade-in">
                  <div className="text-sm text-amber-400 px-2">
                    ⚠️ {result.message}
                  </div>
                </div>
              )
            ) : null}
          </ResultDisplay>
        </div>
      </div>

      <button onClick={handleClear} className="clear-btn mt-6">
        Wyczyść
      </button>
    </div>
  );
};

export default HardnessConverter;
