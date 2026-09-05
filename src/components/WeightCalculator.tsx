import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Trash2, RotateCcw } from 'lucide-react';
import InputField from './InputField';
import SelectField from './SelectField';
import ResultDisplay from './ResultDisplay';
import { useUnits } from '@/contexts/UnitContext';
import { parseDecimal } from '@/lib/numericInput';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { toast } from '@/hooks/use-toast';

type ShapeType = 'rod' | 'tube' | 'flat' | 'square' | 'hex';

const materials: Record<string, number> = {
  'S235/S355': 7.85,
  '40H/40HM': 7.85,
  C45: 7.85,
  NC11LV: 7.85,
  'AISI 304': 8.0,
  'AISI 316': 8.0,
  '4H13': 7.75,
  'Aluminium PA4': 2.7,
  'Aluminium PA13': 2.7,
  'POM-C': 1.41,
};

interface InventoryItem {
  id: string;
  shape: ShapeType;
  desc: string;
  material: string;
  quantity: number;
  weightKg: number;
}

const INVENTORY_KEY = 'cnc_material_inventory_items';

const readInventory = (): InventoryItem[] => {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeInventory = (items: InventoryItem[]) => {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
  } catch {
    /* noop */
  }
};

const emptyForm = {
  shapeType: 'rod' as ShapeType,
  materialType: '',
  quantity: '1',
  dimA: '', // outer diameter / width / across flats
  dimB: '', // inner diameter / thickness
  length: '',
};

