import type { CatalogItem } from "@/shared/logic/catalogStorage";

export const toCatalogItems = (list: unknown): CatalogItem[] =>
  (Array.isArray(list) ? list : [])
    .map((x) => ({ id: String((x as any)?.id ?? "").trim(), name: String((x as any)?.name ?? "").trim() }))
    .filter((x) => x.id && x.name);