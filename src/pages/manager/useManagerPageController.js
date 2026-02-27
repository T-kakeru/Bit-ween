import { useCallback, useState } from "react";

const DATE_KEYS = new Set(["生年月日", "入社日", "退職日"]);

const toSlashDate = (value) => {
  if (!value) return "";
  return String(value).replaceAll("-", "/");
};

const isBlankCell = (value) => {
  if (value == null) return true;
  const text = String(value).trim();
  if (!text) return true;
  if (text === "-") return true;
  return false;
};

const buildIsActiveByRetireDate = (input) => {
  // 退職日は「空なら在籍、入っていれば退職」
  const retireDate = input?.["退職日"];
  return isBlankCell(retireDate);
};

const buildNewRowFromInput = ({ columns, rows, input, normalizeCell }) => {
  const maxId = (rows ?? []).reduce((acc, row) => {
    const num = Number(row?.id ?? 0);
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);

  const base = { id: maxId + 1, ...(input ?? {}) };
  if (typeof base.is_active !== "boolean") {
    base.is_active = buildIsActiveByRetireDate(input);
  }
  for (const col of columns ?? []) {
    let value = input?.[col.key] ?? "";
    if (DATE_KEYS.has(col.key)) {
      value = toSlashDate(value);
    }
    base[col.key] = normalizeCell(value);
  }

  return base;
};

/**
 * ManagerPage の「画面切替 + 新規追加保存」のロジックをまとめた controller。
 */
const useManagerPageController = ({ columns, rows, setRows, normalizeCell }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const openAdd = useCallback(() => setIsAddOpen(true), []);
  const closeAdd = useCallback(() => setIsAddOpen(false), []);

  const buildNewRow = useCallback(
    (input) => buildNewRowFromInput({ columns, rows, input, normalizeCell }),
    [columns, rows, normalizeCell]
  );

  const handleSave = useCallback(
    (input) => {
      const newRow = buildNewRow(input);
      setRows((prev) => [...prev, newRow]);
    },
    [buildNewRow, setRows]
  );

  return {
    isAddOpen,
    openAdd,
    closeAdd,
    buildNewRow,
    handleSave,
  };
};

export default useManagerPageController;