const WeightCalculator = () => {
  const { t } = useTranslation('weight');
  const { isImperial } = useUnits();
  const { triggerSuccess, triggerWarning } = useHaptics();
  const [form, setForm, resetForm] = usePersistedState('weight-calc', emptyForm);
  const [items, setItems] = useState<InventoryItem[]>(readInventory);

  const set = useCallback(
    (patch: Partial<typeof emptyForm>) => setForm((prev) => ({ ...prev, ...patch })),
    [setForm]
  );

  const shapeOptions = useMemo(
    () =>
      (['rod', 'tube', 'flat', 'square', 'hex'] as ShapeType[]).map((s) => ({
        value: s,
        label: t(`shapes.${s}`),
      })),
    [t]
  );

  const materialOptions = useMemo(
    () => [
      { value: '', label: t('fields.materialSelect') },
      ...Object.keys(materials).map((k) => ({ value: k, label: k })),
    ],
    [t]
  );

  const dimALabel = useMemo(() => {
    switch (form.shapeType) {
      case 'flat':
        return t('fields.dimensionA');
      case 'square':
        return t('fields.side');
      case 'hex':
        return t('fields.acrossFlats');
      default:
        return t('fields.outerDiameter');
    }
  }, [form.shapeType, t]);

  const result = useMemo(() => {
    const density = materials[form.materialType];
    if (!density) return null;
    const qty = Math.max(1, Math.floor(parseDecimal(form.quantity) ?? 1));
    const a = parseDecimal(form.dimA) ?? 0;
    const b = parseDecimal(form.dimB) ?? 0;
    const len = parseDecimal(form.length) ?? 0;
    if (a <= 0 || len <= 0) return null;

    let area = 0; // mm²
    let desc = '';
    if (form.shapeType === 'rod') {
      area = Math.PI * (a / 2) ** 2;
      desc = `Ø${a} L=${len}`;
    } else if (form.shapeType === 'tube') {
      if (!(b > 0) || b >= a) return null;
      area = Math.PI * ((a / 2) ** 2 - (b / 2) ** 2);
      desc = `Ø${a}/Ø${b} L=${len}`;
    } else if (form.shapeType === 'flat') {
      if (!(b > 0)) return null;
      area = a * b;
      desc = `${a}×${b} L=${len}`;
    } else if (form.shapeType === 'square') {
      area = a * a;
      desc = `□${a} L=${len}`;
    } else {
      area = (Math.sqrt(3) / 2) * a * a;
      desc = `s=${a} L=${len}`;
    }

    const volume = (area * len) / 1000; // cm³
    if (!(volume > 0)) return null;
    const singleKg = (volume * density) / 1000;
    return {
      desc: `${t(`shapes.${form.shapeType}`)} ${desc}`,
      volume,
      density,
      qty,
      singleKg,
      totalKg: singleKg * qty,
    };
  }, [form, t]);

  const fmtMass = useCallback(
    (kg: number) => (isImperial ? `${(kg * 2.20462262).toFixed(2)} lbs` : `${kg.toFixed(2)} kg`),
    [isImperial]
  );

  const addItem = () => {
    if (!result) return;
    triggerSuccess();
    const next = [
      ...items,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        shape: form.shapeType,
        desc: result.desc,
        material: form.materialType,
        quantity: result.qty,
        weightKg: result.totalKg,
      },
    ];
    setItems(next);
    writeInventory(next);
    toast({ title: t('inventory.added') });
  };

  const removeItem = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    writeInventory(next);
  };

  const clearList = () => {
    if (!items.length) return;
    if (!window.confirm(t('inventory.confirmClear'))) return;
    triggerWarning();
    setItems([]);
    writeInventory([]);
    toast({ title: t('inventory.cleared') });
  };

  const totals = useMemo(
    () => ({
      kg: items.reduce((s, i) => s + i.weightKg, 0),
      pcs: items.reduce((s, i) => s + i.quantity, 0),
    }),
    [items]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2">
            <SelectField
              label={t('fields.shape')}
              value={form.shapeType}
              onChange={(e) => set({ shapeType: e.target.value as ShapeType })}
              options={shapeOptions}
            />
          </div>

          <InputField
            label={dimALabel}
            value={form.dimA}
            onChange={(e) => set({ dimA: e.target.value })}
          />
          <InputField
            label={t('fields.length')}
            value={form.length}
            onChange={(e) => set({ length: e.target.value })}
          />

          {(form.shapeType === 'tube' || form.shapeType === 'flat') && (
            <div className="col-span-2">
              <InputField
                label={form.shapeType === 'tube' ? t('fields.innerDiameter') : t('fields.dimensionB')}
                value={form.dimB}
                onChange={(e) => set({ dimB: e.target.value })}
              />
            </div>
          )}

          <SelectField
            label={t('fields.material')}
            value={form.materialType}
            onChange={(e) => set({ materialType: e.target.value })}
            options={materialOptions}
          />
          <InputField
            label={t('fields.quantity')}
            inputMode="numeric"
            value={form.quantity}
            onChange={(e) => set({ quantity: e.target.value })}
          />
        </div>

        <ResultDisplay className="!min-h-[5rem] mt-4">
          {result ? (
            <div className="text-center w-full">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                {t('result.totalWeight')}
              </div>
              <div className="text-2xl font-bold text-cyan-400 mb-1">{fmtMass(result.totalKg)}</div>
              <div className="text-xs text-zinc-500">
                {result.qty} {t('result.pieces')} · {form.materialType} ·{' '}
                {t('result.volume')}: {result.volume.toFixed(2)} cm³ · {t('result.density')}:{' '}
                {result.density} g/cm³
              </div>
            </div>
          ) : (
            <span className="text-zinc-600 text-sm">{t('result.invalid')}</span>
          )}
        </ResultDisplay>

        <button
          type="button"
          onClick={addItem}
          disabled={!result}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wider text-cyan-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <PlusCircle className="w-5 h-5" />
          {t('inventory.add')}
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300">
            {t('inventory.title')}
          </h3>
          <button
            type="button"
            onClick={clearList}
            disabled={!items.length}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            {t('inventory.clearList')}
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-600 py-4 text-center">{t('inventory.empty')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-800">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-200 truncate">{item.desc}</p>
                  <p className="text-xs text-zinc-500">
                    {item.material} × {item.quantity} {t('result.pieces')}
                  </p>
                </div>
                <span className="text-sm font-bold text-cyan-400 whitespace-nowrap">
                  {fmtMass(item.weightKg)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={t('inventory.remove')}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">
              {t('inventory.totalWeight')}
            </p>
            <p className="text-xl font-black text-cyan-400">{fmtMass(totals.kg)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">
              {t('inventory.totalPieces')}
            </p>
            <p className="text-xl font-black text-zinc-200">
              {totals.pcs} {t('result.pieces')}
            </p>
          </div>
        </div>
      </div>

      <button onClick={resetForm} className="clear-btn">
        {t('clear')}
      </button>
    </div>
  );
};

export default WeightCalculator;
