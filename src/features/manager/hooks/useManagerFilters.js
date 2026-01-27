import { useCallback, useMemo, useState } from "react";

const DEFAULT_FILTERS = {
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

const toNumber = (value) => {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const parseSlashDate = (value) => {
  const match = String(value).match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).getTime();
};

const isAnySelected = (group) => Object.values(group).some(Boolean);

const matchAgeBand = (age, bands) => {
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

const matchTenureBand = (months, bands) => {
  if (!isAnySelected(bands)) return true;
  if (months == null) return false;
  return (
    (bands.under6 && months < 6) ||
    (bands.between6And36 && months >= 6 && months <= 36) ||
    (bands.over36 && months > 36)
  );
};

const matchMultiSelect = (value, group, mapping) => {
  if (!isAnySelected(group)) return true;
  if (!value) return false;
  const keys = Object.keys(group).filter((key) => group[key]);
  return keys.some((key) => mapping[key] === value);
};

const useManagerFilters = (rows) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const toggleGroup = useCallback((groupKey, optionKey) => {
    setFilters((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        [optionKey]: !prev[groupKey][optionKey],
      },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const updateDetail = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      detail: {
        ...prev.detail,
        [key]: value,
      },
    }));
  }, []);

  const filteredRows = useMemo(() => {
    const source = rows ?? [];
    return source.filter((row) => {
      const age = toNumber(row?.["年齢"]);
      const tenure = toNumber(row?.["在籍月数"]);
      const status = row?.["ステータス"];
      const gender = row?.["性別"];

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

      const joinDate = parseSlashDate(row?.["入社日"]);
      if (detail.joinFrom) {
        const from = new Date(detail.joinFrom).getTime();
        if (joinDate == null || joinDate < from) return false;
      }
      if (detail.joinTo) {
        const to = new Date(detail.joinTo).getTime();
        if (joinDate == null || joinDate > to) return false;
      }

      const retireDate = parseSlashDate(row?.["退職日"]);
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
  }, [filters, rows]);

  return useMemo(
    () => ({
      filters,
      filteredRows,
      toggleGroup,
      updateDetail,
      resetFilters,
    }),
    [filters, filteredRows, resetFilters, toggleGroup, updateDetail]
  );
};

export default useManagerFilters;
