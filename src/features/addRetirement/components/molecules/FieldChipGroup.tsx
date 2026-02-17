import { useId } from "react";
import Button from "@/shared/ui/Button";
import type { BaseFieldProps } from "./FieldShell";
import { FieldShell } from "./FieldShell";

type FieldChipGroupProps = BaseFieldProps & {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
  errorMessage?: string;
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
  errorMessage,
}: FieldChipGroupProps) => {
  const groupName = useId();
  const items = allowEmpty
    ? [{ label: emptyLabel, value: "" }, ...options.map((opt) => ({ label: opt, value: opt }))]
    : options.map((opt) => ({ label: opt, value: opt }));

  return (
    <FieldShell label={label} helper={helper} required={required}>
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
          {items.map((item) => {
            const checked = value === item.value;
            return (
              <Button
                key={`${groupName}-${item.label}`}
                type="button"
                variant="outline"
                size="sm"
                role="radio"
                aria-checked={checked}
                aria-pressed={checked}
                onClick={() => onChange(item.value)}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    </FieldShell>
  );
};
