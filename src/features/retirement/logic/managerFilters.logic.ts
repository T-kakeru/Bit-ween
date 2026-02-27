import { parseSlashDateToMs } from "@/features/retirement/logic/dateParsers";
import type { ManagerRow } from "@/features/retirement/types";
export const STATUS_OPTIONS = ["待機", "稼働", "休職"] as const;
export const DEPARTMENT_OPTIONS = ["人事", "営業", "派遣", "開発"] as const;
export const REASON_OPTIONS = [
  "ITモチベ低下",
  "キャリアアップ",
  "会社不信",
  "同業他社転職",
  "家庭問題",
  "給与不満",
] as const;

export const DEFAULT_MANAGER_FILTERS: any = {
  ageBands: {
    under20: false,
    between20And25: false,
    between25And30: false,
    between30And35: false,
    between35And40: false,
    over40: false,
  },
  tenureBands: {
    under3: false,
    between3And6: false,
    between6And12: false,
    between12And18: false,
    between18And24: false,
    between24And30: false,
    between30And36: false,
    between36And42: false,
    over42: false,
  },
  statuses: {
    waiting: false,
    working: false,
    leave: false,
  },
  genders: {
    male: false,
    female: false,
  },
  departments: {},
  reasons: {},
  clients: {},
  detail: {
    ageMin: "",
    ageMax: "",
    tenureMin: "",
    tenureMax: "",
    gender: "",
    status: "",
    joinFrom: "",
    joinTo: "",
    retireFrom: "",
    retireTo: "",
  },
};

const toNumber = (value: any): any => {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const isAnySelected = (group: any): boolean => Object.values(group ?? {}).some(Boolean);

const matchAgeBand = (age: any, bands: any): boolean => {
  if (!isAnySelected(bands)) return true;
  if (age == null) return false;
  return (
    (bands.under20 && age < 20) ||
    (bands.between20And25 && age >= 20 && age < 25) ||
    (bands.between25And30 && age >= 25 && age < 30) ||
    (bands.between30And35 && age >= 30 && age < 35) ||
    (bands.between35And40 && age >= 35 && age < 40) ||
    (bands.over40 && age >= 40)
  );
};

const matchTenureBand = (months: any, bands: any): boolean => {
  if (!isAnySelected(bands)) return true;
  if (months == null) return false;
  return (
    (bands.under3 && months < 3) ||
    (bands.between3And6 && months >= 3 && months < 6) ||
    (bands.between6And12 && months >= 6 && months < 12) ||
    (bands.between12And18 && months >= 12 && months < 18) ||
    (bands.between18And24 && months >= 18 && months < 24) ||
    (bands.between24And30 && months >= 24 && months < 30) ||
    (bands.between30And36 && months >= 30 && months < 36) ||
    (bands.between36And42 && months >= 36 && months < 42) ||
    (bands.over42 && months >= 42)
  );
};

const matchMultiSelect = (value: any, group: any, mapping: Record<string, string>): boolean => {
  if (!isAnySelected(group)) return true;
  if (!value) return false;
  const keys = Object.keys(group).filter((key) => (group as Record<string, boolean>)[key]);
  return keys.some((key) => mapping[key] === value);
};

const matchMultiSelectByValue = (value: any, group: any): boolean => {
  if (!isAnySelected(group)) return true;
  if (!value) return false;
  const keys = Object.keys(group).filter((key) => (group as Record<string, boolean>)[key]);
  return keys.some((key) => key === value);
};

const normalizeDepartmentValue = (row: ManagerRow): string | undefined => {
  const raw = (row as any)?.["部署"] ?? (row as any)?.["部門"] ?? (row as any)?.department;
  if (raw) return String(raw);
  const status = (row as any)?.["ステータス"];
  if (!status) return undefined;
  const normalized = String(status);
  if (DEPARTMENT_OPTIONS.includes(normalized as (typeof DEPARTMENT_OPTIONS)[number])) return normalized;
  return normalized;
};

const normalizeStatusValue = (value: any): string | undefined => {
  if (!value) return undefined;
  const raw = String(value);
  if (raw === "稼働中") return "稼働";
  if (raw === "休職中") return "休職";
  if (raw === "待機" || raw === "稼働" || raw === "休職") return raw;
  // それ以外は稼働扱い
  return "稼働";
};

const normalizeReasonValue = (value: any): string | undefined => {
  if (!value) return undefined;
  const raw = String(value);
  if (raw.includes("同業他社") || raw.includes("転職")) return "同業他社転職";
  return raw;
};

export const applyManagerFilters = (
  rows: ManagerRow[] | null | undefined,
  filters: any
): ManagerRow[] => {
  const source = rows ?? [];
  return source.filter((row) => {
    const age = toNumber(row?.["年齢"]);
    const tenure = toNumber(row?.["在籍月数"]);
    const status = normalizeStatusValue(row?.["ステータス"]);
    const gender = row?.["性別"] as string | undefined;
    const department = normalizeDepartmentValue(row);
    const reason = normalizeReasonValue(row?.["退職理由"] as string | undefined);
    const client = ((row as any)?.["当時のクライアント"] ?? (row as any)?.["稼働先"] ?? (row as any)?.client) as
      | string
      | undefined;
    const retireDate = parseSlashDateToMs(row?.["退職日"]);

    if (!matchAgeBand(age, filters.ageBands)) return false;
    if (!matchTenureBand(tenure, filters.tenureBands)) return false;

    if (
      !matchMultiSelect(status, filters.statuses, {
        waiting: "待機",
        working: "稼働",
        leave: "休職",
      })
    ) {
      return false;
    }

    if (
      !matchMultiSelect(gender, filters.genders, {
        male: "男性",
        female: "女性",
      })
    ) {
      return false;
    }

    if (!matchMultiSelectByValue(department, filters.departments)) return false;
    if (!matchMultiSelectByValue(reason, filters.reasons)) return false;
    if (!matchMultiSelectByValue(client ? String(client) : undefined, filters.clients)) return false;

    const detail = filters.detail;
    const detailAgeMin = toNumber(detail.ageMin);
    const detailAgeMax = toNumber(detail.ageMax);
    if (detailAgeMin != null && (age == null || age < detailAgeMin)) return false;
    if (detailAgeMax != null && (age == null || age > detailAgeMax)) return false;

    const detailTenureMin = toNumber(detail.tenureMin);
    const detailTenureMax = toNumber(detail.tenureMax);
    if (detailTenureMin != null && (tenure == null || tenure < detailTenureMin)) return false;
    if (detailTenureMax != null && (tenure == null || tenure > detailTenureMax)) return false;

    if (detail.gender && detail.gender !== gender) return false;
    if (detail.status && detail.status !== status) return false;

    const joinDate = parseSlashDateToMs(row?.["入社日"]);
    if (detail.joinFrom) {
      const from = new Date(detail.joinFrom).getTime();
      if (joinDate == null || joinDate < from) return false;
    }
    if (detail.joinTo) {
      const to = new Date(detail.joinTo).getTime();
      if (joinDate == null || joinDate > to) return false;
    }

    if (detail.retireFrom) {
      const from = new Date(detail.retireFrom).getTime();
      if (retireDate == null || retireDate < from) return false;
    }
    if (detail.retireTo) {
      const to = new Date(detail.retireTo).getTime();
      if (retireDate == null || retireDate > to) return false;
    }

    return true;
  });
};
