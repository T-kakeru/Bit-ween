import { useCallback, useMemo, useState } from "react";

const parseJapaneseMonth = (value) => {
  const match = String(value).match(/(\d{4})年(\d{1,2})月/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1).getTime();
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

const getSortValue = (row, column) => {
  if (!row || !column) return null;
  const raw = row[column.key];
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value || value === "-") return null;

  if (column.type === "number") {
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  if (column.type === "date") {
    if (column.key === "退職月") {
      return parseJapaneseMonth(value);
    }
    const parsed = parseSlashDate(value);
    return parsed ?? null;
  }

  return value.toLowerCase();
};

const compareValues = (a, b, column) => {
  const aVal = getSortValue(a, column);
  const bVal = getSortValue(b, column);

  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return 1;
  if (bVal == null) return -1;

  if (column.type === "string") {
    return String(aVal).localeCompare(String(bVal), "ja");
  }

  return Number(aVal) - Number(bVal);
};

const useManagerSort = (rows, columns) => {
  const [sort, setSort] = useState({ key: null, direction: null });

  const toggleSort = useCallback((key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  }, []);

  const sortedRows = useMemo(() => {
    if (!sort.key || !sort.direction) return rows;
    const column = (columns ?? []).find((c) => c.key === sort.key);
    if (!column) return rows;

    const direction = sort.direction === "asc" ? 1 : -1;
    return rows.slice().sort((a, b) => compareValues(a, b, column) * direction);
  }, [columns, rows, sort.direction, sort.key]);

  return useMemo(
    () => ({
      sort,
      sortedRows,
      toggleSort,
    }),
    [sort, sortedRows, toggleSort]
  );
};

export default useManagerSort;
