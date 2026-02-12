import departments from "@/shared/data/mock/departments.json";
import clients from "@/shared/data/mock/clients.json";
import workStatuses from "@/shared/data/mock/workStatuses.json";
import type { EmployeeCsvField } from "../types";
import { addCatalogNameIfMissing, loadCatalogItems } from "@/shared/logic/catalogStorage";

export const EMPLOYEE_CSV_FIELD_LABELS: Record<EmployeeCsvField, string> = {
  name: "氏名",
  gender: "性別",
  birthDate: "生年月日",
  email: "メールアドレス",
  employeeId: "社員ID",
  department: "部署",
  joinDate: "入社日",
  employmentStatus: "在籍状態",
  workStatus: "稼働状態",
  workLocation: "稼働先",
  retirementDate: "退職日",
  retirementReason: "退職理由",
};

export const EMPLOYEE_CSV_REQUIRED_FIELDS: EmployeeCsvField[] = [
  "name",
  "gender",
  "joinDate",
  "workStatus",
  "retirementDate",
  "retirementReason",
];

export const EMPLOYEE_CSV_HEADER_ALIASES: Record<string, EmployeeCsvField> = {
  氏名: "name",
  名前: "name",
  性別: "gender",
  生年月日: "birthDate",
  メールアドレス: "email",
  社員ID: "employeeId",
  部署: "department",
  入社日: "joinDate",
  在籍状態: "employmentStatus",
  稼働状態: "workStatus",
  ステータス: "workStatus",
  稼働先: "workLocation",
  当時のクライアント: "workLocation",
  退職日: "retirementDate",
  退職理由: "retirementReason",
};

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
  "氏名",
  "性別",
  "生年月日",
  "メールアドレス",
  "社員ID",
  "部署",
  "入社日",
  "在籍状態",
  "稼働状態",
  "稼働先",
  "退職日",
  "退職理由",
];
