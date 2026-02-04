import type { ManagerAddFormValues } from "./schema";

export const normalizeManagerAddValues = (values: ManagerAddFormValues): ManagerAddFormValues => {
  return {
    ...values,
    name: String(values.name ?? "").trim(),
    gender: String(values.gender ?? "").trim(),
    birthDate: String(values.birthDate ?? "").trim(),
    joinDate: String(values.joinDate ?? "").trim(),
    retireDate: String(values.retireDate ?? "").trim(),
    status: String(values.status ?? "").trim(),
    client: String(values.client ?? "").trim(),
    reason: String(values.reason ?? "").trim(),
    educationPoint: values.educationPoint ?? undefined,
    careerPoint: values.careerPoint ?? undefined,
  };
};
