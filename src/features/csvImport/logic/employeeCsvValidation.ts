import type {
  EmployeeCsvError,
  EmployeeCsvNormalizedRow,
  EmployeeCsvRawRow,
  EmployeeCsvValidationResult,
} from "../types";
import {
  EMPLOYMENT_STATUS_MASTER,
  GENDER_MASTER,
  hasWorkStatusMaster,
  hasClientMaster,
  hasDepartmentMaster,
} from "./employeeCsvConstants";

const MAX_NAME_LENGTH = 100;
const MAX_RETIRE_REASON_LENGTH = 2000;
const MAX_WORK_LOCATION_LENGTH = 200;
const MAX_WORK_STATUS_LENGTH = 50;

const hasEncodingIssue = (value: string) => value.includes("\uFFFD");

const isBlank = (value: string | null | undefined) => !value || value.trim() === "";

const normalizeValue = (value: string | null | undefined) => {
  if (isBlank(value)) return "";
  const trimmed = String(value).trim();
  // Excel/スプレッドシート運用で「値なし」の表現として入りがちなダッシュは空扱いにする
  if (trimmed === "-" || trimmed === "－" || trimmed === "ー" || trimmed === "―" || trimmed === "—") return "";
  return trimmed;
};

const normalizeGender = (value: string) => {
  if (value === "男") return "男性";
  if (value === "女") return "女性";
  return value;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const toDateString = (date: Date) =>
  `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;

const parseExcelSerialDate = (serialValue: number): Date | null => {
  if (!Number.isFinite(serialValue)) return null;
  const serial = Math.floor(serialValue);
  if (serial <= 0) return null;
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDateString = (value: string): Date | null => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;

  // 時刻部(例: 2023/03/31 0:00)は切り捨て
  const noTime = trimmed.split(/[\sT]/)[0];

  // 表記ゆれを吸収
  const normalized = noTime
    .replace(/年|\./g, "/")
    .replace(/月/g, "/")
    .replace(/日/g, "")
    .replace(/-/g, "/");

  // YYYY/M/D
  const ymd = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  return null;
};

const normalizeDateValue = (value: string | null | undefined): string | null => {
  const raw = normalizeValue(value);
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    const serialDate = parseExcelSerialDate(Number(raw));
    return serialDate ? toDateString(serialDate) : null;
  }

  const date = parseDateString(raw);
  return date ? toDateString(date) : null;
};

const toFieldError = (rowNumber: number, field: keyof EmployeeCsvNormalizedRow, message: string): EmployeeCsvError => ({
  rowNumber,
  field,
  message,
});

export const validateEmployeeCsvRow = ({
  row,
  rowNumber,
  allowFutureRetirementDate,
}: {
  row: EmployeeCsvRawRow;
  rowNumber: number;
  allowFutureRetirementDate: boolean;
}): { normalizedRow: EmployeeCsvNormalizedRow | null; errors: EmployeeCsvError[] } => {
  const errors: EmployeeCsvError[] = [];

  const name = normalizeValue(row.name);
  const genderRaw = normalizeValue(row.gender);
  const genderValue = normalizeGender(genderRaw);
  const birthDateRaw = normalizeValue(row.birthDate);
  const employeeId = normalizeValue(row.employeeId) || null;
  const department = normalizeValue(row.department) || null;
  const joinDateRaw = normalizeValue(row.joinDate);
  const employmentStatusRaw = normalizeValue(row.employmentStatus) || null;
  const workStatus = normalizeValue(row.workStatus);
  const workLocation = normalizeValue(row.workLocation) || null;
  const retirementDateRaw = normalizeValue(row.retirementDate);
  const retirementReason = normalizeValue(row.retirementReason);

  const valuesToCheck = [
    name,
    genderRaw,
    birthDateRaw,
    employeeId ?? "",
    department ?? "",
    joinDateRaw,
    employmentStatusRaw ?? "",
    workStatus,
    workLocation ?? "",
    retirementDateRaw,
    retirementReason,
  ];

  if (valuesToCheck.some((value) => hasEncodingIssue(value))) {
    errors.push({
      rowNumber,
      field: "row",
      message: "文字コードが正しくありません。UTF-8で保存し直してください。",
    });
  }

  if (isBlank(name)) errors.push(toFieldError(rowNumber, "name", "氏名は必須です。"));
  if (name && name.length > MAX_NAME_LENGTH) {
    errors.push(toFieldError(rowNumber, "name", `氏名は${MAX_NAME_LENGTH}文字以内で入力してください。`));
  }

  if (isBlank(genderRaw)) {
    errors.push(toFieldError(rowNumber, "gender", "性別は必須です。"));
  } else if (!GENDER_MASTER.includes(genderRaw) && !GENDER_MASTER.includes(genderValue)) {
    errors.push(toFieldError(rowNumber, "gender", "性別は『男性/女性/その他』で入力してください。"));
  }

  const birthDate = birthDateRaw ? normalizeDateValue(birthDateRaw) : null;
  if (birthDateRaw && !birthDate) {
    errors.push(toFieldError(rowNumber, "birthDate", "生年月日が日付として認識できません。例: 1990/04/01"));
  }

  if (!department) {
    errors.push(toFieldError(rowNumber, "department", "部署は必須です。"));
  }

  if (department && !hasDepartmentMaster(department)) {
    errors.push({
      ...toFieldError(rowNumber, "department", "部署がマスタに存在しません。追加して取り込みできます。"),
      code: "unknownDepartment",
      value: department,
    });
  }

  const joinDate = normalizeDateValue(joinDateRaw);
  if (isBlank(joinDateRaw)) {
    errors.push(toFieldError(rowNumber, "joinDate", "入社日は必須です。"));
  } else if (!joinDate) {
    errors.push(toFieldError(rowNumber, "joinDate", "入社日が日付として認識できません。例: 2020/04/01"));
  }

  if (employmentStatusRaw && !EMPLOYMENT_STATUS_MASTER.includes(employmentStatusRaw)) {
    errors.push(toFieldError(rowNumber, "employmentStatus", "在籍状態が不正です。例: 在籍中 / 退職済"));
  }

  if (isBlank(workStatus)) {
    errors.push(toFieldError(rowNumber, "workStatus", "稼働状態は必須です。"));
  } else {
    if (workStatus.length > MAX_WORK_STATUS_LENGTH) {
      errors.push(toFieldError(rowNumber, "workStatus", `稼働状態は${MAX_WORK_STATUS_LENGTH}文字以内で入力してください。`));
    }
    if (!hasWorkStatusMaster(workStatus)) {
      errors.push({
        ...toFieldError(rowNumber, "workStatus", "稼働状態がマスタに存在しません。追加して取り込みできます。"),
        code: "unknownWorkStatus",
        value: workStatus,
      });
    }
  }

  if (workLocation && workLocation.length > MAX_WORK_LOCATION_LENGTH) {
    errors.push(toFieldError(rowNumber, "workLocation", `稼働先は${MAX_WORK_LOCATION_LENGTH}文字以内で入力してください。`));
  }

  if (workLocation && !hasClientMaster(workLocation)) {
    errors.push({
      ...toFieldError(rowNumber, "workLocation", "稼働先がマスタに存在しません。追加して取り込みできます。"),
      code: "unknownWorkLocation",
      value: workLocation,
    });
  }

  const retirementDate = normalizeDateValue(retirementDateRaw);
  if (isBlank(retirementDateRaw)) {
    errors.push(toFieldError(rowNumber, "retirementDate", "退職日は必須です。"));
  } else if (!retirementDate) {
    errors.push(toFieldError(rowNumber, "retirementDate", "退職日が日付として認識できません。例: 2023/03/31"));
  } else if (joinDate) {
    const joinDateObj = parseDateString(joinDate);
    const retireDateObj = parseDateString(retirementDate);
    if (joinDateObj && retireDateObj && retireDateObj < joinDateObj) {
      errors.push(toFieldError(rowNumber, "retirementDate", "退職日が入社日より前になっています。日付を修正してください。"));
    }
  } else if (!allowFutureRetirementDate) {
    const today = new Date();
    const retireDateObj = parseDateString(retirementDate);
    if (retireDateObj && retireDateObj > today) {
      errors.push(toFieldError(rowNumber, "retirementDate", "退職日が未来日です。修正してください。"));
    }
  }

  if (isBlank(retirementReason)) {
    errors.push(toFieldError(rowNumber, "retirementReason", "退職理由は必須です。"));
  } else if (retirementReason.length > MAX_RETIRE_REASON_LENGTH) {
    errors.push(
      toFieldError(rowNumber, "retirementReason", `退職理由は${MAX_RETIRE_REASON_LENGTH}文字以内で入力してください。`)
    );
  }

  if (errors.length > 0) {
    return { normalizedRow: null, errors };
  }

  return {
    normalizedRow: {
      name,
      gender: genderValue,
      birthDate,
      employeeId,
      department,
      joinDate,
      employmentStatus: employmentStatusRaw,
      workStatus,
      workLocation,
      retirementDate: retirementDate ?? "",
      retirementReason,
    },
    errors: [],
  };
};

export const validateEmployeeCsvRows = ({
  rows,
  allowFutureRetirementDate,
}: {
  rows: EmployeeCsvRawRow[];
  allowFutureRetirementDate: boolean;
}): EmployeeCsvValidationResult => {
  const errors: EmployeeCsvError[] = [];
  const validRows: EmployeeCsvNormalizedRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    const { normalizedRow, errors: rowErrors } = validateEmployeeCsvRow({
      row,
      rowNumber,
      allowFutureRetirementDate,
    });
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      return;
    }
    if (normalizedRow) validRows.push(normalizedRow);
  });

  const employeeIdMap = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const employeeId = normalizeValue(row.employeeId);
    if (!employeeId) return;
    const list = employeeIdMap.get(employeeId) ?? [];
    list.push(index + 1);
    employeeIdMap.set(employeeId, list);
  });

  employeeIdMap.forEach((rowNumbers) => {
    if (rowNumbers.length < 2) return;
    rowNumbers.forEach((rowNumber) => {
      errors.push({
        rowNumber,
        field: "employeeId",
        message: "社員IDがCSV内で重複しています。重複行を修正してください。",
      });
    });
  });

  return {
    validRows,
    errors,
    rowCount: rows.length,
  };
};

