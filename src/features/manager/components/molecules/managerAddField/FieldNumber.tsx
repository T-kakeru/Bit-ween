import type { BaseFieldProps } from "./FieldShell";
import { FieldShell } from "./FieldShell";

type FieldNumberProps = BaseFieldProps & {
  value: number | "";
  onChange: (v: number | "") => void;
};

export const FieldNumber = ({ label, value, onChange, helper, required, placeholder }: FieldNumberProps) => {
  return (
    <FieldShell label={label} helper={helper} required={required}>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange("");
          const num = Number(raw);
          onChange(Number.isFinite(num) ? num : "");
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
      />
    </FieldShell>
  );
};
