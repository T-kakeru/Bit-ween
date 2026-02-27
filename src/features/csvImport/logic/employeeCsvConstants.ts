import type { EmployeeCsvField } from "../types";
import {
  addCatalogOption,
  fetchClientNames,
  fetchDepartmentNames,
  fetchWorkStatusNames,
} from "@/services/masterData/masterDataService";

export const EMPLOYEE_CSV_FIELD_LABELS: Record<EmployeeCsvField, string> = {
  name: "氏名",
  gender: "性別",
  birthDate: "生年月日",
  employeeId: "社員ID",
  department: "部署",
  joinDate: "入社日",
  employmentStatus: "在籍状態",
  workStatus: "稼働状態",
  workLocation: "稼働先",
  retirementDate: "退職日",
  retirementReason: "退職理由",
  remark: "備考",
};

export type EmployeeCsvHeaderSpec = {
  field: EmployeeCsvField;
  label: string;
  required: boolean;
};

const toEmployeeCsvHeaderRequiredLabel = (label: string) => `${label}（必須）`;

// この一覧にあるヘッダー名のみ許可（別名・揺れは許可しない）
export const EMPLOYEE_CSV_HEADER_SPECS: EmployeeCsvHeaderSpec[] = [
  { field: "name", label: EMPLOYEE_CSV_FIELD_LABELS.name, required: true },
  { field: "gender", label: EMPLOYEE_CSV_FIELD_LABELS.gender, required: true },
  { field: "birthDate", label: EMPLOYEE_CSV_FIELD_LABELS.birthDate, required: true },
  { field: "employeeId", label: EMPLOYEE_CSV_FIELD_LABELS.employeeId, required: false },
  { field: "department", label: EMPLOYEE_CSV_FIELD_LABELS.department, required: false },
  { field: "joinDate", label: EMPLOYEE_CSV_FIELD_LABELS.joinDate, required: true },
  // 「在籍/退職」の入力がある場合は、退職情報との整合性を検証する
  { field: "employmentStatus", label: EMPLOYEE_CSV_FIELD_LABELS.employmentStatus, required: false },
  { field: "workStatus", label: EMPLOYEE_CSV_FIELD_LABELS.workStatus, required: true },
  { field: "workLocation", label: EMPLOYEE_CSV_FIELD_LABELS.workLocation, required: false },
  // 退職日/退職理由は「退職者のみ必須」。CSVでは列は用意するが、入力は条件付き。
  { field: "retirementDate", label: EMPLOYEE_CSV_FIELD_LABELS.retirementDate, required: false },
  { field: "retirementReason", label: EMPLOYEE_CSV_FIELD_LABELS.retirementReason, required: false },
  { field: "remark", label: EMPLOYEE_CSV_FIELD_LABELS.remark, required: false },
];

export const toEmployeeCsvHeaderDisplayLabel = (spec: EmployeeCsvHeaderSpec) =>
  spec.required ? `${spec.label}（必須）` : spec.label;

export const EMPLOYEE_CSV_REQUIRED_FIELDS: EmployeeCsvField[] = EMPLOYEE_CSV_HEADER_SPECS.filter((x) => x.required).map(
  (x) => x.field
);

export const EMPLOYEE_CSV_HEADER_MAP: Record<string, EmployeeCsvField> = Object.fromEntries(
  EMPLOYEE_CSV_HEADER_SPECS.flatMap((x) => [
    [x.label, x.field],
    // 過去に「（必須）」付きで運用されていたCSVとの互換性のため、全項目で許可する
    [toEmployeeCsvHeaderRequiredLabel(x.label), x.field],
    [toEmployeeCsvHeaderDisplayLabel(x), x.field],
  ])
) as Record<string, EmployeeCsvField>;

const departmentMasterSet = new Set<string>();
const clientMasterSet = new Set<string>();
const workStatusMasterSet = new Set<string>();

let initPromise: Promise<void> | null = null;

const normalizeValue = (value: unknown) => String(value ?? "").trim();

const overwriteSet = (target: Set<string>, values: string[]) => {
  target.clear();
  for (const v of values) {
    const trimmed = normalizeValue(v);
    if (trimmed) target.add(trimmed);
  }
};

export const initializeEmployeeCsvMasters = async () => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const [departments, clients, workStatuses] = await Promise.all([
      fetchDepartmentNames(),
      fetchClientNames(),
      fetchWorkStatusNames(),
    ]);
    overwriteSet(departmentMasterSet, Array.isArray(departments) ? departments : []);
    overwriteSet(clientMasterSet, Array.isArray(clients) ? clients : []);
    overwriteSet(workStatusMasterSet, Array.isArray(workStatuses) ? workStatuses : []);
  })();

  return initPromise;
};

export const refreshEmployeeCsvMasters = async () => {
  initPromise = null;
  await initializeEmployeeCsvMasters();
};

export const hasDepartmentMaster = (value: string) => departmentMasterSet.has(normalizeValue(value));
export const addDepartmentMaster = async (value: string) => {
  const trimmed = normalizeValue(value);
  if (!trimmed) return;
  await addCatalogOption({ keyName: "departments", value: trimmed });
  await refreshEmployeeCsvMasters();
};
export const getDepartmentMasterList = () => Array.from(departmentMasterSet);

export const hasClientMaster = (value: string) => clientMasterSet.has(normalizeValue(value));
export const addClientMaster = async (value: string) => {
  const trimmed = normalizeValue(value);
  if (!trimmed) return;
  await addCatalogOption({ keyName: "clients", value: trimmed });
  await refreshEmployeeCsvMasters();
};
export const getClientMasterList = () => Array.from(clientMasterSet);

export const hasWorkStatusMaster = (value: string) => workStatusMasterSet.has(normalizeValue(value));
export const getWorkStatusMasterList = () => Array.from(workStatusMasterSet);

export const GENDER_MASTER = ["男性", "女性", "その他"];

export const CSV_HEADER_HINTS = [
  ...EMPLOYEE_CSV_HEADER_SPECS.map((x) => x.label),
];
