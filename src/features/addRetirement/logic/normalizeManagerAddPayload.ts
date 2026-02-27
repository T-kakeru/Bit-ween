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
  const employmentStatus = String((normalizedValues as any).employmentStatus ?? "").trim();
  const isActive = employmentStatus !== "退職";
  return {
    ...input,
    is_active: isActive,
    "社員ID": normalizedValues.employeeId,
    "部署": normalizedValues.department,
    "名前": normalizedValues.name,
    "在籍状態": (employmentStatus === "退職" ? "退職" : "在籍") as ManagerRowInput["在籍状態"],
    "性別": normalizedValues.gender as ManagerRowInput["性別"],
    "生年月日": normalizedValues.birthDate,
    "入社日": normalizedValues.joinDate,
    "退職日": isActive ? "" : normalizedValues.retireDate,
    "退職理由": isActive ? "" : normalizedValues.retireReason,
    "備考": normalizedValues.remark,
    "ステータス": normalizedValues.workStatus,
    "当時のクライアント": normalizedValues.client,
  };
};
