import type { ManagerAddFormValues } from "./schema";

export const normalizeManagerAddValues = (values: ManagerAddFormValues): ManagerAddFormValues => {
  return {
    ...values,
    name: String(values.name ?? "").trim(),
    gender: String(values.gender ?? "").trim(),
  };
};
