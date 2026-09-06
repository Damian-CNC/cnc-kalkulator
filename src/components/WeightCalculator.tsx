import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Trash2, RotateCcw } from 'lucide-react';
import InputField from './InputField';
import SelectField from './SelectField';
import ResultDisplay from './ResultDisplay';
import ShapeIcon, { ShapeType } from './ShapeIcon';
import { useUnits } from '@/contexts/UnitContext';
import { parseDecimal } from '@/lib/numericInput';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { toast } from '@/hooks/use-toast';

type MaterialId =
  | 'steel'
  | 'stainless'
  | 'toolSteel'
  | 'castIron'
  | 'aluminium'
  | 'brass'
  | 'bronze'
  | 'copper'
  | 'pomc'
  | 'pa6'
  | 'ptfe'
  | 'peek';

const MATERIALS: { id: MaterialId; density: number }[] = [
  { id: 'steel', density: 7.85 },
  { id: 'stainless', density: 7.95 },
  { id: 'toolSteel', density: 7.8 },
  { id: 'castIron', density: 7.2 },
  { id: 'aluminium', density: 2.7 },
  { id: 'brass', density: 8.5 },
  { id: 'bronze', density: 8.8 },
  { id: 'copper', density: 8.96 },
  { id: 'pomc', density: 1.41 },
  { id: 'pa6', density: 1.14 },
  { id: 'ptfe', density: 2.2 },
  { id: 'peek', density: 1.32 },
];

const SHAPES: ShapeType[] = [
  'rod',
  'tube',
  'flat',
  'square',
  'hex',
  'rhs',
  'angle',
  'channel',
  'tee',
  'ibeam',
];

