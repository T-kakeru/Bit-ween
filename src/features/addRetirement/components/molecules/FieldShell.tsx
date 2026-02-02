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
    <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start sm:gap-x-6 sm:gap-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:pt-2 sm:text-sm">
        <span className="shrink-0">{label}</span>
        {required ? <span className="text-[11px] font-semibold text-rose-600">必須</span> : null}
      </div>
      <div className="min-w-0">{children}</div>
      {helper ? <p className="text-[11px] text-slate-500 sm:col-start-2">{helper}</p> : null}
    </div>
  );
};

export type { BaseFieldProps };
