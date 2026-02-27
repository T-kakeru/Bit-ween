const toText = (value) => String(value ?? "").trim();

const toDisplayValue = (value) => {
  const text = toText(value);
  return text ? text : "-";
};

const buildSystemUserName = (systemUser) =>
  toText(systemUser?.display_name || systemUser?.employee_name || systemUser?.email) || "アカウント";

const FIELD_DEFS = [
  { key: "display_name", label: "アカウント名" },
  { key: "email", label: "メールアドレス" },
  { key: "role", label: "権限" },
  { key: "employee_id", label: "社員ID" },
];

export const buildSystemUserPendingChanges = ({ originalRows, editRowsById, targetIds }) => {
  const originalById = new Map((originalRows ?? []).map((row) => [String(row?.id ?? ""), row]));
  const changes = [];

  for (const id of targetIds ?? []) {
    const original = originalById.get(String(id));
    const draft = editRowsById?.[String(id)];
    if (!original || !draft) continue;

    for (const field of FIELD_DEFS) {
      const fromValue = toText(original?.[field.key]);
      const toValue = toText(draft?.[field.key]);
      if (fromValue !== toValue) {
        changes.push({
          id: String(id),
          name: buildSystemUserName(original),
          key: field.key,
          label: field.label,
          from: toDisplayValue(fromValue),
          to: toDisplayValue(toValue),
        });
      }
    }
  }

  return changes;
};
