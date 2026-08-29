import { forwardRef, InputHTMLAttributes, memo, useCallback } from 'react';
import { DECIMAL_PATTERN, sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  computed?: boolean;
  /** set to false to opt out of the decimal sanitizer (plain text fields) */
  numeric?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      className = '',
      computed = false,
      numeric = true,
      onChange,
      onFocus,
      type,
      inputMode,
      ...props
    },
    ref
  ) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (numeric) {
          const clean = sanitizeDecimal(e.target.value);
          if (clean !== e.target.value) e.target.value = clean;
        }
        onChange?.(e);
      },
      [numeric, onChange]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (numeric) selectOnFocus(e);
        onFocus?.(e);
      },
      [numeric, onFocus]
    );

    return (
      <div className="flex flex-col">
        <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider flex items-center gap-2">
          {label}
          {computed && (
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold normal-case">
              auto
            </span>
          )}
        </label>
        <input
          ref={ref}
          type={numeric ? 'text' : type}
          inputMode={numeric ? inputMode ?? 'decimal' : inputMode}
          pattern={numeric ? DECIMAL_PATTERN : undefined}
          onChange={handleChange}
          onFocus={handleFocus}
          className={`input-field ${computed ? 'computed' : ''} ${className}`}
          {...props}
        />
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default memo(InputField);
