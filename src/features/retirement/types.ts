import type { EmployeeRecord } from "@/shared/types/erModels";

export type ManagerColumnType = string;

export type ManagerColumn = {
  key: string;
  label: string;
  type: ManagerColumnType;
};

export type ManagerRow = {
  id?: any;
  [key: string]: any;
};

export type Employee = {
  id: string;
  is_active: boolean;
  "社員ID"?: string;
  "名前"?: string;
  "性別"?: string;
  "生年月日"?: string;
  "入社日"?: string;
  "退職日"?: string;
  "退職理由"?: string;
  "備考"?: string;
  "部署"?: string;
  "ステータス"?: string;
  "当時のクライアント"?: string;
  er_employee?: Partial<EmployeeRecord>;
  [key: string]: any;
};

// 以降は「とにかく分かりやすさ優先」で any に寄せる
export type ManagerMetrics = any;
export type SortState = any;
export type ManagerFilters = any;

export type ManagerFilterGroupKey = string;
export type ManagerFilterOptionKey = string;
export type ManagerDetailKey = string;

export type EmployeeRaw = any;
