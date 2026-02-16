import type { EmployeeCsvError, EmployeeCsvRawRow } from "../types";
import {
  EMPLOYEE_CSV_HEADER_MAP,
  EMPLOYEE_CSV_REQUIRED_FIELDS,
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
      errors.push({
        rowNumber: 0,
        field: "header",
        message: `許可されていないヘッダー「${String(header ?? "").trim()}」があります。テンプレートCSVのヘッダーを使用してください。`,
      });
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
        message: `${EMPLOYEE_CSV_FIELD_LABELS[field]}列が重複しています（${prevIndex + 1}列目と${index + 1}列目）。ヘッダーを修正してください。`,
      });
    }
    seen.set(field, index);
  });

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
