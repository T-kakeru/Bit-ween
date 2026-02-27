import type {
  EmployeeCsvError,
  EmployeeCsvNormalizedRow,
  EmployeeCsvRawRow,
  EmployeeCsvValidationResult,
} from "../types";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";
import { validateEmploymentStatusConsistency } from "@/shared/validation/employeeValidation";
import {
  GENDER_MASTER,
  hasWorkStatusMaster,
  hasClientMaster,
  hasDepartmentMaster,
} from "./employeeCsvConstants";

const MAX_NAME_LENGTH = 100;
const MAX_RETIRE_REASON_LENGTH = 2000;
const MAX_REMARK_LENGTH = 200;
const MAX_WORK_LOCATION_LENGTH = 200;
const MAX_WORK_STATUS_LENGTH = 50;

const hasEncodingIssue = (value: string) => value.includes("\uFFFD");

const isBlank = (value: string | null | undefined) => !value || value.trim() === "";

const normalizeValue = (value: string | null | undefined) => {
  if (isBlank(value)) return "";
  const trimmed = String(value).trim();
  // Excel/スプレッドシート運用で「値なし」の表現として入りがちなダッシュは空扱いにする
  if (trimmed === "-" || trimmed === "－" || trimmed === "ー" || trimmed === "―" || trimmed === "—") return "";
  // Excelで空欄/参照切れのときに入りがちなエラー文字列は「値なし」として扱う
  if (trimmed === "#REF!") return "";
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
  const employmentStatusRaw = normalizeValue((row as any).employmentStatus);
  const workStatus = normalizeValue(row.workStatus);
  const workLocation = normalizeValue(row.workLocation) || null;
  const retirementDateRaw = normalizeValue(row.retirementDate);
  const retirementReason = normalizeValue(row.retirementReason);
  const remark = normalizeValue(row.remark);

  // 在籍/退職の判定
  // - 在籍状態列があればそれを優先（在籍/退職）
  // - 無ければ、退職情報(退職日/退職理由)が入っているかで推定する
  const hasExplicitEmploymentStatus = Boolean(employmentStatusRaw);
  const isRetired = employmentStatusRaw === "退職" ? true : employmentStatusRaw === "在籍" ? false : Boolean(retirementDateRaw || retirementReason);

  const valuesToCheck = [
    name,
    genderRaw,
    birthDateRaw,
    employeeId ?? "",
    department ?? "",
    joinDateRaw,
    employmentStatusRaw,
    workStatus,
    workLocation ?? "",
    retirementDateRaw,
    retirementReason,
    remark,
  ];

  if (valuesToCheck.some((value) => hasEncodingIssue(value))) {
    errors.push({
      rowNumber,
      field: "row",
      message: ERROR_MESSAGES.CSV.EMPLOYEE.INVALID_ENCODING_UTF8_DOT,
    });
  }

  if (isBlank(name)) errors.push(toFieldError(rowNumber, "name", ERROR_MESSAGES.CSV.EMPLOYEE.REQUIRED("氏名")));
  if (name && name.length > MAX_NAME_LENGTH) {
    errors.push(
      toFieldError(rowNumber, "name", ERROR_MESSAGES.CSV.EMPLOYEE.MAX_LENGTH("氏名", MAX_NAME_LENGTH))
    );
  }

  if (isBlank(genderRaw)) {
    errors.push(toFieldError(rowNumber, "gender", ERROR_MESSAGES.CSV.EMPLOYEE.REQUIRED("性別")));
  } else if (!GENDER_MASTER.includes(genderRaw) && !GENDER_MASTER.includes(genderValue)) {
    errors.push(toFieldError(rowNumber, "gender", ERROR_MESSAGES.CSV.EMPLOYEE.GENDER_MUST_BE_ALLOWED));
  }

  const birthDate = normalizeDateValue(birthDateRaw);
  if (isBlank(birthDateRaw)) {
    errors.push(toFieldError(rowNumber, "birthDate", ERROR_MESSAGES.CSV.EMPLOYEE.REQUIRED("生年月日")));
  } else if (!birthDate) {
    errors.push(
      toFieldError(
        rowNumber,
        "birthDate",
        ERROR_MESSAGES.CSV.EMPLOYEE.DATE_NOT_RECOGNIZED_WITH_EXAMPLE("生年月日", "1990/04/01")
      )
    );
  }

  if (department && !hasDepartmentMaster(department)) {
    errors.push({
      ...toFieldError(rowNumber, "department", ERROR_MESSAGES.CSV.EMPLOYEE.DEPARTMENT_NOT_IN_MASTER_ADDABLE),
      code: "unknownDepartment",
      value: department,
    });
  }

  const joinDate = normalizeDateValue(joinDateRaw);
  if (isBlank(joinDateRaw)) {
    errors.push(toFieldError(rowNumber, "joinDate", ERROR_MESSAGES.CSV.EMPLOYEE.REQUIRED("入社日")));
  } else if (!joinDate) {
    errors.push(
      toFieldError(
        rowNumber,
        "joinDate",
        ERROR_MESSAGES.CSV.EMPLOYEE.DATE_NOT_RECOGNIZED_WITH_EXAMPLE("入社日", "2020/04/01")
      )
    );
  }

  if (isBlank(workStatus)) {
    errors.push(toFieldError(rowNumber, "workStatus", ERROR_MESSAGES.CSV.EMPLOYEE.REQUIRED("稼働状態")));
  } else {
    if (workStatus.length > MAX_WORK_STATUS_LENGTH) {
      errors.push(
        toFieldError(
          rowNumber,
          "workStatus",
          ERROR_MESSAGES.CSV.EMPLOYEE.MAX_LENGTH("稼働状態", MAX_WORK_STATUS_LENGTH)
        )
      );
    }
    if (!hasWorkStatusMaster(workStatus)) {
      errors.push(
        toFieldError(
          rowNumber,
          "workStatus",
          ERROR_MESSAGES.CSV.EMPLOYEE.WORK_STATUS_NOT_IN_MASTER(workStatus)
        )
      );
    }
  }

  if (workLocation && workLocation.length > MAX_WORK_LOCATION_LENGTH) {
    errors.push(
      toFieldError(
        rowNumber,
        "workLocation",
        ERROR_MESSAGES.CSV.EMPLOYEE.MAX_LENGTH("稼働先", MAX_WORK_LOCATION_LENGTH)
      )
    );
  }

  if (workLocation && !hasClientMaster(workLocation)) {
    errors.push({
      ...toFieldError(rowNumber, "workLocation", ERROR_MESSAGES.CSV.EMPLOYEE.WORK_LOCATION_NOT_IN_MASTER_ADDABLE),
      code: "unknownWorkLocation",
      value: workLocation,
    });
  }

  // 在籍状態の入力値が不正な場合（列がある/入力がある想定）
  if (hasExplicitEmploymentStatus && employmentStatusRaw !== "在籍" && employmentStatusRaw !== "退職") {
    errors.push({
      ...toFieldError(rowNumber, "employmentStatus", ERROR_MESSAGES.VALIDATION.EMPLOYMENT_STATUS_INVALID),
      code: "invalidEmploymentStatus",
      value: employmentStatusRaw,
    });
  }

  // 在籍状態と退職情報の整合性（在籍なのに退職日/退職理由/備考が入っている等）
  const consistencyErrors = validateEmploymentStatusConsistency({
    employmentStatus: employmentStatusRaw,
    retireDate: retirementDateRaw,
    retireReason: retirementReason,
    remark,
  });
  for (const e of consistencyErrors) {
    if (e.code === "EMPLOYMENT_STATUS_INVALID") continue; // ここは上でCSV専用として出している

    if (e.field === "retireDate") {
      errors.push({
        ...toFieldError(rowNumber, "retirementDate", e.message),
        code: "activeDisallowRetirementDate",
      });
    }
    if (e.field === "retireReason") {
      errors.push({
        ...toFieldError(rowNumber, "retirementReason", e.message),
        code: "activeDisallowRetirementReason",
      });
    }
    if (e.field === "remark") {
      errors.push({
        ...toFieldError(rowNumber, "remark", e.message),
        code: "activeDisallowRemark",
      });
    }
  }

  const retirementDate = normalizeDateValue(retirementDateRaw);
  if (isRetired) {
    if (isBlank(retirementDateRaw)) {
      errors.push(toFieldError(rowNumber, "retirementDate", ERROR_MESSAGES.CSV.EMPLOYEE.REQUIRED("退職日")));
    } else if (!retirementDate) {
      errors.push(
        toFieldError(
          rowNumber,
          "retirementDate",
          ERROR_MESSAGES.CSV.EMPLOYEE.DATE_NOT_RECOGNIZED_WITH_EXAMPLE("退職日", "2023/03/31")
        )
      );
    } else {
      if (joinDate) {
        const joinDateObj = parseDateString(joinDate);
        const retireDateObj = parseDateString(retirementDate);
        if (joinDateObj && retireDateObj && retireDateObj < joinDateObj) {
          errors.push(
            toFieldError(rowNumber, "retirementDate", ERROR_MESSAGES.CSV.EMPLOYEE.RETIREMENT_DATE_BEFORE_JOIN_DATE)
          );
        }
      }

      if (!allowFutureRetirementDate) {
        const today = new Date();
        const retireDateObj = parseDateString(retirementDate);
        if (retireDateObj && retireDateObj > today) {
          errors.push(toFieldError(rowNumber, "retirementDate", ERROR_MESSAGES.CSV.EMPLOYEE.RETIREMENT_DATE_IN_FUTURE));
        }
      }
    }

    if (isBlank(retirementReason)) {
      errors.push(toFieldError(rowNumber, "retirementReason", ERROR_MESSAGES.CSV.EMPLOYEE.REQUIRED("退職理由")));
    } else if (retirementReason.length > MAX_RETIRE_REASON_LENGTH) {
      errors.push(
        toFieldError(
          rowNumber,
          "retirementReason",
          ERROR_MESSAGES.CSV.EMPLOYEE.MAX_LENGTH("退職理由", MAX_RETIRE_REASON_LENGTH)
        )
      );
    }
  } else {
    // 在籍扱いの場合は、退職日/退職理由が空であることを許容する（必須にしない）
    if (retirementReason.length > MAX_RETIRE_REASON_LENGTH) {
      errors.push(
        toFieldError(
          rowNumber,
          "retirementReason",
          ERROR_MESSAGES.CSV.EMPLOYEE.MAX_LENGTH("退職理由", MAX_RETIRE_REASON_LENGTH)
        )
      );
    }
  }

  if (remark.length > MAX_REMARK_LENGTH) {
    errors.push(toFieldError(rowNumber, "remark", ERROR_MESSAGES.CSV.EMPLOYEE.MAX_LENGTH("備考", MAX_REMARK_LENGTH)));
  }

  if (errors.length > 0) {
    return { normalizedRow: null, errors };
  }

  return {
    normalizedRow: {
      name,
      gender: genderValue,
      birthDate: birthDate ?? "",
      employeeId,
      department,
      joinDate: joinDate ?? "",
      employmentStatus: employmentStatusRaw || undefined,
      workStatus,
      workLocation,
      retirementDate: retirementDate ?? "",
      retirementReason,
      remark,
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
        message: ERROR_MESSAGES.CSV.EMPLOYEE.EMPLOYEE_ID_DUPLICATED_IN_CSV,
      });
    });
  });

  return {
    validRows,
    errors,
    rowCount: rows.length,
  };
};

