import { useCallback } from 'react';

export interface MobileFlowField<K extends string = string> {
  key: K;
  ref: React.RefObject<HTMLInputElement>;
  value: string;
  /** If false, field is omitted from the flow (e.g. unused dimension in current shape) */
  active?: boolean;
  /** If true, field is an auto-computed output and should be skipped */
  computed?: boolean;
}

export interface UseMobileInputFlowOptions<K extends string = string> {
  fields: MobileFlowField<K>[];
  /**
   * Optional minimum count of filled fields to consider the section complete.
   * If not specified, all active non-computed fields must be filled.
   */
  requiredCount?: number;
  /** Callback triggered when all required fields are filled and user presses Done */
  onComplete?: () => void;
}

/**
 * Checks whether a numeric input has a valid positive value entered.
 */
function isPositiveFilled(raw: string | undefined | null): boolean {
  if (raw === undefined || raw === null) return false;
  const s = String(raw).trim().replace(',', '.');
  if (s === '' || s === '-' || s === '.') return false;
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0;
}

/**
 * Hook for managing mobile virtual keyboard flow (enterkeyhint="next" / "done"),
 * automatically jumping to the next unfilled field and hiding the keyboard once
 * all required inputs are completed.
 */
export function useMobileInputFlow<K extends string = string>({
  fields,
  requiredCount,
  onComplete,
}: UseMobileInputFlowOptions<K>) {
  // Active fields that the user actually enters (non-computed, active in current mode)
  const activeFields = fields.filter((f) => (f.active ?? true) && !f.computed);

  const targetCount = requiredCount ?? activeFields.length;

  const countFilled = useCallback(
    () => activeFields.filter((f) => isPositiveFilled(f.value)).length,
    [activeFields]
  );

  const getNextUnfilled = useCallback(
    (currentKey: K): MobileFlowField<K> | null => {
      const currentIndex = activeFields.findIndex((f) => f.key === currentKey);
      if (currentIndex === -1) return null;

      // 1. Search forward from current index
      for (let i = currentIndex + 1; i < activeFields.length; i++) {
        if (!isPositiveFilled(activeFields[i].value)) {
          return activeFields[i];
        }
      }
      // 2. Wrap around from beginning up to current index
      for (let i = 0; i < currentIndex; i++) {
        if (!isPositiveFilled(activeFields[i].value)) {
          return activeFields[i];
        }
      }
      return null;
    },
    [activeFields]
  );

  const getFieldProps = useCallback(
    (key: K) => {
      const currentField = activeFields.find((f) => f.key === key);
      const isCurrentFilled = isPositiveFilled(currentField?.value);

      // Total filled count assuming the current field will be filled
      const filledCount = countFilled() + (isCurrentFilled ? 0 : 1);
      const isComplete = filledCount >= targetCount;
      const nextUnfilled = getNextUnfilled(key);

      // If completing this field satisfies all required inputs (or no more unfilled fields), show 'done'
      const enterKeyHint: 'next' | 'done' = isComplete || !nextUnfilled ? 'done' : 'next';

      const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();

          const target = getNextUnfilled(key);
          const nowFilledCount = countFilled();

          if (nowFilledCount >= targetCount || !target) {
            // All required fields filled -> dismiss mobile keyboard
            e.currentTarget.blur();
            onComplete?.();
          } else if (target.ref.current) {
            // Jump to next unfilled field and scroll it comfortably into view
            target.ref.current.focus();
            target.ref.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          } else {
            e.currentTarget.blur();
            onComplete?.();
          }
        }
      };

      return {
        enterKeyHint,
        onKeyDown,
      };
    },
    [activeFields, targetCount, onComplete, countFilled, getNextUnfilled]
  );

  return {
    getFieldProps,
  };
}

export default useMobileInputFlow;
