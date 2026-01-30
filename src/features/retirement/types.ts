// できるだけシンプルに（基本は string / any）
// ※「行/列（ManagerRow / ManagerColumn）」だけは残して使えるようにしています。

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

// 以降は「とにかく分かりやすさ優先」で any に寄せる
export type ManagerMetrics = any;
export type SortState = any;
export type ManagerFilters = any;

export type ManagerFilterGroupKey = string;
export type ManagerFilterOptionKey = string;
export type ManagerDetailKey = string;

export type EmployeeRaw = any;
