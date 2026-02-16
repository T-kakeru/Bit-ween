import departments from "@/shared/data/mock/departments.json";
import clients from "@/shared/data/mock/clients.json";
import workStatuses from "@/shared/data/mock/workStatuses.json";
import type { EmployeeCsvField } from "../types";
import { addCatalogNameIfMissing, loadCatalogItems } from "@/shared/logic/catalogStorage";

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

// この一覧にあるヘッダー名のみ許可（別名・揺れは許可しない）
export const EMPLOYEE_CSV_HEADER_SPECS: EmployeeCsvHeaderSpec[] = [
  { field: "name", label: EMPLOYEE_CSV_FIELD_LABELS.name, required: true },
  { field: "gender", label: EMPLOYEE_CSV_FIELD_LABELS.gender, required: true },
  { field: "birthDate", label: EMPLOYEE_CSV_FIELD_LABELS.birthDate, required: true },
  { field: "employeeId", label: EMPLOYEE_CSV_FIELD_LABELS.employeeId, required: false },
  { field: "department", label: EMPLOYEE_CSV_FIELD_LABELS.department, required: false },
  { field: "joinDate", label: EMPLOYEE_CSV_FIELD_LABELS.joinDate, required: true },
  { field: "employmentStatus", label: EMPLOYEE_CSV_FIELD_LABELS.employmentStatus, required: false },
  { field: "workStatus", label: EMPLOYEE_CSV_FIELD_LABELS.workStatus, required: true },
  { field: "workLocation", label: EMPLOYEE_CSV_FIELD_LABELS.workLocation, required: false },
  { field: "retirementDate", label: EMPLOYEE_CSV_FIELD_LABELS.retirementDate, required: true },
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
    [toEmployeeCsvHeaderDisplayLabel(x), x.field],
  ])
) as Record<string, EmployeeCsvField>;

const buildUniqueList = (values: (string | null | undefined)[]) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

const toCatalogItems = (list: any[]): Array<{ id: string; name: string }> =>
  (Array.isArray(list) ? list : [])
    .map((x) => ({ id: String(x?.id ?? "").trim(), name: String(x?.name ?? "").trim() }))
    .filter((x) => x.id && x.name);

const departmentCatalogFallback = toCatalogItems(departments as any);
const clientCatalogFallback = toCatalogItems(clients as any);
const workStatusCatalogFallback = toCatalogItems(workStatuses as any);

const departmentCatalog = loadCatalogItems("departments", departmentCatalogFallback);
const clientCatalog = loadCatalogItems("clients", clientCatalogFallback);
const workStatusCatalog = loadCatalogItems("workStatuses", workStatusCatalogFallback);

const departmentMasterSet = new Set(
  buildUniqueList([
    ...departmentCatalog.map((dept) => dept.name),
    ...departmentCatalog.map((dept) => dept.id),
  ])
);

const clientMasterSet = new Set(
  buildUniqueList([
    ...clientCatalog.map((client) => client.name),
    ...clientCatalog.map((client) => client.id),
  ])
);

const workStatusMasterSet = new Set(buildUniqueList(workStatusCatalog.map((x) => x.name)));

export const hasDepartmentMaster = (value: string) => departmentMasterSet.has(value);
export const addDepartmentMaster = (value: string) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return;
  departmentMasterSet.add(trimmed);
  addCatalogNameIfMissing({ keyName: "departments", name: trimmed, fallbackItems: departmentCatalogFallback, idPrefix: "dept-auto-" });
};
export const getDepartmentMasterList = () => Array.from(departmentMasterSet);

export const hasClientMaster = (value: string) => clientMasterSet.has(value);
export const addClientMaster = (value: string) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return;
  clientMasterSet.add(trimmed);
  addCatalogNameIfMissing({ keyName: "clients", name: trimmed, fallbackItems: clientCatalogFallback, idPrefix: "client-auto-" });
};
export const getClientMasterList = () => Array.from(clientMasterSet);

export const hasWorkStatusMaster = (value: string) => workStatusMasterSet.has(value);
export const addWorkStatusMaster = (value: string) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return;
  workStatusMasterSet.add(trimmed);
  addCatalogNameIfMissing({ keyName: "workStatuses", name: trimmed, fallbackItems: workStatusCatalogFallback, idPrefix: "ws-auto-" });
};
export const getWorkStatusMasterList = () => Array.from(workStatusMasterSet);

export const EMPLOYMENT_STATUS_MASTER = ["在籍中", "退職済"];

export const GENDER_MASTER = ["男性", "女性", "その他"];

export const CSV_HEADER_HINTS = [
  ...EMPLOYEE_CSV_HEADER_SPECS.map((x) => x.label),
];
