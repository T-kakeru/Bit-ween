import type { ManagerAddFormValues } from "./schema";

export const normalizeManagerAddValues = (values: ManagerAddFormValues): ManagerAddFormValues => {
  return {
    ...values,
    isActive: Boolean((values as any).isActive),
    employeeId: String(values.employeeId ?? "").trim(),
    department: String(values.department ?? "").trim(),
    name: String(values.name ?? "").trim(),
    gender: String(values.gender ?? "").trim(),
    birthDate: String(values.birthDate ?? "").trim(),
    joinDate: String(values.joinDate ?? "").trim(),
    retireDate: String(values.retireDate ?? "").trim(),
    retireReason: String(values.retireReason ?? "").trim(),
    remark: String((values as any).remark ?? "").trim(),
    workStatus: String(values.workStatus ?? "").trim(),
    client: String(values.client ?? "").trim(),
  };
};
