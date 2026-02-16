// 社員テーブル編集（純ロジック）

export const NON_EDITABLE_KEYS = new Set(["在籍月数", "退職月", "年齢", "id"]);

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

const EDIT_VALIDATION_MESSAGES = {
  nameTooShort: "名前を2文字以上で入力してください",
  nameTooLong: "名前は50文字を超えて入力できません",
  birthDateInvalid: "生年月日の形式が正しくありません",
  birthDateBefore1900: "生年月日は1900年以降の日付を入力してください",
  birthDateInFuture: "生年月日が未来の日付です",
  birthDateUnder15: "15歳未満の可能性があるため確認してください",
  birthDateOver75: "75歳以上の可能性があるため確認してください",
  joinDateInvalid: "入社日の形式が正しくありません",
  joinDateBefore1900: "入社日は1900年以降の日付を入力してください",
  joinDateInFuture: "入社日が未来の日付です",
  joinDateBefore15Years: "入社日が生年月日から15年未満です",
  retireDateInvalid: "退職日の形式が正しくありません",
  retireDateBeforeJoinDate: "退職日は入社日より前の日付にできません",
  retireDateInFuture: "退職日が未来の日付です（退職予定の確認が必要です）",
  retireDateOver50Years: "勤続50年以上のため入力ミスの可能性があります",
  statusTooLong: "稼働状態は20文字以内で入力してください",
  remarkTooLong: "備考は200文字以内で入力してください",
};

const parseDate = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw.includes("/") ? raw.replaceAll("/", "-") : raw;
  const [y, m, d] = normalized.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
};

const toDateOnly = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

export const buildRetireMonthLabelFromRetireDate = (retireDateValue) => {
  const retireDate = parseDate(retireDateValue);
  if (!retireDate) return "-";
  return `${retireDate.getFullYear()}年${retireDate.getMonth() + 1}月`;
};

export const buildAgeFromBirthDate = (birthDateValue, todayValue = new Date()) => {
  const birthDate = parseDate(birthDateValue);
  if (!birthDate) return "-";
  const today = toDateOnly(todayValue);
  const age = calculateAge(birthDate, today);
  return Number.isFinite(age) ? age : "-";
};

export const buildTenureMonthsFromJoinAndRetireDates = (joinDateValue, retireDateValue) => {
  const joinDate = parseDate(joinDateValue);
  const retireDate = parseDate(retireDateValue);
  if (!joinDate || !retireDate) return "-";
  if (retireDate < joinDate) return "-";
  const months = diffMonths(joinDate, retireDate);
  return Number.isFinite(months) ? months : "-";
};

const diffMonths = (start, end) => {
  const base = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return end.getDate() < start.getDate() ? base - 1 : base;
};

// 生年月日から年齢を計算
const calculateAge = (birthDate, today) => {
  return (
    today.getFullYear() -
    birthDate.getFullYear() -
    (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
      ? 1
      : 0)
  );
};

const toNumberOrNull = (value) => {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
};

export const validateEditableCell = ({ row, key, value }) => {
  if (!row || !key) return undefined;

  if (key === "名前") {
    const str = String(value ?? "").trim();
    if (!str) return undefined;
    if (str.length < 2) return EDIT_VALIDATION_MESSAGES.nameTooShort;
    if (str.length > 50) return EDIT_VALIDATION_MESSAGES.nameTooLong;
    return undefined;
  }

  if (key === "ステータス") {
    const str = String(value ?? "").trim();
    if (!str) return undefined;
    if (str.length > 20) return EDIT_VALIDATION_MESSAGES.statusTooLong;
    return undefined;
  }

  if (key === "備考") {
    const str = String(value ?? "");
    if (!str) return undefined;
    if (str.length > 200) return EDIT_VALIDATION_MESSAGES.remarkTooLong;
    return undefined;
  }

  if (key === "退職日") {
    const raw = String(value ?? "").trim();
    if (!raw) return undefined;
    const retireDate = parseDate(raw);
    if (!retireDate) return EDIT_VALIDATION_MESSAGES.retireDateInvalid;

    const joinDateRaw = row?.["入社日"];
    const joinDate = parseDate(joinDateRaw);

    if (joinDate && retireDate < joinDate) {
      return EDIT_VALIDATION_MESSAGES.retireDateBeforeJoinDate;
    }

    const today = toDateOnly(new Date());
    if (retireDate > today) {
      return EDIT_VALIDATION_MESSAGES.retireDateInFuture;
    }

    if (joinDate) {
      const tenureMonths = diffMonths(joinDate, retireDate);
      if (tenureMonths >= 50 * 12) {
        return EDIT_VALIDATION_MESSAGES.retireDateOver50Years;
      }
    }
  }

  if (key === "生年月日") {
    const raw = String(value ?? "").trim();
    if (!raw) return undefined;
    const birthDate = parseDate(raw);
    if (!birthDate) return EDIT_VALIDATION_MESSAGES.birthDateInvalid;

    const today = toDateOnly(new Date());
    const min1900 = new Date(1900, 0, 1);
    if (birthDate < min1900) return EDIT_VALIDATION_MESSAGES.birthDateBefore1900;
    if (birthDate > today) return EDIT_VALIDATION_MESSAGES.birthDateInFuture;

    const age = calculateAge(birthDate, today);
    if (age < 15) return EDIT_VALIDATION_MESSAGES.birthDateUnder15;
    if (age >= 75) return EDIT_VALIDATION_MESSAGES.birthDateOver75;
  }

  if (key === "入社日") {
    const raw = String(value ?? "").trim();
    if (!raw) return undefined;
    const joinDate = parseDate(raw);
    if (!joinDate) return EDIT_VALIDATION_MESSAGES.joinDateInvalid;

    const today = toDateOnly(new Date());
    const min1900 = new Date(1900, 0, 1);
    if (joinDate < min1900) return EDIT_VALIDATION_MESSAGES.joinDateBefore1900;
    if (joinDate > today) return EDIT_VALIDATION_MESSAGES.joinDateInFuture;

    const birthDate = parseDate(row?.["生年月日"]);
    if (birthDate) {
      const minJoin = new Date(birthDate.getFullYear() + 15, birthDate.getMonth(), birthDate.getDate());
      if (joinDate < minJoin) return EDIT_VALIDATION_MESSAGES.joinDateBefore15Years;
    }
  }

  return undefined;
};
