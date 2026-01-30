import { useId } from "react";
import type { BaseFieldProps } from "./FieldShell";
import { FieldShell } from "./FieldShell";

type FieldChipGroupProps = BaseFieldProps & {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
};

export const FieldChipGroup = ({
  label,
  value,
  options,
  onChange,
  helper,
  required,
  allowEmpty = true,
  emptyLabel = "未選択",
}: FieldChipGroupProps) => {
  const groupName = useId();
  const items = allowEmpty
    ? [{ label: emptyLabel, value: "" }, ...options.map((opt) => ({ label: opt, value: opt }))]
    : options.map((opt) => ({ label: opt, value: opt }));

  return (
    <FieldShell label={label} helper={helper} required={required}>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const checked = value === item.value;
          return (
            <label
              key={`${groupName}-${item.label}`}
              className={
                "inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
                (checked
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
              }
            >
              <input
                type="radio"
                name={groupName}
                value={item.value}
                checked={checked}
                onChange={() => onChange(item.value)}
                className="sr-only"
              />
              {item.label}
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
};
