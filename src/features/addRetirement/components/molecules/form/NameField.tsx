import type { UseFormRegisterReturn } from "react-hook-form";
import type { BaseFieldProps } from "../FieldShell";
import { FieldShell } from "../FieldShell";

type NameFieldProps = BaseFieldProps & {
  register: UseFormRegisterReturn;
  errorMessage?: string;
};

export const NameField = ({
  label,
  helper,
  required,
  placeholder,
  register,
  errorMessage,
}: NameFieldProps) => {
  return (
    <FieldShell label={label} helper={helper} required={required}>
      <div className="space-y-1">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          {...register}
        />
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    </FieldShell>
  );
};
