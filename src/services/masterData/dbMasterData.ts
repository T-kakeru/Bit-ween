import type { DbRetirementReasonName, DbUserRole, DbWorkStatusName } from "@/services/masterData/dbSchema";

export const DB_WORK_STATUS_NAMES: DbWorkStatusName[] = ["稼働", "休職", "待機"];

export const DB_RETIREMENT_REASON_NAMES: DbRetirementReasonName[] = [
  "キャリアアップ",
  "同業他社転職",
  "家庭問題",
  "ITモチベ低下",
  "給与不満",
  "会社不信",
];

export const DB_USER_ROLES: DbUserRole[] = ["general", "admin"];