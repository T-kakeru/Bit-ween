import { useEffect, useMemo, useState } from "react";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";
import departments from "@/shared/data/mock/departments.json";
import clients from "@/shared/data/mock/clients.json";
import workStatuses from "@/shared/data/mock/workStatuses.json";

type CatalogKey = "departments" | "clients" | "workStatuses";

type CatalogItem = {
  id: string;
  name: string;
};

const STORAGE_PREFIX = "bit_ween.settings.catalog.";

const normalizeItems = (raw: unknown): CatalogItem[] => {
  if (!Array.isArray(raw)) return [];

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

const loadFromStorage = (storageKey: string): CatalogItem[] | null => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return normalizeItems(JSON.parse(raw));
  } catch {
    return null;
  }
};

type Props = {
  title: string;
  description: string;
  keyName: CatalogKey;
  itemLabel: "部署" | "稼働先" | "稼働状態";
  embedded?: boolean;
};

export const CatalogManagerSection = ({ title, description, keyName, itemLabel, embedded = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraftId, setEditDraftId] = useState("");
  const [editDraftName, setEditDraftName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const initialItems = useMemo<CatalogItem[]>(() => {
    const source =
      keyName === "departments"
        ? (departments as any)
        : keyName === "clients"
          ? (clients as any)
          : (workStatuses as any);
    return (Array.isArray(source) ? source : [])
      .map((x) => ({ id: String(x?.id ?? "").trim(), name: String(x?.name ?? "").trim() }))
      .filter((x) => x.id && x.name);
  }, [keyName]);

  const storageKey = useMemo(() => `${STORAGE_PREFIX}${keyName}`, [keyName]);

  const [items, setItems] = useState<CatalogItem[]>(() => {
    if (typeof window === "undefined") return initialItems;
    const stored = loadFromStorage(storageKey);
    return stored && stored.length > 0 ? stored : initialItems;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, storageKey]);

  const existsId = (id: string) => items.some((x) => x.id === id);

  const addItem = (next: CatalogItem): { ok: true } | { ok: false; message: string } => {
    const id = String(next.id ?? "").trim();
    const name = String(next.name ?? "").trim();
    if (!id) return { ok: false, message: "IDは必須です" };
    if (!name) return { ok: false, message: "名称は必須です" };
    if (existsId(id)) return { ok: false, message: "このIDは既に使用されています" };
    setItems((prev) => [...prev, { id, name }]);
    return { ok: true };
  };

  const updateItem = (prevId: string, next: CatalogItem): { ok: true } | { ok: false; message: string } => {
    const id = String(next.id ?? "").trim();
    const name = String(next.name ?? "").trim();
    if (!id) return { ok: false, message: "IDは必須です" };
    if (!name) return { ok: false, message: "名称は必須です" };
    if (id !== prevId && existsId(id)) return { ok: false, message: "このIDは既に使用されています" };
    setItems((prev) => prev.map((x) => (x.id === prevId ? { id, name } : x)));
    return { ok: true };
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditDraftId(item.id);
    setEditDraftName(item.name);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraftId("");
    setEditDraftName("");
    setEditError(null);
  };

  const handleAdd = () => {
    const result = addItem({ id: newId, name: newName });
    if (!result.ok) {
      setAddError(result.message);
      return;
    }
    setNewId("");
    setNewName("");
    setAddError(null);
  };

  const handleSaveEdit = (prevId: string) => {
    const result = updateItem(prevId, { id: editDraftId, name: editDraftName });
    if (!result.ok) {
      setEditError(result.message);
      return;
    }
    cancelEdit();
  };

  //
  const handleNewIdChange = (event: any) => {
    setNewId(event.target.value);
    if (addError) setAddError(null);
  };

  const handleNewNameChange = (event: any) => {
    setNewName(event.target.value);
    if (addError) setAddError(null);
  };

  const handleEditDraftIdChange = (event: any) => {
    setEditDraftId(event.target.value);
    if (editError) setEditError(null);
  };

  const handleEditDraftNameChange = (event: any) => {
    setEditDraftName(event.target.value);
    if (editError) setEditError(null);
  };

  const containerClassName = embedded
    ? `settings-master-item ${isOpen ? "is-open" : ""}`
    : `settings-panel settings-menu-card ${isOpen ? "is-open settings-menu-card-span" : ""}`;

  const content = (
    <>
      <div className="settings-menu-card-head">
        <div>
          <p className="settings-title">{title}</p>
          <TextCaption>{description}</TextCaption>
          <TextCaption className="mt-1">登録数: {items.length}</TextCaption>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="settings-action-button"
            onClick={toggleOpen}
            aria-expanded={isOpen}
          >
            {isOpen ? "閉じる" : "管理する"}
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className="px-6 pb-5">
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">新規{itemLabel}追加</div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                type="text"
                value={newId}
                onChange={handleNewIdChange}
                placeholder={`${itemLabel}ID（例: ${keyName === "departments" ? "dept-006" : keyName === "clients" ? "client-015" : "ws-001"}）`}
              />
              <Input
                type="text"
                value={newName}
                onChange={handleNewNameChange}
                placeholder={`${itemLabel}名`}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="settings-action-button"
                  onClick={handleAdd}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon src="/img/icon_file_add.png" alt="追加" />
                    追加
                  </span>
                </Button>
              </div>
            </div>
            {addError ? <p className="mt-2 text-xs text-rose-600">{addError}</p> : null}
          </div>

          <div className="mt-4 space-y-2">
            {items.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <TextCaption>まだ登録がありません。</TextCaption>
              </div>
            ) : null}

            {items.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Input
                            type="text"
                            value={editDraftId}
                            onChange={handleEditDraftIdChange}
                            placeholder={`${itemLabel}ID`}
                          />
                          <Input
                            type="text"
                            value={editDraftName}
                            onChange={handleEditDraftNameChange}
                            placeholder={`${itemLabel}名`}
                          />
                        </div>
                        {editError ? <p className="text-xs text-rose-600">{editError}</p> : null}
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-slate-900 truncate">{item.name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">ID: {item.id}</div>
                      </>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleSaveEdit(item.id)}>
                          保存
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          className="settings-cancel-button"
                          onClick={cancelEdit}
                        >
                          キャンセル
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(item)}
                          aria-label={`${itemLabel}を編集`}
                          title="編集"
                        >
                          <Icon src="/img/icon_edit.png" alt="編集" />
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          aria-label={`${itemLabel}を削除`}
                          title="削除"
                        >
                          <Icon name="×" alt="削除" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className={containerClassName}>{content}</div>;
  }

  return <Card className={containerClassName}>{content}</Card>;
};
