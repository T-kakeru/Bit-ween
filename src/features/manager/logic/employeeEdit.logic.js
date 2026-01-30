// 社員テーブル編集（純ロジック）

export const NON_EDITABLE_KEYS = new Set(["在籍月数", "id"]);

export const toEditableValue = (value, normalizeCell) => {
  const normalized = normalizeCell?.(value);
  if (normalized == null) return "";
  const str = String(normalized);
  return str === "-" ? "" : str;
};

export const buildRowMapById = (rows) => new Map((rows ?? []).map((row) => [String(row.id), row]));

export const isCellChanged = ({ draftRow, originalRow, column, normalizeCell }) => {
  if (!draftRow || !originalRow || !column) return false;
  if (NON_EDITABLE_KEYS.has(column.key)) return false;
  const fromValue = normalizeCell(originalRow?.[column.key]);
  const toValue = normalizeCell(draftRow?.[column.key]);
  return fromValue !== toValue;
};

export const buildPendingChanges = ({ draftRows, originalRows, columns, normalizeCell }) => {
  const originalMap = buildRowMapById(originalRows);
  const changes = [];

  for (const draft of draftRows ?? []) {
    const original = originalMap.get(String(draft.id));
    if (!original) continue;

    for (const column of columns ?? []) {
      if (NON_EDITABLE_KEYS.has(column.key)) continue;
      const fromValue = normalizeCell(original?.[column.key]);
      const toValue = normalizeCell(draft?.[column.key]);
      if (fromValue !== toValue) {
        changes.push({
          id: draft.id,
          name: original?.["名前"] ?? "社員",
          key: column.key,
          label: column.label,
          from: fromValue,
          to: toValue,
        });
      }
    }
  }

  return changes;
};
