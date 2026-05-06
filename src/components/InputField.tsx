import { forwardRef, InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  computed?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, className = '', computed = false, ...props }, ref) => {
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
          className={`input-field ${computed ? 'computed' : ''} ${className}`}
          {...props}
        />
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
