export const mergeEditedRows = ({ prevRows, draftRows, columns, normalizeCell }) => {
  const draftMap = new Map((draftRows ?? []).map((row) => [String(row.id), row]));

  return (prevRows ?? []).map((row) => {
    const updated = draftMap.get(String(row.id));
    if (!updated) return row;

    const normalized = { ...row, ...updated, id: row.id };
    for (const col of columns ?? []) {
      normalized[col.key] = normalizeCell(updated?.[col.key]);
    }
    return normalized;
  });
};
