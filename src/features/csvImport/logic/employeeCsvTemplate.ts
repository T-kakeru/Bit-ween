import { EMPLOYEE_CSV_HEADER_SPECS } from "./employeeCsvConstants";

export const EMPLOYEE_CSV_TEMPLATE_FILE_NAME = "employee_import_template.csv";

const escapeCsvValue = (value: string): string => {
  const escaped = String(value ?? "").replace(/"/g, '""');
  return `"${escaped}"`;
};

export const buildEmployeeCsvTemplateText = (): string => {
  const headers = EMPLOYEE_CSV_HEADER_SPECS.map((x) => x.label);
  const headerRow = headers.map(escapeCsvValue).join(",");
  const emptyRow = headers.map(() => "").join(",");
  // Excelでの文字化け対策としてBOM付きUTF-8
  return `\uFEFF${[headerRow, emptyRow].join("\r\n")}`;
};
