export type DbUserRole = "general" | "admin";

export type DbWorkStatusName = "稼働" | "休職" | "待機";

export type DbRetirementReasonName =
  | "キャリアアップ"
  | "同業他社転職"
  | "家庭問題"
  | "ITモチベ低下"
  | "給与不満"
  | "会社不信";

export type SchemaCatalogKey = "departments" | "clients" | "workStatuses" | "retirementReasons";