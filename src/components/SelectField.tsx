import { SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

const SelectField = ({ label, options, className = '', ...props }: SelectFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-muted-foreground font-medium text-sm">
        {label}
      </label>
      <select
        className={`input-field cursor-pointer ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-background text-foreground"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
