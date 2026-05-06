import { useState, ChangeEvent } from 'react';
import InputField from './InputField';

type Shape = 'hex' | 'square';
type Field = 'S' | 'D';

const round3 = (v: number) => parseFloat(v.toFixed(3)).toString();

const PolygonShaftCalculator = () => {
  const [shape, setShape] = useState<Shape>('hex');
  const [values, setValues] = useState<{ S: string; D: string }>({ S: '', D: '' });
  const [computed, setComputed] = useState<Field | null>(null);

  const factor = (sh: Shape) => (sh === 'hex' ? 2 / Math.sqrt(3) : Math.sqrt(2));

  const recompute = (sh: Shape, vals: { S: string; D: string }, changed: Field) => {
    const f = factor(sh);
    if (changed === 'S') {
      const s = parseFloat(vals.S);
      if (!isNaN(s) && s > 0) {
        setValues({ S: vals.S, D: round3(s * f) });
        setComputed('D');
        return;
      }
      setValues({ S: vals.S, D: '' });
      setComputed(null);
    } else {
      const d = parseFloat(vals.D);
      if (!isNaN(d) && d > 0) {
        setValues({ D: vals.D, S: round3(d / f) });
        setComputed('S');
        return;
      }
      setValues({ D: vals.D, S: '' });
      setComputed(null);
    }
  };

  const handleChange = (field: Field) => (e: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: e.target.value };
    recompute(shape, next, field);
  };

  const handleShapeChange = (sh: Shape) => {
    setShape(sh);
    // przelicz na podstawie pola wprowadzonego ręcznie
    const baseField: Field = computed === 'D' ? 'S' : computed === 'S' ? 'D' : 'S';
    if (values[baseField]) {
      recompute(sh, values, baseField);
    }
  };

  // SVG viewBox 200x200, środek (100,100), promień opisany R = 80
  const R = 80;
  const cx = 100;
  const cy = 100;

  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6; // flat-top? actually pointy-top with offset
    return `${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`;
  }).join(' ');

  // Square inscribed in circle, sides horizontal/vertical-ish (rotated 45)
  const sqHalf = R / Math.sqrt(2);
  const squarePoints = [
    `${cx - sqHalf},${cy - sqHalf}`,
    `${cx + sqHalf},${cy - sqHalf}`,
    `${cx + sqHalf},${cy + sqHalf}`,
    `${cx - sqHalf},${cy + sqHalf}`,
  ].join(' ');

  // Wymiar S (pod klucz) — odległość między równoległymi bokami
  // hex pointy-top: S = R * sqrt(3) (vertical distance between top/bottom flat sides)... here pointy at top via offset
  // Uproszczenie: pokazujemy poziomą linię S w środku figury.
  const sHexHalf = (R * Math.sqrt(3)) / 2;
  const sSqHalf = sqHalf;

  return (
    <div className="glass-container p-4 sm:p-6 flex flex-col gap-6">
      {/* Toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
        <button
          onClick={() => handleShapeChange('hex')}
          className={`py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            shape === 'hex'
              ? 'bg-primary text-primary-foreground shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Sześciokąt
        </button>
        <button
          onClick={() => handleShapeChange('square')}
          className={`py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            shape === 'square'
              ? 'bg-primary text-primary-foreground shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Kwadrat
        </button>
      </div>

      {/* SVG */}
      <div className="flex justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-56 sm:h-56">
          {/* okrąg opisany */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* figura */}
          {shape === 'hex' ? (
            <polygon points={hexPoints} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="2" />
          ) : (
            <polygon points={squarePoints} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="2" />
          )}
          {/* linia D (przekątna) */}
          <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="#22d3ee" strokeWidth="1" />
          <text x={cx + R + 4} y={cy + 4} fontSize="10" fill="#22d3ee">D</text>
          {/* linia S (pod klucz) */}
          {shape === 'hex' ? (
            <>
              <line x1={cx - sHexHalf} y1={cy - 30} x2={cx + sHexHalf} y2={cy - 30} stroke="#f59e0b" strokeWidth="1" />
              <text x={cx + sHexHalf + 4} y={cy - 26} fontSize="10" fill="#f59e0b">S</text>
            </>
          ) : (
            <>
              <line x1={cx - sSqHalf} y1={cy - 30} x2={cx + sSqHalf} y2={cy - 30} stroke="#f59e0b" strokeWidth="1" />
              <text x={cx + sSqHalf + 4} y={cy - 26} fontSize="10" fill="#f59e0b">S</text>
            </>
          )}
        </svg>
      </div>

      {/* Pola */}
      <div className="flex flex-col gap-4">
        <InputField
          label="Wymiar pod klucz S [mm]"
          type="number"
          step="0.001"
          inputMode="decimal"
          value={values.S}
          onChange={handleChange('S')}
          computed={computed === 'S'}
        />
        <InputField
          label="Przekątna / Min. wałek D [mm]"
          type="number"
          step="0.001"
          inputMode="decimal"
          value={values.D}
          onChange={handleChange('D')}
          computed={computed === 'D'}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {shape === 'hex'
          ? 'Sześciokąt: D = 2·S / √3'
          : 'Kwadrat: D = S · √2'}
      </p>
    </div>
  );
};

export default PolygonShaftCalculator;
