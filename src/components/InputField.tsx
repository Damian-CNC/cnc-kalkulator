import { forwardRef, InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground font-medium text-sm">
          {label}
        </label>
        <input
          ref={ref}
          className={`input-field ${className}`}
          {...props}
        />
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
