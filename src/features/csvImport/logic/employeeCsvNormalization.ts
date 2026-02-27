import type { EmployeeCsvError, EmployeeCsvRawRow } from "../types";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";
import {
  EMPLOYEE_CSV_HEADER_MAP,
  EMPLOYEE_CSV_HEADER_SPECS,
  EMPLOYEE_CSV_FIELD_LABELS,
} from "./employeeCsvConstants";

const normalizeHeaderName = (header: string) =>
  String(header ?? "")
    .replace(/^\uFEFF/, "")
    .trim();

export const normalizeEmployeeCsvRows = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}): { normalizedRows: EmployeeCsvRawRow[]; errors: EmployeeCsvError[] } => {
  const errors: EmployeeCsvError[] = [];

  const headerKeys = headers.map((header) => {
    const normalizedHeader = normalizeHeaderName(header);
    if (!normalizedHeader) return null;
    const mapped = EMPLOYEE_CSV_HEADER_MAP[normalizedHeader] ?? null;
    if (!mapped) {
      // 許可外ヘッダーはエラーにせず、取り込み時に無視する
      return null;
    }
    return mapped;
  });

  const seen = new Map<string, number>();
  headerKeys.forEach((field, index) => {
    if (!field) return;
    const prevIndex = seen.get(field);
    if (prevIndex != null) {
      errors.push({
        rowNumber: 0,
        field: "header",
        message: ERROR_MESSAGES.CSV.EMPLOYEE.DUPLICATE_HEADER(
          EMPLOYEE_CSV_FIELD_LABELS[field],
          prevIndex + 1,
          index + 1
        ),
      });
    }
    seen.set(field, index);
  });

  for (const spec of EMPLOYEE_CSV_HEADER_SPECS) {
    if (!headerKeys.includes(spec.field)) {
      errors.push({
        rowNumber: 0,
        field: "header",
        message: ERROR_MESSAGES.CSV.EMPLOYEE.REQUIRED_HEADER_NOT_FOUND(
          EMPLOYEE_CSV_FIELD_LABELS[spec.field]
        ),
      });
    }
  }
  // ヘッダーの正規化と必須フィールドの検証を行います。
  const normalizedRows = rows.map((values) => {
    const row: EmployeeCsvRawRow = {};
    headerKeys.forEach((field, index) => {
      if (!field) return;
      row[field] = String(values[index] ?? "").trim();
    });
    return row;
  });

  return { normalizedRows, errors };
};
