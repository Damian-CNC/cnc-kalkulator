import { useState, useMemo } from 'react';
import SelectField from './SelectField';
import InputField from './InputField';
import ResultDisplay from './ResultDisplay';
import { standardCuttingParams, standardDiameters, aeTypes, AeType } from '@/data/cuttingParamsData';

const materials = Object.keys(standardCuttingParams);
const diameterOptions = standardDiameters.map(d => ({ value: String(d), label: `${d} mm` }));
const materialOptions = materials.map(m => ({ value: m, label: m }));
const aeOptions = aeTypes.map(a => ({ value: a, label: a }));

const StandardCuttingCalculator = () => {
  const [material, setMaterial] = useState(materials[0]);
  const [ae, setAe] = useState<AeType>("1.0 x D");
  const [diameter, setDiameter] = useState('10');
  const [teeth, setTeeth] = useState('4');

  const result = useMemo(() => {
    const d = parseFloat(diameter);
    const z = parseFloat(teeth);
    if (!d || !z || d <= 0 || z <= 0) return null;

    const data = standardCuttingParams[material]?.[ae];
    if (!data) return null;

    const fz = data.fz[d];
    if (fz === undefined) return null;

    const vc = data.vc;
    const n = Math.round((vc * 1000) / (Math.PI * d));
    const vf = Math.round(n * fz * z);

    return { n, vf, vc, fz };
  }, [material, ae, diameter, teeth]);

  return (
    <div className="glass-container">
      <div className="flex flex-col gap-6">
        <div className="glass-module">
          <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
            📋 Dane wejściowe
          </h2>
          <div className="flex flex-col gap-4">
            <SelectField
              label="Materiał"
              options={materialOptions}
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
            <SelectField
              label="Zagłębienie boczne (ae)"
              options={aeOptions}
              value={ae}
              onChange={(e) => setAe(e.target.value as AeType)}
            />
            <SelectField
              label="Średnica freza D [mm]"
              options={diameterOptions}
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
            />
            <InputField
              label="Ilość ostrzy (Z)"
              type="number"
              inputMode="numeric"
              min="1"
              value={teeth}
              onChange={(e) => setTeeth(e.target.value)}
            />
          </div>
        </div>

        {result && (
          <div className="glass-module">
            <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
              📊 Wyniki
            </h2>
            <div className="flex flex-col gap-3">
              <ResultDisplay>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-primary text-xl font-bold">🌀 {result.n} obr/min</span>
                </div>
              </ResultDisplay>
              <ResultDisplay>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-primary text-xl font-bold">🚀 {result.vf} mm/min</span>
                </div>
              </ResultDisplay>
              <div className="text-muted-foreground text-xs text-center mt-2 space-y-0.5">
                <p>V<sub>c</sub> = {result.vc} m/min &nbsp;|&nbsp; f<sub>z</sub> = {result.fz} mm/ząb</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardCuttingCalculator;
