import { useState } from 'react';
import InputField from './InputField';
import ResultDisplay from './ResultDisplay';

const DrillConeCalculator = () => {
  const [diameter, setDiameter] = useState('');
  const [angle, setAngle] = useState('');

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
      <div className="glass-module">
        <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
          🔺 Wysokość stożka wiertła
        </h2>

        <div className="flex flex-col gap-4">
          <InputField
            label="Średnica wiertła D [mm]"
            type="number"
            step="0.1"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
          />
          <InputField
            label="Kąt wierzchołkowy α [°]"
            type="number"
            step="0.1"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
          />


          <ResultDisplay className="!min-h-[5rem]">
            {result !== null ? (
              <div className="text-center w-full">
                <div className="text-lg text-primary font-semibold mb-1">
                  Wysokość stożka
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  🔺 {result.toFixed(3)} mm
                </div>
                <div className="text-xs text-muted-foreground mt-2 px-2">
                  Wysokość stożka mierzona jest od czubka wiertła do początku pełnej średnicy.
                </div>
              </div>
            ) : (
              diameter && angle ? (
                <span className="text-muted-foreground">Wprowadź prawidłowe wartości</span>
              ) : null
            )}
          </ResultDisplay>
        </div>
      </div>

      <button onClick={handleClear} className="clear-btn mt-6">
        Wyczyść
      </button>
    </div>
  );
};

export default DrillConeCalculator;
