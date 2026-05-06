import { SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

const SelectField = ({ label, options, className = '', ...props }: SelectFieldProps) => {
  return (
    <div className="flex flex-col">
      <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
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
