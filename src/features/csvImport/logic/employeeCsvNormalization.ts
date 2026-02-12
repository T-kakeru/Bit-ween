import type { EmployeeCsvError, EmployeeCsvRawRow } from "../types";
import {
  EMPLOYEE_CSV_HEADER_ALIASES,
  EMPLOYEE_CSV_REQUIRED_FIELDS,
  EMPLOYEE_CSV_FIELD_LABELS,
} from "./employeeCsvConstants";

const normalizeHeaderName = (header: string) =>
  String(header ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    // 半角/全角スペース、タブ等の混入は無視（Excelで起きがち）
    .replace(/[\s\u3000]+/g, "");

export const normalizeEmployeeCsvRows = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}): { normalizedRows: EmployeeCsvRawRow[]; errors: EmployeeCsvError[] } => {
  const headerKeys = headers.map((header) => {
    const normalizedHeader = normalizeHeaderName(header);
    return EMPLOYEE_CSV_HEADER_ALIASES[normalizedHeader] ?? null;
  });
  const errors: EmployeeCsvError[] = [];

  for (const requiredField of EMPLOYEE_CSV_REQUIRED_FIELDS) {
    if (!headerKeys.includes(requiredField)) {
      errors.push({
        rowNumber: 0,
        field: "header",
        message: `${EMPLOYEE_CSV_FIELD_LABELS[requiredField]}列が見つかりません。ヘッダー名を確認してください。`,
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
