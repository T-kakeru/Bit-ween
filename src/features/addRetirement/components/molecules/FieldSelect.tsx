import type { BaseFieldProps } from "./FieldShell";
import { FieldShell } from "./FieldShell";

type FieldSelectProps = BaseFieldProps & {
  value: string;
  options: string[];
  onChange: (v: string) => void;
};

export const FieldSelect = ({ label, value, options, onChange, helper, required }: FieldSelectProps) => {
  return (
    <FieldShell label={label} helper={helper} required={required}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
      >
        <option value="">選択してください</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldShell>
  );
};
