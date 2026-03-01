import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";
import type { CatalogItem, CatalogKey } from "@/shared/logic/catalogStorage";

export type CatalogItemLabel = "部署" | "稼働先" | "稼働状態";

const WORK_STATUS_ID_PREFIX = "ws";

export const toWorkStatusItems = (names: string[]): CatalogItem[] =>
  (Array.isArray(names) ? names : [])
    .map((name) => String(name ?? "").trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: `${WORK_STATUS_ID_PREFIX}-${String(index + 1).padStart(3, "0")}`,
      name,
    }));

export const normalizeName = (value: unknown) => String(value ?? "").trim();

export const validateCatalogName = ({
  itemLabel,
  keyName,
  name,
}: {
  itemLabel: CatalogItemLabel;
  keyName: CatalogKey;
  name: string;
}): { ok: true } | { ok: false; message: string } => {
  const trimmed = normalizeName(name);
  if (!trimmed) return { ok: false, message: ERROR_MESSAGES.MASTER.NAME_REQUIRED };

  const maxLength = keyName === "departments" ? 100 : keyName === "clients" ? 150 : 100;
  if (trimmed.length > maxLength) {
    return { ok: false, message: ERROR_MESSAGES.CSV.EMPLOYEE.MAX_LENGTH(itemLabel, maxLength) };
  }

  return { ok: true };
};

export const hasDuplicateNames = (items: CatalogItem[]) => {
  const seen = new Set<string>();
  for (const item of items) {
    const key = normalizeName(item.name);
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
};

export const isTempId = (id: string) => String(id ?? "").startsWith("tmp:");
