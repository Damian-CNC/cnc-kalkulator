import { evaluate, isOp, numToExpr, openParens, previewExpr } from '@/lib/calcEngine';

export type CalcState = {
  expr: string;
  done: boolean;
  result: string; // wynik po „=” (zapis z kropką)
  history: string[]; // 3 ostatnie wyniki, najnowszy pierwszy
};
export const CALC_INITIAL: CalcState = { expr: '', done: false, result: '', history: [] };

const MAX_LEN = 80;
const isDigit = (c: string | undefined) => c !== undefined && c >= '0' && c <= '9';
export const endsOperand = (e: string) => {
  const c = e[e.length - 1];
  return isDigit(c) || c === ')' || c === '%' || c === '.';
};
export const trailingNumber = (e: string) => /(\d+\.?\d*|\.\d+)$/.exec(e)?.[0] ?? '';
export const toNum = (s: string) => Number(s.replace('−', '-'));

export const inDigit = (p: CalcState, d: string): CalcState => {
  if (p.done) return { ...p, expr: d, done: false };
  if (p.expr.length >= MAX_LEN) return p;
  const tn = trailingNumber(p.expr);
  if (tn === '0') return { ...p, expr: p.expr.slice(0, -1) + d };
  const last = p.expr[p.expr.length - 1];
  if (last === ')' || last === '%') return { ...p, expr: p.expr + '×' + d };
  return { ...p, expr: p.expr + d };
};

export const inDecimal = (p: CalcState): CalcState => {
  if (p.done) return { ...p, expr: '0.', done: false };
  if (p.expr.length >= MAX_LEN) return p;
  if (trailingNumber(p.expr).includes('.')) return p;
  const last = p.expr[p.expr.length - 1];
  if (isDigit(last)) return { ...p, expr: p.expr + '.' };
  if (last === ')' || last === '%') return { ...p, expr: p.expr + '×0.' };
  return { ...p, expr: p.expr + '0.' };
};

export const inOperator = (p: CalcState, op: string): CalcState => {
  let expr = p.expr;
  if (p.done) expr = p.result;
  else if (p.expr.length >= MAX_LEN) return p;
  if (expr === '') return op === '−' ? { ...p, expr: '−', done: false } : p;
  const last = expr[expr.length - 1];
  if (last === '(') return op === '−' ? { ...p, expr: expr + '−', done: false } : p;
  if (isOp(last)) {
    if (op === '−' && (last === '×' || last === '÷')) return { ...p, expr: expr + op, done: false };
    // zamiana operatora (razem z ewentualnym minusem jednoargumentowym)
    let e = expr.slice(0, -1);
    if (isOp(e[e.length - 1]) && last === '−') e = e.slice(0, -1);
    if (e === '' || e[e.length - 1] === '(') return p;
    return { ...p, expr: e + op, done: false };
  }
  return { ...p, expr: expr + op, done: false };
};

export const inParen = (p: CalcState, kind: '(' | ')'): CalcState => {
  if (p.done) return kind === '(' ? { ...p, expr: '(', done: false } : p;
  if (p.expr.length >= MAX_LEN) return p;
  if (kind === '(') return { ...p, expr: p.expr + (endsOperand(p.expr) ? '×(' : '(') };
  if (openParens(p.expr) > 0 && endsOperand(p.expr) && !p.expr.endsWith('.')) {
    return { ...p, expr: p.expr + ')' };
  }
  return p;
};

export const inPercent = (p: CalcState): CalcState => {
  const e = p.done ? p.result : p.expr;
  if (!endsOperand(e) || e.endsWith('.')) return p;
  return { ...p, expr: e + '%', done: false };
};

export const inBackspace = (p: CalcState): CalcState => ({ ...p, expr: p.expr.slice(0, -1), done: false });
export const inClear = (p: CalcState): CalcState => ({ ...p, expr: '', done: false, result: '' });

export const inToggleSign = (p: CalcState): CalcState => {
  if (p.done) return { ...p, expr: numToExpr(-toNum(p.result)), done: false };
  const e = p.expr;
  if (e === '') return { ...p, expr: '−' };
  const tn = trailingNumber(e);
  if (!tn) return p;
  const before = e.slice(0, e.length - tn.length);
  const unary =
    before.endsWith('−') &&
    (before.length === 1 || isOp(before[before.length - 2]) || before[before.length - 2] === '(');
  if (unary) return { ...p, expr: before.slice(0, -1) + tn };
  if (before.endsWith('+')) return { ...p, expr: before.slice(0, -1) + '−' + tn };
  if (before.endsWith('−')) return { ...p, expr: before.slice(0, -1) + '+' + tn };
  return { ...p, expr: before + '−' + tn };
};

/** Zwraca nowy stan albo null przy błędzie (np. dzielenie przez zero, niepełne wyrażenie). */
export const inEquals = (p: CalcState): CalcState | null | 'noop' => {
  if (p.done || p.expr === '') return 'noop';
  const v = evaluate(previewExpr(p.expr));
  if (v === null) return null;
  const r = numToExpr(v);
  return {
    ...p,
    done: true,
    result: r,
    history: [r, ...p.history.filter((h, i) => !(i === 0 && h === r))].slice(0, 3),
  };
};

/** Wstawia wynik z historii do bieżącego wyrażenia. */
export const inInsert = (p: CalcState, val: string): CalcState => {
  if (p.done) return { ...p, expr: val, done: false };
  const e = p.expr;
  if (e === '' || isOp(e[e.length - 1]) || e.endsWith('(')) return { ...p, expr: e + val };
  const tn = trailingNumber(e);
  if (tn) return { ...p, expr: e.slice(0, e.length - tn.length) + val };
  return { ...p, expr: e + '×' + val };
};
