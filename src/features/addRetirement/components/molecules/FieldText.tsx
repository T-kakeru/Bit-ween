import type { BaseFieldProps } from "./FieldShell";
import { FieldShell } from "./FieldShell";

type FieldTextProps = BaseFieldProps & {
  value: string;
  onChange: (v: string) => void;
  errorMessage?: string;
};

export const FieldText = ({ label, value, onChange, helper, required, placeholder, errorMessage }: FieldTextProps) => {
  return (
    <FieldShell label={label} helper={helper} required={required}>
      <div className="space-y-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
        />
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    </FieldShell>
  );
};
