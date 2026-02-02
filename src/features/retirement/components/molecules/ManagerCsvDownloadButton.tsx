import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import type { ManagerRow } from "@/features/retirement/types";

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

const buildCsvContent = (rows: ManagerRow[]): string => {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerRow = headers.map((header) => escapeCsvValue(header)).join(",");
  const dataRows = rows.map((row) => headers.map((key) => escapeCsvValue(row?.[key])).join(","));
  return [headerRow, ...dataRows].join("\r\n");
};

const downloadCsv = (rows: ManagerRow[], fileName: string) => {
  const csvBody = buildCsvContent(rows);
  const csvWithBom = `\uFEFF${csvBody}`;
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

type ManagerCsvDownloadButtonProps = {
  rows: ManagerRow[];
  fileName?: string;
  label?: string;
};

const ManagerCsvDownloadButton = ({
  rows,
  fileName = DEFAULT_FILE_NAME,
  label = "ダウンロード",
}: ManagerCsvDownloadButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="flex items-center gap-2 rounded-full border-[color:var(--color-brand)] bg-[color:var(--color-brand)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
      onClick={() => downloadCsv(rows ?? [], fileName)}
    >
      <Icon className="manager-edit-icon" src="/img/icon_csv.png" alt="" />
      <span>{label}</span>
    </Button>
  );
};

export default ManagerCsvDownloadButton;
