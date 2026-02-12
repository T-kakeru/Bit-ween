import type { ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import { normalizeManagerAddValues, type ManagerAddFormValues } from "@/features/addRetirement/logic/validation/managerAdd";

export type ManagerAddPayload = ManagerRowInput & {
  is_active: boolean;
};

export const normalizeManagerAddPayload = (
  input: ManagerRowInput,
  values: ManagerAddFormValues,
): ManagerAddPayload => {
  const normalizedValues = normalizeManagerAddValues(values);
  return {
    ...input,
    is_active: Boolean(normalizedValues.isActive),
    "社員ID": normalizedValues.employeeId,
    "部署": normalizedValues.department,
    "名前": normalizedValues.name,
    "性別": normalizedValues.gender as ManagerRowInput["性別"],
    "生年月日": normalizedValues.birthDate,
    "メールアドレス": normalizedValues.email,
    "入社日": normalizedValues.joinDate,
    "退職日": normalizedValues.retireDate,
    "退職理由": normalizedValues.retireReason,
    "ステータス": normalizedValues.workStatus,
    "当時のクライアント": normalizedValues.client,
  };
};