/** Field label keys per shape: [dimA, dimB, dimC, dimD] — null means unused. */
const SHAPE_FIELDS: Record<ShapeType, (string | null)[]> = {
  rod: ['outerDiameter', null, null, null],
  tube: ['outerDiameter', 'innerDiameter', null, null],
  flat: ['dimensionA', 'dimensionB', null, null],
  square: ['side', null, null, null],
  hex: ['acrossFlats', null, null, null],
  rhs: ['height', 'width', 'wallThickness', null],
  angle: ['legA', 'legB', 'wallThickness', null],
  channel: ['height', 'flangeWidth', 'webThickness', 'flangeThickness'],
  tee: ['flangeWidth', 'height', 'flangeThickness', 'webThickness'],
  ibeam: ['height', 'flangeWidth', 'webThickness', 'flangeThickness'],
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
  dimA: '',
  dimB: '',
  dimC: '',
  dimD: '',
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

  const materialOptions = useMemo(
    () => [
      { value: '', label: t('fields.materialSelect') },
      ...MATERIALS.map((m) => ({ value: m.id, label: t(`materialGroups.${m.id}`) })),
    ],
    [t]
  );

  const fields = SHAPE_FIELDS[form.shapeType] ?? SHAPE_FIELDS.rod;

  const result = useMemo(() => {
    const material = MATERIALS.find((m) => m.id === form.materialType);
    if (!material) return null;
    const density = material.density;
    const qty = Math.max(1, Math.floor(parseDecimal(form.quantity) ?? 1));
    const a = parseDecimal(form.dimA) ?? 0;
    const b = parseDecimal(form.dimB) ?? 0;
    const c = parseDecimal(form.dimC) ?? 0;
    const d = parseDecimal(form.dimD) ?? 0;
    const len = parseDecimal(form.length) ?? 0;
    if (a <= 0 || len <= 0) return null;

    let area = 0; // mm²
    let desc = '';
    switch (form.shapeType) {
      case 'rod':
        area = Math.PI * (a / 2) ** 2;
        desc = `Ø${a} L=${len}`;
        break;
      case 'tube':
        if (!(b > 0) || b >= a) return null;
        area = Math.PI * ((a / 2) ** 2 - (b / 2) ** 2);
        desc = `Ø${a}/Ø${b} L=${len}`;
        break;
      case 'flat':
        if (!(b > 0)) return null;
        area = a * b;
        desc = `${a}×${b} L=${len}`;
        break;
      case 'square':
        area = a * a;
        desc = `□${a} L=${len}`;
        break;
      case 'hex':
        area = (Math.sqrt(3) / 2) * a * a;
        desc = `s=${a} L=${len}`;
        break;
      case 'rhs': {
        if (!(b > 0) || !(c > 0) || 2 * c >= a || 2 * c >= b) return null;
        area = a * b - (a - 2 * c) * (b - 2 * c);
        desc = `${a}×${b}×${c} L=${len}`;
        break;
      }
      case 'angle': {
        if (!(b > 0) || !(c > 0) || c >= a || c >= b) return null;
        area = (a + b - c) * c;
        desc = `L ${a}×${b}×${c} L=${len}`;
        break;
      }
      case 'channel': {
        if (!(b > 0) || !(c > 0) || !(d > 0) || 2 * d >= a) return null;
        area = 2 * b * d + (a - 2 * d) * c;
        desc = `U ${a}×${b}×${c}/${d} L=${len}`;
        break;
      }
      case 'tee': {
        // a = flange width B, b = total height H, c = flange thickness t, d = web thickness s
        if (!(b > 0) || !(c > 0) || !(d > 0) || c >= b) return null;
        area = a * c + (b - c) * d;
        desc = `T ${a}×${b}×${c}/${d} L=${len}`;
        break;
      }
      case 'ibeam': {
        if (!(b > 0) || !(c > 0) || !(d > 0) || 2 * d >= a) return null;
        area = 2 * b * d + (a - 2 * d) * c;
        desc = `I ${a}×${b}×${c}/${d} L=${len}`;
        break;
      }
      default:
        return null;
    }

    const volume = (area * len) / 1000; // cm³
    if (!(volume > 0)) return null;
    const singleKg = (volume * density) / 1000;
    return {
      desc: `${t(`shapes.${form.shapeType}`)} ${desc}`,
      material: t(`materialGroups.${material.id}`),
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
        material: result.material,
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
        <p className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
          {t('fields.shape')}
        </p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {SHAPES.map((s) => {
            const active = form.shapeType === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => set({ shapeType: s })}
                aria-pressed={active}
                title={t(`shapes.${s}`)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 touch-manipulation transition-colors ${
                  active
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <ShapeIcon shape={s} className="w-6 h-6" />
                <span className="text-[9px] font-semibold uppercase tracking-wide leading-tight text-center">
                  {t(`shapes.${s}`)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <InputField
            label={t(`fields.${fields[0]}`)}
            value={form.dimA}
            onChange={(e) => set({ dimA: e.target.value })}
          />
          <InputField
            label={t('fields.length')}
            value={form.length}
            onChange={(e) => set({ length: e.target.value })}
          />

          {fields[1] && (
            <InputField
              label={t(`fields.${fields[1]}`)}
              value={form.dimB}
              onChange={(e) => set({ dimB: e.target.value })}
            />
          )}
          {fields[2] && (
            <InputField
              label={t(`fields.${fields[2]}`)}
              value={form.dimC}
              onChange={(e) => set({ dimC: e.target.value })}
            />
          )}
          {fields[3] && (
            <InputField
              label={t(`fields.${fields[3]}`)}
              value={form.dimD}
              onChange={(e) => set({ dimD: e.target.value })}
            />
          )}

          <div className="col-span-2">
            <SelectField
              label={t('fields.material')}
              value={form.materialType}
              onChange={(e) => set({ materialType: e.target.value })}
              options={materialOptions}
            />
          </div>
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
                {result.qty} {t('result.pieces')} · {t('result.volume')}:{' '}
                {result.volume.toFixed(2)} cm³ · {t('result.density')}: {result.density} g/cm³
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
                <ShapeIcon shape={item.shape} className="w-5 h-5 text-zinc-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-200 truncate">{item.desc}</p>
                  <p className="text-xs text-zinc-500 truncate">
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
