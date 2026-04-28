import { useState, ChangeEvent } from 'react';
import InputField from './InputField';

type Field = 'D' | 'Z' | 'vc' | 'n' | 'fz' | 'vf' | 'd2' | 'fc';

type Values = Record<Field, string>;

const EMPTY: Values = {
  D: '', Z: '', vc: '', n: '', fz: '', vf: '', d2: '', fc: '',
};

const num = (s: string): number | null => {
  if (s === '' || s === null || s === undefined) return null;
  const v = parseFloat(s);
  return isNaN(v) || !isFinite(v) ? null : v;
};

const fmt = (v: number, decimals = 3): string => {
  if (!isFinite(v)) return '';
  // smart rounding
  const abs = Math.abs(v);
  let d = decimals;
  if (abs >= 100) d = 1;
  else if (abs >= 10) d = 2;
  else if (abs >= 1) d = 3;
  else d = 4;
  return parseFloat(v.toFixed(d)).toString();
};

/**
 * Solver – uzupełnia brakujące pola.
 * computed = pola, które właśnie zostały wyliczone (do podświetlenia).
 * Iteruje, dopóki nowe wartości pojawiają się w polach pustych.
 */
function solve(values: Values, changedField: Field): { values: Values; computed: Set<Field> } {
  const v: Values = { ...values };
  const computed = new Set<Field>();

  // Pomocnicze – ustaw wartość tylko, jeśli pole było puste lub jest "computed"
  const setIfEmpty = (field: Field, raw: number | null, decimals = 3) => {
    if (raw === null || !isFinite(raw) || raw <= 0) return false;
    if (v[field] !== '' && !computed.has(field)) return false;
    if (field === changedField) return false;
    const formatted = field === 'Z' ? String(Math.round(raw)) : fmt(raw, decimals);
    if (v[field] === formatted) return false;
    v[field] = formatted;
    computed.add(field);
    return true;
  };

  // Iteracja – kilka rund, bo n łączy grupy A i B
  for (let i = 0; i < 6; i++) {
    let changed = false;

    const D = num(v.D);
    const Z = num(v.Z);
    const vc = num(v.vc);
    const n = num(v.n);
    const fz = num(v.fz);
    const vf = num(v.vf);
    const d2 = num(v.d2);
    const fc = num(v.fc);

    // ===== Grupa A: Vc, n, D =====
    if (vc !== null && D !== null && D > 0) {
      changed = setIfEmpty('n', (vc * 1000) / (Math.PI * D), 0) || changed;
    }
    if (n !== null && D !== null && n > 0) {
      changed = setIfEmpty('vc', (n * Math.PI * D) / 1000) || changed;
    }
    if (vc !== null && n !== null && n > 0) {
      changed = setIfEmpty('D', (vc * 1000) / (Math.PI * n)) || changed;
    }

    // ===== Grupa B: Vf, fz, Z, n =====
    const n2 = num(v.n);
    const Z2 = num(v.Z);
    const fz2 = num(v.fz);
    const vf2 = num(v.vf);

    if (fz2 !== null && Z2 !== null && n2 !== null) {
      changed = setIfEmpty('vf', fz2 * Z2 * n2, 1) || changed;
    }
    if (vf2 !== null && Z2 !== null && n2 !== null && Z2 > 0 && n2 > 0) {
      changed = setIfEmpty('fz', vf2 / (Z2 * n2), 4) || changed;
    }
    if (vf2 !== null && fz2 !== null && n2 !== null && fz2 > 0 && n2 > 0) {
      changed = setIfEmpty('Z', vf2 / (fz2 * n2)) || changed;
    }
    if (vf2 !== null && fz2 !== null && Z2 !== null && fz2 > 0 && Z2 > 0) {
      changed = setIfEmpty('n', vf2 / (fz2 * Z2), 0) || changed;
    }

    // ===== Grupa C: Fc, Vf, D1 (=D), D2 =====
    const D1 = num(v.D);
    const vf3 = num(v.vf);
    const d2v = num(v.d2);
    const fcv = num(v.fc);

    if (vf3 !== null && D1 !== null && d2v !== null && d2v > D1) {
      changed = setIfEmpty('fc', (vf3 * (d2v - D1)) / d2v, 1) || changed;
    }
    if (fcv !== null && d2v !== null && D1 !== null && d2v > D1) {
      changed = setIfEmpty('vf', (fcv * d2v) / (d2v - D1), 1) || changed;
    }
    if (vf3 !== null && fcv !== null && D1 !== null && vf3 > fcv) {
      changed = setIfEmpty('d2', (vf3 * D1) / (vf3 - fcv)) || changed;
    }

    if (!changed) break;
  }

  return { values: v, computed };
}

