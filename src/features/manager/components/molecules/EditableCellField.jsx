import { NON_EDITABLE_KEYS, toEditableValue } from "@/features/manager/logic/employeeEdit.logic";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";

// テーブルセルの編集UI（molecule）
// - 編集不可項目はテキスト表示
// - 編集モード時は input/select に切り替え
const EditableCellField = ({ isEditing, row, column, normalizeCell, onChange }) => {
  const key = column.key;
  const displayValue = normalizeCell(row?.[key]);

  // 編集モードでない / 編集不可はテキスト
  if (!isEditing || NON_EDITABLE_KEYS.has(key)) {
    return <span className="manager-edit-text">{displayValue}</span>;
  }

  // セレクト（ステータス/性別）
  if (key === "ステータス") {
    return (
      <Select
        className="manager-edit-select"
        value={toEditableValue(row?.[key], normalizeCell)}
        onChange={(event) => onChange(row.id, key, event.target.value)}
        aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
      >
        <option value="">（未設定）</option>
        <option value="開発">開発</option>
        <option value="派遣">派遣</option>
        <option value="待機">待機</option>
      </Select>
    );
  }

  if (key === "性別") {
    return (
      <Select
        className="manager-edit-select"
        value={toEditableValue(row?.[key], normalizeCell)}
        onChange={(event) => onChange(row.id, key, event.target.value)}
        aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
      >
        <option value="">（未設定）</option>
        <option value="男性">男性</option>
        <option value="女性">女性</option>
      </Select>
    );
  }

  const inputType = column.type === "number" ? "number" : "text";

  return (
    <Input
      className="manager-edit-input"
      type={inputType}
      value={toEditableValue(row?.[key], normalizeCell)}
      onChange={(event) => onChange(row.id, key, event.target.value)}
      placeholder={column.type === "date" ? "YYYY/MM/DD" : ""}
      aria-label={`${row?.["名前"] ?? "社員"}の${column.label}`}
    />
  );
};

export default EditableCellField;
