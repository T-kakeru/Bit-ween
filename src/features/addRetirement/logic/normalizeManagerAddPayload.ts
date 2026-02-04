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
    "生年月日": normalizedValues.birthDate,
    "入社日": normalizedValues.joinDate,
    "退職日": normalizedValues.retireDate,
    "ステータス": normalizedValues.status,
    "当時のクライアント": normalizedValues.client,
    "退職理由": normalizedValues.reason,
    "学歴point": normalizedValues.educationPoint as ManagerRowInput["学歴point"],
    "経歴point": normalizedValues.careerPoint as ManagerRowInput["経歴point"],
  };
};
