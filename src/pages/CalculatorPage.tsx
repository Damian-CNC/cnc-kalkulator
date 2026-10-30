import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Delete as BackspaceIcon } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import CopyableValue from '@/components/CopyableValue';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { evaluate, formatNumber, numToExpr, previewExpr } from '@/lib/calcEngine';
import {
  CALC_INITIAL,
  inBackspace,
  inClear,
  inDecimal,
  inDigit,
  inEquals,
  inInsert,
  inOperator,
  inParen,
  inPercent,
  inToggleSign,
  toNum,
  type CalcState,
} from '@/lib/calcInput';

const CalculatorPage = () => {
  const { t, i18n } = useTranslation('tools');
  const { triggerLight, triggerSuccess } = useHaptics();
  const dec = i18n.language?.startsWith('en') ? '.' : ',';
  const [s, setS] = usePersistedState<CalcState>('calculator', CALC_INITIAL);
  const [error, setError] = useState(false);
  const errTimer = useRef<number | undefined>(undefined);

  const update = useCallback(
    (fn: (p: CalcState) => CalcState) => {
      setError(false);
      setS(fn);
    },
    [setS],
  );

  const digit = (d: string) => update((p) => inDigit(p, d));
  const decimal = () => update((p) => inDecimal(p));
  const operator = (op: string) => update((p) => inOperator(p, op));
  const paren = (kind: '(' | ')') => update((p) => inParen(p, kind));
  const percent = () => update((p) => inPercent(p));
  const backspace = () => update((p) => inBackspace(p));
  const clear = () => update((p) => inClear(p));
  const toggleSign = () => update((p) => inToggleSign(p));
  const insertValue = (val: string) => update((p) => inInsert(p, val));

  const equals = () => {
    const next = inEquals(s);
    if (next === 'noop') return;
    if (next === null) {
      setError(true);
      window.clearTimeout(errTimer.current);
      errTimer.current = window.setTimeout(() => setError(false), 1600);
      return;
    }
    triggerSuccess();
    setS(next);
  };

  // obsługa klawiatury (komputer)
  const handlers = useRef({ digit, decimal, operator, paren, percent, backspace, clear, equals });
  handlers.current = { digit, decimal, operator, paren, percent, backspace, clear, equals };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const h = handlers.current;
      const k = e.key;
      if (/^[0-9]$/.test(k)) h.digit(k);
      else if (k === '.' || k === ',') h.decimal();
      else if (k === '+') h.operator('+');
      else if (k === '-') h.operator('−');
      else if (k === '*' || k === 'x' || k === 'X') h.operator('×');
      else if (k === '/') h.operator('÷');
      else if (k === '(') h.paren('(');
      else if (k === ')') h.paren(')');
      else if (k === '%') h.percent();
      else if (k === 'Enter' || k === '=') h.equals();
      else if (k === 'Backspace') h.backspace();
      else if (k === 'Escape') h.clear();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Zapobiegaj przewijaniu i efektowi 'rubber-banding' na smartfonach w widoku pełnoekranowym
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehaviorY;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehaviorY = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehaviorY = prevOverscroll;
    };
  }, []);

  // --- wyświetlanie ---
  const hasStructure = /[+−×÷()%]/.test(s.expr);
  const live = !s.done && hasStructure ? evaluate(previewExpr(s.expr)) : null;
  const bigNumber = s.done ? toNum(s.result) : live;
  const showExpr = (e: string) => e.replace(/\./g, dec);
  const bigText = error
    ? t('calc.error')
    : bigNumber !== null
      ? formatNumber(bigNumber, dec)
      : s.expr === ''
        ? '0'
        : hasStructure
          ? ''
          : showExpr(s.expr);
  const copyValue = bigNumber !== null ? numToExpr(bigNumber).replace('−', '-') : null;
  const sizeCls =
    bigText.length > 16
      ? 'text-2xl sm:text-3xl'
      : bigText.length > 12
        ? 'text-3xl sm:text-4xl'
        : bigText.length > 8
          ? 'text-4xl sm:text-5xl'
          : 'text-5xl sm:text-6xl';

  // długie przytrzymanie wyniku z historii = kopiowanie
  const pressTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const copyToClipboard = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      triggerSuccess();
    } catch {
      /* brak dostępu do schowka */
    }
  };

  const lastOp = s.expr[s.expr.length - 1];
  const Key = ({
    label,
    onPress,
    kind = 'num',
    wide,
    active,
    aria,
  }: {
    label: React.ReactNode;
    onPress: () => void;
    kind?: 'num' | 'fn' | 'op';
    wide?: boolean;
    active?: boolean;
    aria?: string;
  }) => (
    <button
      type="button"
      aria-label={aria}
      onClick={() => {
        triggerLight();
        onPress();
      }}
      className={`h-[clamp(2.75rem,7.2dvh,4.25rem)] md:h-[4.5rem] rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-semibold select-none border transition-all active:scale-95 touch-manipulation ${
        wide ? 'col-span-3' : ''
      } ${
        kind === 'op'
          ? active
            ? 'bg-cyan-100 border-cyan-200 text-cyan-700'
            : 'bg-cyan-600 border-cyan-500 text-white active:bg-cyan-500'
          : kind === 'fn'
            ? 'bg-zinc-800 border-zinc-700 text-cyan-300 active:bg-zinc-700'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100 active:bg-zinc-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <PageLayout title={t('calc.title')} fullScreenMobile wideDesktop>
      <div className="w-full md:max-w-3xl mx-auto flex flex-col md:grid md:grid-cols-[260px_1fr] md:gap-8 md:items-center flex-1 h-full min-h-0 justify-between md:justify-center md:py-4">
        {/* Lewa kolumna na PC (panel historii i wskazówek) / Górny pasek na mobile */}
        <div className="md:bg-zinc-900/50 md:border md:border-zinc-800/80 md:rounded-3xl md:p-5 md:space-y-4">
          <p className="hidden md:block text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2">
            {t('calc.history', { defaultValue: 'Ostatnie wyniki' })}
          </p>

          {/* trzy ostatnie wyniki na mobile / lista na PC */}
          <div className="flex md:flex-col gap-1.5 sm:gap-2 mb-1 shrink-0 min-h-[1.75rem] sm:min-h-[2.25rem]" aria-label={t('calc.history')}>
            {s.history.map((h, i) => (
              <button
                key={`${h}-${i}`}
                type="button"
                onPointerDown={() => {
                  longPressed.current = false;
                  pressTimer.current = window.setTimeout(() => {
                    longPressed.current = true;
                    copyToClipboard(h.replace('−', '-'));
                  }, 550);
                }}
                onPointerUp={() => window.clearTimeout(pressTimer.current)}
                onPointerLeave={() => window.clearTimeout(pressTimer.current)}
                onPointerCancel={() => window.clearTimeout(pressTimer.current)}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => {
                  if (longPressed.current) {
                    longPressed.current = false;
                    return;
                  }
                  triggerLight();
                  insertValue(h);
                }}
                className="flex-1 md:flex-initial md:w-full text-center md:text-left truncate px-2.5 py-1 sm:px-3 sm:py-2 md:py-2.5 rounded-full md:rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-semibold text-cyan-400 hover:border-cyan-600/60 active:scale-95 transition-all shadow-sm"
              >
                {formatNumber(toNum(h), dec)}
              </button>
            ))}
            {s.history.length === 0 && (
              <p className="hidden md:block text-xs text-zinc-600 italic py-4">
                {t('calc.noHistory', { defaultValue: 'Brak historii obliczeń' })}
              </p>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-600 mb-1 sm:mb-2 text-right md:text-left shrink-0">{t('calc.hint')}</p>
        </div>

        {/* Prawa kolumna: wyrażenie, wynik i klawiatura */}
        <div className="max-w-sm w-full mx-auto md:mx-0 flex flex-col justify-end">
          <div className="px-2 pb-1 sm:pb-2 md:pb-3 text-right flex flex-col justify-end">
            <div className="min-h-[1.25rem] sm:min-h-[1.5rem] md:min-h-[1.75rem] text-sm sm:text-base md:text-lg text-zinc-400 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
              {s.expr && (hasStructure || s.done) ? `${showExpr(s.expr)}${s.done ? ' =' : ''}` : '\u00A0'}
            </div>
            <div className={`${sizeCls} font-light text-white leading-tight min-h-[2.5rem] sm:min-h-[3.5rem] md:min-h-[4rem] flex items-end justify-end`}>
              {copyValue !== null && !error ? (
                <CopyableValue value={copyValue}>{bigText}</CopyableValue>
              ) : (
                <span>{bigText || '\u00A0'}</span>
              )}
            </div>
          </div>

          {/* klawiatura */}
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-2.5 shrink-0 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]">
            <Key label="AC" kind="fn" onPress={clear} aria="AC" />
            <Key label={<BackspaceIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6" />} kind="fn" onPress={backspace} aria="Backspace" />
            <Key label="(" kind="fn" onPress={() => paren('(')} />
            <Key label=")" kind="fn" onPress={() => paren(')')} />

            <Key label="7" onPress={() => digit('7')} />
            <Key label="8" onPress={() => digit('8')} />
            <Key label="9" onPress={() => digit('9')} />
            <Key label="÷" kind="op" onPress={() => operator('÷')} active={!s.done && lastOp === '÷'} />

            <Key label="4" onPress={() => digit('4')} />
            <Key label="5" onPress={() => digit('5')} />
            <Key label="6" onPress={() => digit('6')} />
            <Key label="×" kind="op" onPress={() => operator('×')} active={!s.done && lastOp === '×'} />

            <Key label="1" onPress={() => digit('1')} />
            <Key label="2" onPress={() => digit('2')} />
            <Key label="3" onPress={() => digit('3')} />
            <Key label="−" kind="op" onPress={() => operator('−')} active={!s.done && lastOp === '−'} />

            <Key label="0" onPress={() => digit('0')} />
            <Key label={dec} onPress={decimal} />
            <Key label="%" kind="fn" onPress={percent} />
            <Key label="+" kind="op" onPress={() => operator('+')} active={!s.done && lastOp === '+'} />

            <Key label="±" kind="fn" onPress={toggleSign} aria={t('calc.sign')} />
            <Key label="=" kind="op" wide onPress={equals} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CalculatorPage;
