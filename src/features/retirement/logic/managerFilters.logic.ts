import { parseSlashDateToMs } from "@/features/retirement/logic/dateParsers";
import type { ManagerRow } from "@/features/retirement/types";

export const DEFAULT_MANAGER_FILTERS: any = {
  ageBands: {
    under20: false,
    twenties: false,
    thirties: false,
    forties: false,
    over50: false,
  },
  tenureBands: {
    under6: false,
    between6And36: false,
    over36: false,
  },
  statuses: {
    waiting: false,
    dev: false,
    dispatch: false,
  },
  genders: {
    male: false,
    female: false,
  },
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
    (bands.twenties && age >= 20 && age < 30) ||
    (bands.thirties && age >= 30 && age < 40) ||
    (bands.forties && age >= 40 && age < 50) ||
    (bands.over50 && age >= 50)
  );
};

const matchTenureBand = (months: any, bands: any): boolean => {
  if (!isAnySelected(bands)) return true;
  if (months == null) return false;
  return (
    (bands.under6 && months < 6) ||
    (bands.between6And36 && months >= 6 && months <= 36) ||
    (bands.over36 && months > 36)
  );
};

const matchMultiSelect = (value: any, group: any, mapping: Record<string, string>): boolean => {
  if (!isAnySelected(group)) return true;
  if (!value) return false;
  const keys = Object.keys(group).filter((key) => (group as Record<string, boolean>)[key]);
  return keys.some((key) => mapping[key] === value);
};

export const applyManagerFilters = (
  rows: ManagerRow[] | null | undefined,
  filters: any
): ManagerRow[] => {
  const source = rows ?? [];
  return source.filter((row) => {
    const age = toNumber(row?.["年齢"]);
    const tenure = toNumber(row?.["在籍月数"]);
    const status = row?.["ステータス"] as string | undefined;
    const gender = row?.["性別"] as string | undefined;

    if (!matchAgeBand(age, filters.ageBands)) return false;
    if (!matchTenureBand(tenure, filters.tenureBands)) return false;

    if (
      !matchMultiSelect(status, filters.statuses, {
        waiting: "待機",
        dev: "開発",
        dispatch: "派遣",
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

    const retireDate = parseSlashDateToMs(row?.["退職日"]);
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
