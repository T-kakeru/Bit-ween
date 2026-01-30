import type { ReactNode } from "react";

type BaseFieldProps = {
  label: string;
  helper?: string;
  required?: boolean;
  placeholder?: string;
};

type FieldShellProps = BaseFieldProps & {
  children: ReactNode;
};

export const FieldShell = ({ label, helper, required, children }: FieldShellProps) => {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        {label}
        {required ? <span className="text-[11px] text-rose-600">必須</span> : null}
      </span>
      <div className="mt-2">{children}</div>
      {helper ? <p className="mt-2 text-[11px] text-slate-500">{helper}</p> : null}
    </label>
  );
};

export type { BaseFieldProps };
