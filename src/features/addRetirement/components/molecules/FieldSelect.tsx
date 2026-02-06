import type { BaseFieldProps } from "./FieldShell";
import { FieldShell } from "./FieldShell";

type FieldSelectProps = BaseFieldProps & {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  errorMessage?: string;
  disabled?: boolean;
};

export const FieldSelect = ({
  label,
  value,
  options,
  onChange,
  helper,
  required,
  errorMessage,
  disabled,
}: FieldSelectProps) => {
  return (
    <FieldShell label={label} helper={helper} required={required}>
      <div className="space-y-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={
            "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none " +
            (disabled ? "cursor-not-allowed bg-slate-50 text-slate-400" : "")
          }
        >
          <option value="">選択してください</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    </FieldShell>
  );
};
