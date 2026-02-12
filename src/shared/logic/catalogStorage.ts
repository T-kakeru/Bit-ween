// ローカルテスト用のカタログデータ保存・取得ロジック
export type CatalogKey = "departments" | "clients" | "workStatuses";

export type CatalogItem = {
  id: string;
  name: string;
};

const STORAGE_PREFIX = "bit_ween.settings.catalog.";

const normalizeItems = (raw: unknown): CatalogItem[] => {
  if (!Array.isArray(raw)) return [];

// 重複するIDを持つアイテムを排除し、IDと名前の両方が存在するアイテムのみを保持します。
  const list = raw
    .map((x) => ({ id: String((x as any)?.id ?? "").trim(), name: String((x as any)?.name ?? "").trim() }))
    .filter((x) => x.id && x.name);

  const seen = new Set<string>();
  const unique: CatalogItem[] = [];
  for (const item of list) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
};

const getStorageKey = (keyName: CatalogKey) => `${STORAGE_PREFIX}${keyName}`;

export const loadCatalogItems = (keyName: CatalogKey, fallbackItems: CatalogItem[]): CatalogItem[] => {
  if (typeof window === "undefined") return fallbackItems;
  try {
    const raw = localStorage.getItem(getStorageKey(keyName));
    if (!raw) return fallbackItems;
    const items = normalizeItems(JSON.parse(raw));
    return items.length > 0 ? items : fallbackItems;
  } catch {
    return fallbackItems;
  }
};

export const saveCatalogItems = (keyName: CatalogKey, items: CatalogItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(keyName), JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const getCatalogNames = (keyName: CatalogKey, fallbackItems: CatalogItem[]): string[] => {
  const items = loadCatalogItems(keyName, fallbackItems);
  return items.map((x) => x.name);
};

export const addCatalogNameIfMissing = ({
  keyName,
  name,
  fallbackItems,
  idPrefix,
}: {
  keyName: CatalogKey;
  name: string;
  fallbackItems: CatalogItem[];
  idPrefix: string;
}): CatalogItem[] => {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return loadCatalogItems(keyName, fallbackItems);

  const items = loadCatalogItems(keyName, fallbackItems);
  if (items.some((x) => x.name === trimmed)) return items;

  const next: CatalogItem = { id: `${idPrefix}${Date.now()}`, name: trimmed };
  const updated = [...items, next];
  saveCatalogItems(keyName, updated);
  return updated;
};

export const renameCatalogName = ({
  keyName,
  prevName,
  nextName,
  fallbackItems,
}: {
  keyName: CatalogKey;
  prevName: string;
  nextName: string;
  fallbackItems: CatalogItem[];
}): { ok: true; items: CatalogItem[] } | { ok: false; message: string; items: CatalogItem[] } => {
  const prevTrimmed = String(prevName ?? "").trim();
  const nextTrimmed = String(nextName ?? "").trim();
  const items = loadCatalogItems(keyName, fallbackItems);

  if (!prevTrimmed) return { ok: false, message: "変更前の名称が不正です", items };
  if (!nextTrimmed) return { ok: false, message: "名称は必須です", items };
  if (prevTrimmed === nextTrimmed) return { ok: true, items };
  if (!items.some((x) => x.name === prevTrimmed)) {
    return { ok: false, message: "対象のデータが見つかりません", items };
  }
  if (items.some((x) => x.name === nextTrimmed)) {
    return { ok: false, message: "同じ名称が既に存在します", items };
  }

  const updated = items.map((x) => (x.name === prevTrimmed ? { ...x, name: nextTrimmed } : x));
  saveCatalogItems(keyName, updated);
  return { ok: true, items: updated };
};

export const deleteCatalogName = ({
  keyName,
  name,
  fallbackItems,
}: {
  keyName: CatalogKey;
  name: string;
  fallbackItems: CatalogItem[];
}): CatalogItem[] => {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return loadCatalogItems(keyName, fallbackItems);
  const items = loadCatalogItems(keyName, fallbackItems);
  const updated = items.filter((x) => x.name !== trimmed);
  saveCatalogItems(keyName, updated);
  return updated;
};
