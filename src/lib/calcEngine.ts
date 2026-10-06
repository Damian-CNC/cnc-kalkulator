/**
 * Silnik zwykłego kalkulatora: bezpieczny parser wyrażeń (bez eval).
 * Operatory: + − × ÷, nawiasy, procent (jak w iPhone: 200 + 10% = 220, 200 × 10% = 20).
 */

export const OPS = ['+', '−', '×', '÷'] as const;
export const isOp = (c: string) => c === '+' || c === '−' || c === '×' || c === '÷';

type Val = { v: number; pct: boolean };

class Parser {
  private i = 0;
  constructor(private s: string) {}

  parse(): number {
    const r = this.expr();
    if (this.i < this.s.length) throw new Error('syntax');
    return r.v;
  }

  private peek() {
    return this.s[this.i];
  }

  private expr(): Val {
    let left = this.term();
    while (this.peek() === '+' || this.peek() === '−') {
      const op = this.s[this.i++];
      const right = this.term();
      // a ± b% oznacza a ± (a · b/100)
      const rv = right.pct ? left.v * right.v : right.v;
      left = { v: op === '+' ? left.v + rv : left.v - rv, pct: false };
    }
    return left;
  }

  private term(): Val {
    let left = this.unary();
    while (this.peek() === '×' || this.peek() === '÷') {
      const op = this.s[this.i++];
      const right = this.unary();
      if (op === '÷' && right.v === 0) throw new Error('div0');
      left = { v: op === '×' ? left.v * right.v : left.v / right.v, pct: false };
    }
    return left;
  }

  private unary(): Val {
    if (this.peek() === '−') {
      this.i++;
      const r = this.unary();
      return { v: -r.v, pct: r.pct };
    }
    if (this.peek() === '+') {
      this.i++;
      return this.unary();
    }
    return this.postfix();
  }

  private postfix(): Val {
    let r = this.primary();
    while (this.peek() === '%') {
      this.i++;
      r = { v: r.v / 100, pct: true };
    }
    return r;
  }

  private primary(): Val {
    const c = this.peek();
    if (c === '(') {
      this.i++;
      const r = this.expr();
      if (this.peek() !== ')') throw new Error('paren');
      this.i++;
      return { v: r.v, pct: false };
    }
    const m = /^(\d+\.?\d*|\.\d+)/.exec(this.s.slice(this.i));
    if (!m) throw new Error('syntax');
    this.i += m[0].length;
    return { v: parseFloat(m[0]), pct: false };
  }
}

/** Zaokrągla do 12 cyfr znaczących, żeby 0.1+0.2 dawało 0.3. */
export const clean = (v: number): number => (Number.isFinite(v) ? parseFloat(v.toPrecision(12)) : v);

export const evaluate = (expr: string): number | null => {
  try {
    const v = clean(new Parser(expr).parse());
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
};

/** Wyrażenie do podglądu: bez końcowych operatorów i z domkniętymi nawiasami. */
export const previewExpr = (expr: string): string => {
  let e = expr;
  while (e.length && (isOp(e[e.length - 1]) || e[e.length - 1] === '(' || e[e.length - 1] === '.')) {
    e = e.slice(0, -1);
  }
  const open = (e.match(/\(/g) || []).length - (e.match(/\)/g) || []).length;
  return e + ')'.repeat(Math.max(0, open));
};

export const openParens = (expr: string): number =>
  (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;

/** Zapis liczby do wstawienia do wyrażenia (kropka dziesiętna, bez notacji wykładniczej). */
export const numToExpr = (v: number): string => {
  const c = clean(v);
  let s = String(c);
  if (/e/i.test(s)) s = c.toFixed(10).replace(/\.?0+$/, '');
  return s.replace('-', '−');
};

/** Zapis do wyświetlenia: spacje co 3 cyfry w części całkowitej, wybrany separator dziesiętny. */
export const formatNumber = (v: number, dec: string): string => {
  if (!Number.isFinite(v)) return 'Error';
  const c = clean(v);
  let s = String(Math.abs(c));
  if (/e/i.test(s)) {
    s = Math.abs(c).toExponential(6).replace(/\.?0+e/, 'e');
    return (c < 0 ? '−' : '') + s.replace('.', dec);
  }
  const [int, frac] = s.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  return (c < 0 ? '−' : '') + grouped + (frac ? dec + frac : '');
};
