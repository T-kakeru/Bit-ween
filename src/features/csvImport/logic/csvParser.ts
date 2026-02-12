  // CSVテキストを解析してヘッダーとデータ行に分割するユーティリティ関数を提供します。
import type { EmployeeCsvParseResult } from "../types";

const splitCsvText = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\r") {
      if (next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows.filter((values) => values.some((value) => String(value ?? "").trim() !== ""));
};

export const parseCsvText = (rawText: string): EmployeeCsvParseResult => {
  const text = rawText.replace(/^\uFEFF/, "");
  const rows = splitCsvText(text);
  const [headerRow = [], ...dataRows] = rows;
  const headers = headerRow.map((header) => String(header ?? "").trim());
  return { headers, rows: dataRows };
};
