import type { ManagerColumn } from "@/features/retirement/types";

export const MANAGER_EMPLOYEE_COLUMNS: ManagerColumn[] = [
  { key: "退職月", label: "退職月", type: "string" },
  { key: "名前", label: "名前", type: "string" },
  { key: "入社日", label: "入社日", type: "date" },
  { key: "在籍状態", label: "在籍状態", type: "string" },
  { key: "退職日", label: "退職日", type: "date" },
  { key: "在籍月数", label: "在籍月数", type: "number" },
  { key: "ステータス", label: "稼働状態", type: "string" },
  { key: "退職理由", label: "退職理由", type: "string" },
  { key: "当時のクライアント", label: "当時の稼働先", type: "string" },
  { key: "性別", label: "性別", type: "string" },
  { key: "生年月日", label: "生年月日", type: "date" },
  { key: "年齢", label: "年齢", type: "number" },
  { key: "学歴point", label: "学歴point", type: "number" },
  { key: "経歴point", label: "経歴point", type: "number" },
];
