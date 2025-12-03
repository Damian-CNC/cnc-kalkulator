import { useState, useMemo } from 'react';
import InputField from './InputField';
import SelectField from './SelectField';
import ResultDisplay from './ResultDisplay';

type ShapeType = 'rod' | 'tube' | 'flat';

interface Material {
  density: number;
  description: string;
}

const materials: Record<string, Material> = {
  "S235/S355": { density: 7.85, description: "Stal konstrukcyjna" },
  "40H/40HM": { density: 7.85, description: "Stal konstrukcyjna węglowa" },
  "C45": { density: 7.85, description: "Stal węglowa" },
  "NC11LV": { density: 7.85, description: "Stal nierdzewna martenzytyczna" },
  "AISI 304": { density: 8.00, description: "Stal nierdzewna austenityczna" },
  "AISI 316": { density: 8.00, description: "Stal nierdzewna austenityczna" },
  "4H13": { density: 7.75, description: "Stal nierdzewna martenzytyczna" },
  "Aluminium PA4": { density: 2.70, description: "Stop aluminium" },
  "Aluminium PA13": { density: 2.70, description: "Stop aluminium" },
  "POM-C": { density: 1.41, description: "Polioxymetan kopolimer" }
};

const WeightCalculator = () => {
  const [shapeType, setShapeType] = useState<ShapeType>('rod');
  const [materialType, setMaterialType] = useState('');
  const [quantity, setQuantity] = useState('1');

  // Rod fields
  const [rodDiameter, setRodDiameter] = useState('');
  const [rodLength, setRodLength] = useState('');

  // Tube fields
  const [tubeOuterDia, setTubeOuterDia] = useState('');
  const [tubeInnerDia, setTubeInnerDia] = useState('');
  const [tubeLength, setTubeLength] = useState('');

  // Flat fields
  const [flatA, setFlatA] = useState('');
  const [flatB, setFlatB] = useState('');
  const [flatLength, setFlatLength] = useState('');

  const shapeOptions = [
    { value: 'rod', label: 'Wałek' },
    { value: 'tube', label: 'Rura' },
    { value: 'flat', label: 'Płaskownik' }
  ];

  const materialOptions = useMemo(() => [
    { value: '', label: 'Wybierz materiał' },
    ...Object.keys(materials).map(key => ({ value: key, label: key }))
  ], []);

  const calculateWeight = useMemo(() => {
    if (!materialType) return null;

    const density = materials[materialType].density;
    const qty = parseFloat(quantity) || 1;
    let volume = 0;

    try {
      if (shapeType === 'rod') {
        const dia = parseFloat(rodDiameter);
        const len = parseFloat(rodLength);
        if (dia > 0 && len > 0) {
          volume = Math.PI * Math.pow(dia / 2, 2) * len / 1000;
        }
      } else if (shapeType === 'tube') {
        const outer = parseFloat(tubeOuterDia);
        const inner = parseFloat(tubeInnerDia);
        const len = parseFloat(tubeLength);
        if (outer > 0 && inner >= 0 && len > 0 && outer > inner) {
          volume = Math.PI * (Math.pow(outer / 2, 2) - Math.pow(inner / 2, 2)) * len / 1000;
        }
      } else if (shapeType === 'flat') {
        const a = parseFloat(flatA);
        const b = parseFloat(flatB);
        const len = parseFloat(flatLength);
        if (a > 0 && b > 0 && len > 0) {
          volume = a * b * len / 1000;
        }
      }

      if (volume > 0) {
        const totalWeight = volume * density * qty;
        const weightKg = totalWeight / 1000;
        return {
          weightKg: weightKg.toFixed(3),
          weightG: totalWeight.toFixed(1),
          volume: volume.toFixed(2),
          density,
          quantity: qty,
          material: materialType
        };
      }
    } catch {
      return null;
    }

    return null;
  }, [shapeType, materialType, quantity, rodDiameter, rodLength, tubeOuterDia, tubeInnerDia, tubeLength, flatA, flatB, flatLength]);

  const handleClear = () => {
    setShapeType('rod');
    setMaterialType('');
    setQuantity('1');
    setRodDiameter('');
    setRodLength('');
    setTubeOuterDia('');
    setTubeInnerDia('');
    setTubeLength('');
    setFlatA('');
    setFlatB('');
    setFlatLength('');
  };

  return (
    <div className="glass-container animate-fade-in">
      <div className="glass-module">
        <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
          ⚖️ Kalkulator wagi przygotówki
        </h2>

        <div className="flex flex-col gap-4">
          <SelectField
            label="Kształt półfabrykatu"
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value as ShapeType)}
            options={shapeOptions}
          />

          {/* Rod Fields */}
          {shapeType === 'rod' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <InputField
                label="Średnica zewnętrzna [mm]"
                type="number"
                step="0.1"
                value={rodDiameter}
                onChange={(e) => setRodDiameter(e.target.value)}
              />
              <InputField
                label="Długość [mm]"
                type="number"
                step="0.1"
                value={rodLength}
                onChange={(e) => setRodLength(e.target.value)}
              />
            </div>
          )}

          {/* Tube Fields */}
          {shapeType === 'tube' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <InputField
                label="Średnica zewnętrzna [mm]"
                type="number"
                step="0.1"
                value={tubeOuterDia}
                onChange={(e) => setTubeOuterDia(e.target.value)}
              />
              <InputField
                label="Średnica wewnętrzna [mm]"
                type="number"
                step="0.1"
                value={tubeInnerDia}
                onChange={(e) => setTubeInnerDia(e.target.value)}
              />
              <InputField
                label="Długość [mm]"
                type="number"
                step="0.1"
                value={tubeLength}
                onChange={(e) => setTubeLength(e.target.value)}
              />
            </div>
          )}

          {/* Flat Fields */}
          {shapeType === 'flat' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <InputField
                label="Wymiar A [mm]"
                type="number"
                step="0.1"
                value={flatA}
                onChange={(e) => setFlatA(e.target.value)}
              />
              <InputField
                label="Wymiar B [mm]"
                type="number"
                step="0.1"
                value={flatB}
                onChange={(e) => setFlatB(e.target.value)}
              />
              <InputField
                label="Długość [mm]"
                type="number"
                step="0.1"
                value={flatLength}
                onChange={(e) => setFlatLength(e.target.value)}
              />
            </div>
          )}

          <SelectField
            label="Materiał"
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            options={materialOptions}
          />

          <InputField
            label="Ilość sztuk"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <ResultDisplay className="!min-h-[6rem]">
            {calculateWeight ? (
              <div className="text-center w-full">
                <div className="text-lg text-primary font-semibold mb-1">
                  Masa całkowita
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {calculateWeight.weightKg} kg
                </div>
                <div className="text-sm text-muted-foreground">
                  {calculateWeight.weightG} g | {calculateWeight.quantity} szt. | {calculateWeight.material}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Objętość: {calculateWeight.volume} cm³ | Gęstość: {calculateWeight.density} g/cm³
                </div>
              </div>
            ) : materialType ? (
              <span className="text-muted-foreground">Wprowadź prawidłowe wartości</span>
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

export default WeightCalculator;
