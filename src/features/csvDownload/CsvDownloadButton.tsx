import Button from "@/shared/ui/Button";
import type { ManagerRow } from "@/features/manager/types";

const DEFAULT_FILE_NAME = "manager_list.csv";

const pad2 = (value: number): string => String(value).padStart(2, "0");

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}/${month}/${day}`;
};

const normalizeDateValue = (value: unknown): string | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate(value);
  }
  if (typeof value === "number" && value > 1000) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return formatDate(date);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const isoDateMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoDateMatch) {
      return trimmed.replace(/-/g, "/").slice(0, 10);
    }
    const slashDateMatch = trimmed.match(/^\d{4}\/\d{2}\/\d{2}/);
    if (slashDateMatch) return trimmed.slice(0, 10);
  }
  return null;
};

const escapeCsvValue = (value: unknown): string => {
  const normalizedDate = normalizeDateValue(value);
  const raw = normalizedDate ?? (value == null ? "" : String(value));
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
};

const buildCsvContent = (rows: ManagerRow[], columns?: string[]): string => {
  if (!rows || rows.length === 0) return "";
  const headers = columns && columns.length > 0 ? columns : Object.keys(rows[0]);
  const headerRow = headers.map((header) => escapeCsvValue(header)).join(",");
  const dataRows = rows.map((row) => headers.map((key) => escapeCsvValue(row?.[key])).join(","));
  return [headerRow, ...dataRows].join("\r\n");
};

const downloadCsv = (rows: ManagerRow[], fileName: string, columns?: string[]) => {
  const csvBody = buildCsvContent(rows, columns);
  const csvWithBom = `\uFEFF${csvBody}`;
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

type CsvDownloadButtonProps = {
  rows: ManagerRow[];
  columns?: string[];
  fileName?: string;
  label?: string;
  className?: string;
};

const CsvDownloadButton = ({
  rows,
  columns,
  fileName = DEFAULT_FILE_NAME,
  label = "CSV出力",
  className = "",
}: CsvDownloadButtonProps) => {
  return (
    <Button type="button" variant="outline" size="md" className={`manager-action-button ${className}`} onClick={() => downloadCsv(rows ?? [], fileName, columns)}>
      <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
      </span>
      <span>{label}</span>
    </Button>
  );
};

export default CsvDownloadButton;
