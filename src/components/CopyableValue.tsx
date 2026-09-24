import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import useHaptics from '@/hooks/useHaptics';

interface CopyableValueProps {
  /** Tekst kopiowany do schowka po dotknięciu. */
  value: string | number | null | undefined;
  children: ReactNode;
}

const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* spróbuj metody zapasowej */
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
};

/** Wartość, którą można skopiować dotknięciem (z krótkim potwierdzeniem i wibracją). */
const CopyableValue = ({ value, children }: CopyableValueProps) => {
  const { triggerSuccess } = useHaptics();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (value === null || value === undefined || value === '') return <>{children}</>;

  const handleClick = async () => {
    const ok = await copyText(String(value));
    if (!ok) return;
    triggerSuccess();
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={String(value)}
      className="relative inline-flex items-baseline rounded-md transition-colors touch-manipulation active:bg-white/10"
    >
      {children}
      {copied && (
        <Check
          aria-hidden
          className="absolute -right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400"
        />
      )}
    </button>
  );
};

export default CopyableValue;
