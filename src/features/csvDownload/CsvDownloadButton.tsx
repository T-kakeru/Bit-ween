import Button from "@/shared/ui/Button";
import { ClipboardCopy } from "lucide-react";
import type { ManagerRow } from "@/features/retirement/types";
import type { ReactNode } from "react";

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
  rows?: ManagerRow[];
  columns?: string[];
  fileName?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
  showIcon?: boolean;
  iconNode?: ReactNode;
  iconOnly?: boolean;
  ariaLabel?: string;
  tooltipLabel?: string;
};

const CsvDownloadButton = ({
  rows,
  columns,
  fileName = DEFAULT_FILE_NAME,
  label = "ダウンロード",
  className = "",
  onClick,
  showIcon = true,
  iconNode,
  iconOnly = false,
  ariaLabel,
  tooltipLabel,
}: CsvDownloadButtonProps) => {
  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick();
      return;
    }

    downloadCsv(rows ?? [], fileName, columns);
  };

  const resolvedLabel = ariaLabel ?? label;

  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      className={`manager-action-button ${iconOnly ? "manager-icon-only-button" : ""} ${tooltipLabel ? "icon-tooltip-trigger" : ""} ${className}`}
      onClick={handleClick}
      aria-label={resolvedLabel}
      title={tooltipLabel ? undefined : resolvedLabel}
      data-tooltip={tooltipLabel ?? undefined}
    >
      {iconNode ? iconNode : showIcon ? <ClipboardCopy className="manager-edit-icon" aria-hidden="true" /> : null}
      {iconOnly ? null : <span>{label}</span>}
    </Button>
  );
};

export default CsvDownloadButton;