const ParametersCalculator = () => {
  const [values, setValues] = useState<Values>(EMPTY);
  const [computed, setComputed] = useState<Set<Field>>(new Set());

  const handleChange = (field: Field) => (e: ChangeEvent<HTMLInputElement>) => {
    const newValues: Values = { ...values, [field]: e.target.value };
    // Wyczyść z "computed" pola, których wartość użytkownik właśnie zmienia
    const baseComputed = new Set(computed);
    baseComputed.delete(field);
    // Wyczyść te wyliczone wartości, które zależą od zmienionego pola – pozwól solverowi je przeliczyć
    for (const f of Array.from(baseComputed)) {
      newValues[f] = '';
    }
    const result = solve(newValues, field);
    setValues(result.values);
    setComputed(result.computed);
  };

  const handleClear = () => {
    setValues(EMPTY);
    setComputed(new Set());
  };

  const isComputed = (f: Field) => computed.has(f);

  return (
    <div className="glass-container p-0 overflow-hidden">
      <div className="flex items-stretch pr-12 sm:pr-16">
        {/* Sekcja pól */}
        <div className="flex-1 flex flex-col gap-6 p-6 md:p-8 min-w-0">
          {/* Module 1: Obroty (Vc, D, n) */}
          <div className="glass-module">
            <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
              🌀 Obroty &amp; prędkość skrawania
            </h2>
            <div className="flex flex-col gap-4">
              <InputField
                label="Prędkość skrawania Vc [m/min]"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={values.vc}
                onChange={handleChange('vc')}
                computed={isComputed('vc')}
              />
              <InputField
                label="Średnica narzędzia D [mm]"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={values.D}
                onChange={handleChange('D')}
                computed={isComputed('D')}
              />
              <InputField
                label="Obroty n [obr/min]"
                type="number"
                step="1"
                inputMode="decimal"
                value={values.n}
                onChange={handleChange('n')}
                computed={isComputed('n')}
              />
            </div>
          </div>

          {/* Module 2: Posuw (fz, Z, n, Vf) */}
          <div className="glass-module">
            <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
              🚀 Posuw minutowy
            </h2>
            <div className="flex flex-col gap-4">
              <InputField
                label="Posuw na ząb fz [mm/ząb]"
                type="number"
                step="0.001"
                inputMode="decimal"
                value={values.fz}
                onChange={handleChange('fz')}
                computed={isComputed('fz')}
              />
              <InputField
                label="Liczba zębów Z"
                type="number"
                step="1"
                inputMode="numeric"
                value={values.Z}
                onChange={handleChange('Z')}
                computed={isComputed('Z')}
              />
              <InputField
                label="Posuw minutowy Vf [mm/min]"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={values.vf}
                onChange={handleChange('vf')}
                computed={isComputed('vf')}
              />
            </div>
          </div>

          {/* Module 3: Interpolacja kołowa (D, D2, Vf, Fc) */}
          <details className="glass-module group" open>
            <summary className="text-primary font-semibold text-lg mb-4 flex items-center gap-2 cursor-pointer list-none">
              <span className="transition-transform group-open:rotate-90">▸</span>
              🎯 Interpolacja kołowa (posuw centralny)
            </summary>
            <div className="flex flex-col gap-4 mt-2">
              <p className="text-muted-foreground text-xs">
                Wymaga D₂ &gt; D (średnica narzędzia). Vf to posuw na obwodzie, Fc to posuw w osi środka narzędzia.
              </p>
              <InputField
                label="Średnica narzędzia D₁ = D [mm]"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={values.D}
                onChange={handleChange('D')}
                computed={isComputed('D')}
              />
              <InputField
                label="Średnica obrabiana D₂ [mm]"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={values.d2}
                onChange={handleChange('d2')}
                computed={isComputed('d2')}
              />
              <InputField
                label="Posuw obwodowy Vf [mm/min]"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={values.vf}
                onChange={handleChange('vf')}
                computed={isComputed('vf')}
              />
              <InputField
                label="Posuw centralny Fc [mm/min]"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={values.fc}
                onChange={handleChange('fc')}
                computed={isComputed('fc')}
              />
            </div>
          </details>
        </div>

      </div>

      {/* Pionowy pasek WYCZYŚĆ – przyklejony do prawej krawędzi ekranu */}
      <button
        onClick={handleClear}
        className="clear-vertical clear-vertical-fixed group"
        aria-label="Wyczyść wszystkie pola"
        title="Wyczyść wszystkie pola"
        style={{
          paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 mb-3 transition-transform group-hover:scale-110"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
        <span className="clear-vertical-text">WYCZYŚĆ</span>
      </button>
    </div>
  );
};

export default ParametersCalculator;
