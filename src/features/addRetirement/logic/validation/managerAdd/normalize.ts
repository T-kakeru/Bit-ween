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
    email: String(values.email ?? "").trim(),
    joinDate: String(values.joinDate ?? "").trim(),
    retireDate: String(values.retireDate ?? "").trim(),
    retireReason: String(values.retireReason ?? "").trim(),
    workStatus: String(values.workStatus ?? "").trim(),
    client: String(values.client ?? "").trim(),
  };
};
