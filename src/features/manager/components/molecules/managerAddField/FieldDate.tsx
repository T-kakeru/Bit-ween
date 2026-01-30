import type { BaseFieldProps } from "./FieldShell";
import { FieldShell } from "./FieldShell";

type FieldDateProps = BaseFieldProps & {
  value: string;
  onChange: (v: string) => void;
};

export const FieldDate = ({ label, value, onChange, helper, required }: FieldDateProps) => {
  return (
    <FieldShell label={label} helper={helper} required={required}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
      />
    </FieldShell>
  );
};
