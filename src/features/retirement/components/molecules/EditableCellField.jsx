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
  departmentOptions,
  statusOptions,
  reasonOptions,
  onAddClientOption,
  errorMessage,
}) => {
  const key = column.key;
  const displayValue = normalizeCell(row?.[key]);

  // 編集モードでない / 編集不可 はテキスト表示
  if (!isEditing || NON_EDITABLE_KEYS.has(key)) {
    const isEllipsis = key === "当時のクライアント" || key === "備考";
    // 編集不可のセルは、内容が長い場合に省略表示する。省略表示する場合は title 属性に全内容を入れる。
    const className = isEllipsis ? "manager-edit-text manager-edit-text--ellipsis" : "manager-edit-text";
    // ホバーで全内容を表示するため、displayValue が "-" でない場合にのみ title 属性を設定する
    const title = isEllipsis && displayValue && displayValue !== "-" ? displayValue : undefined;
    return (
      <span className={className} title={title}>
        {displayValue}
      </span>
    );
  }

  // セレクト（ステータス / 性別 など）
  if (key === "ステータス") {
    const options = Array.isArray(statusOptions) ? statusOptions : [];
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
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    );
  }

  if (key === "部署") {
    const options = Array.isArray(departmentOptions) ? departmentOptions : [];
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
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    );
  }

  if (key === "退職理由") {
    const options = Array.isArray(reasonOptions) ? reasonOptions : [];
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
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
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

  if (key === "当時のクライアント") {
    const options = Array.isArray(clientOptions) ? clientOptions : [];
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
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
        {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
      </div>
    );
  }

  if (key === "備考") {
    return (
      <div className="space-y-1">
        <Input
          className="manager-edit-input"
          type="text"
          value={toEditableValue(row?.[key], normalizeCell)}
          onChange={(event) => onChange(row.id, key, event.target.value)}
          aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
          error={Boolean(errorMessage)}
          maxLength={200}
        />
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
