import { forwardRef, InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  computed?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, className = '', computed = false, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground font-medium text-sm flex items-center gap-2">
          {label}
          {computed && (
            <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
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
