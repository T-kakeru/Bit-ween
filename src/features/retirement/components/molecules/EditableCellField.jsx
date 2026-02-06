import { NON_EDITABLE_KEYS, toEditableValue } from "@/features/retirement/logic/employeeEdit.logic";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";

// テーブルセルの編集用フィールド（Molecule）
// - 編集不可のセルはテキスト表示
// - 編集モード時は input / select に切り替える
const EditableCellField = ({
  isEditing,
  row,
  column,
  normalizeCell,
  onChange,
  clientOptions,
  onAddClientOption,
  errorMessage,
}) => {
  const key = column.key;
  const displayValue = normalizeCell(row?.[key]);

  // 編集モードでない / 編集不可 はテキスト表示
  if (!isEditing || NON_EDITABLE_KEYS.has(key)) {
    return <span className="manager-edit-text">{displayValue}</span>;
  }

  // セレクト（ステータス / 性別 など）
  if (key === "ステータス") {
    return (
      <div className="space-y-1">
        <Select
          className="manager-edit-select"
          value={toEditableValue(row?.[key], normalizeCell)}
          onChange={(event) => onChange(row.id, key, event.target.value)}
          aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
          error={Boolean(errorMessage)}
        >
          <option value="">未設定</option>
          <option value="開発">開発</option>
          <option value="営業">営業</option>
          <option value="事務">事務</option>
          <option value="派遣">派遣</option>
          <option value="待機">待機</option>
          <option value="その他">その他</option>
        </Select>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    );
  }

  if (key === "性別") {
    return (
      <div className="space-y-1">
        <Select
          className="manager-edit-select"
          value={toEditableValue(row?.[key], normalizeCell)}
          onChange={(event) => onChange(row.id, key, event.target.value)}
          aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
          error={Boolean(errorMessage)}
        >
          <option value="">未設定</option>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
        </Select>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    );
  }

  if (key === "在籍状態") {
    return (
      <div className="space-y-1">
        <Select
          className="manager-edit-select"
          value={toEditableValue(row?.[key], normalizeCell)}
          onChange={(event) => onChange(row.id, key, event.target.value)}
          aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
          error={Boolean(errorMessage)}
        >
          <option value="在籍中">在籍中</option>
          <option value="退職済">退職済</option>
        </Select>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    );
  }

  if (key === "当時のクライアント") {
    const rawEditableValue = toEditableValue(row?.[key], normalizeCell);
    const trimmed = String(rawEditableValue ?? "").trim();
    const options = Array.isArray(clientOptions) ? clientOptions : [];
    const canAdd = Boolean(onAddClientOption && trimmed && !options.includes(trimmed));
    const listId = `client-options-${String(row?.id ?? "row")}`;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Input
            className="manager-edit-input"
            type="text"
            list={listId}
            value={rawEditableValue}
            onChange={(event) => onChange(row.id, key, event.target.value)}
            aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
            error={Boolean(errorMessage)}
          />
          {onAddClientOption ? (
            <button
              type="button"
              onClick={() => (canAdd ? onAddClientOption(trimmed) : undefined)}
              disabled={!canAdd}
              className={
                "shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition " +
                (canAdd
                  ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400")
              }
            >
              追加
            </button>
          ) : null}
        </div>
        <datalist id={listId}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    );
  }

  const inputType = column.type === "number" ? "number" : column.type === "date" ? "date" : "text";

  const toDateInputValue = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const normalized = raw.includes("/") ? raw.replaceAll("/", "-") : raw;
    const [y, m, d] = normalized.split("-");
    if (!y || !m || !d) return "";
    return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const rawEditableValue = toEditableValue(row?.[key], normalizeCell);
  const inputValue = inputType === "date" ? toDateInputValue(rawEditableValue) : rawEditableValue;

  return (
    <div className="space-y-1">
      <Input
        className="manager-edit-input"
        type={inputType}
        value={inputValue}
        onChange={(event) => onChange(row.id, key, event.target.value)}
        placeholder={inputType === "date" ? "" : ""}
        aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
        error={Boolean(errorMessage)}
      />
      {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
    </div>
  );
};

export default EditableCellField;
