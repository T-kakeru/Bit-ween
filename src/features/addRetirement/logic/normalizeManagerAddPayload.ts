import type { ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import { normalizeManagerAddValues, type ManagerAddFormValues } from "@/features/addRetirement/logic/validation/managerAdd";

export const normalizeManagerAddPayload = (
  input: ManagerRowInput,
  values: ManagerAddFormValues,
): ManagerRowInput => {
  const normalizedValues = normalizeManagerAddValues(values);
  return {
    ...input,
    "名前": normalizedValues.name,
    "性別": normalizedValues.gender as ManagerRowInput["性別"],
  };
};
