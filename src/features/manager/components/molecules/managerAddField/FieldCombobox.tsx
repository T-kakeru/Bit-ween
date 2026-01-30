import { useId, useState } from "react";
import type { BaseFieldProps } from "./FieldShell";
import { FieldShell } from "./FieldShell";
import ConfirmAddOptionModal from "./ConfirmAddOptionModal";

type FieldComboboxProps = BaseFieldProps & {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  onAddOption?: (v: string) => void;
  addLabel?: string;
};

export const FieldCombobox = ({
  label,
  value,
  options,
  onChange,
  onAddOption,
  addLabel = "追加",
  helper,
  required,
  placeholder,
}: FieldComboboxProps) => {
  const listId = useId();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState("");
  const trimmed = value.trim();
  const canAdd = Boolean(onAddOption && trimmed && !options.includes(trimmed));

  const openConfirm = () => {
    if (!canAdd) return;
    setPendingValue(trimmed);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
    setPendingValue("");
  };

  const confirmAdd = () => {
    if (onAddOption && pendingValue) onAddOption(pendingValue);
    closeConfirm();
  };

  return (
    <FieldShell label={label} helper={helper} required={required}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
        />
        {onAddOption ? (
          <button
            type="button"
            onClick={openConfirm}
            disabled={!canAdd}
            className={
              "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition " +
              (canAdd
                ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400")
            }
          >
            {addLabel}
          </button>
        ) : null}
      </div>
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      <ConfirmAddOptionModal
        isOpen={isConfirmOpen}
        label={label}
        value={pendingValue}
        onCancel={closeConfirm}
        onConfirm={confirmAdd}
      />
    </FieldShell>
  );
};
