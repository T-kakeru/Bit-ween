import { useEffect, useMemo, useRef, useState } from "react";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";
import {
  fetchWorkStatusNames,
} from "@/services/masterData/masterDataService";
import type { CatalogItem, CatalogKey } from "@/shared/logic/catalogStorage";
import { isSupabaseConfigured } from "@/services/common/supabaseClient";
import { listDepartments, addDepartmentToSupabase, updateDepartmentInSupabase, deleteDepartmentFromSupabase } from "@/services/department/departmentService";
import { listClients, addClientToSupabase, updateClientInSupabase, deleteClientFromSupabase } from "@/services/client/clientService";

const WORK_STATUS_ID_PREFIX = "ws";

const toWorkStatusItems = (names: string[]): CatalogItem[] =>
  (Array.isArray(names) ? names : [])
    .map((name) => String(name ?? "").trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: `${WORK_STATUS_ID_PREFIX}-${String(index + 1).padStart(3, "0")}`,
      name,
    }));

const normalizeName = (value: unknown) => String(value ?? "").trim();

const validateCatalogName = ({
  itemLabel,
  keyName,
  name,
}: {
  itemLabel: "部署" | "稼働先" | "稼働状態";
  keyName: CatalogKey;
  name: string;
}): { ok: true } | { ok: false; message: string } => {
  const trimmed = normalizeName(name);
  if (!trimmed) return { ok: false, message: ERROR_MESSAGES.MASTER.NAME_REQUIRED };

  const maxLength =
    keyName === "departments" ? 100 : keyName === "clients" ? 150 : 100;
  if (trimmed.length > maxLength) {
    return { ok: false, message: ERROR_MESSAGES.CSV.EMPLOYEE.MAX_LENGTH(itemLabel, maxLength) };
  }

  return { ok: true };
};

const hasDuplicateNames = (items: CatalogItem[]) => {
  const seen = new Set<string>();
  for (const item of items) {
    const key = normalizeName(item.name);
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
};

const isTempId = (id: string) => String(id ?? "").startsWith("tmp:");

type Props = {
  title: string;
  description: string;
  keyName: CatalogKey;
  itemLabel: "部署" | "稼働先" | "稼働状態";
  embedded?: boolean;
  readOnly?: boolean;
};

export const CatalogManagerSection = ({ title, description, keyName, itemLabel, embedded = false, readOnly = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionItems, setSessionItems] = useState<CatalogItem[] | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraftName, setEditDraftName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const [items, setItems] = useState<CatalogItem[]>([]);

  const tempIdSeqRef = useRef(1);
  const createTempId = () => {
    const seq = tempIdSeqRef.current++;
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      return `tmp:${(crypto as any).randomUUID()}`;
    }
    return `tmp:${Date.now()}-${seq}`;
  };

  const loadItems = async (): Promise<CatalogItem[]> => {
    if (keyName === "departments") {
      return await listDepartments();
    }
    if (keyName === "clients") {
      return await listClients();
    }

    const names = await fetchWorkStatusNames();
    return toWorkStatusItems(names);
  };

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      if (disposed) return;
      const loaded = await loadItems();
      if (disposed) return;
      setItems(Array.isArray(loaded) ? loaded : []);
    };

    void load();
    return () => {
      disposed = true;
    };
  }, [keyName]);

  const getEditingItems = () => (sessionItems ?? items);

  const existsId = (id: string, targetItems: CatalogItem[]) => targetItems.some((x) => x.id === id);

  const buildNextId = (targetItems: CatalogItem[]) => {
    const prefix = keyName === "departments" ? "dept" : keyName === "clients" ? "client" : "ws";
    let index = targetItems.length + 1;
    while (existsId(`${prefix}-${String(index).padStart(3, "0")}`, targetItems)) {
      index += 1;
    }
    return `${prefix}-${String(index).padStart(3, "0")}`;
  };

  const addItem = (next: Pick<CatalogItem, "name">): { ok: true } | { ok: false; message: string } => {
    const baseItems = getEditingItems();
    const name = normalizeName(next.name);
    const validated = validateCatalogName({ itemLabel, keyName, name });
    if (!validated.ok) return validated;

    setSessionItems([...baseItems, { id: createTempId(), name }]);
    return { ok: true };
  };

  const updateItem = (prevId: string, next: Pick<CatalogItem, "name">): { ok: true } | { ok: false; message: string } => {
    const baseItems = getEditingItems();
    const name = normalizeName(next.name);
    const validated = validateCatalogName({ itemLabel, keyName, name });
    if (!validated.ok) return validated;

    setSessionItems(baseItems.map((x) => (x.id === prevId ? { ...x, name } : x)));
    return { ok: true };
  };

  const deleteItem = (id: string) => {
    const baseItems = getEditingItems();
    setSessionItems(baseItems.filter((x) => x.id !== id));
    if (editingId === id) {
      cancelEdit();
    }
  };

  const handleOpenManage = () => {
    setSessionItems([...items]);
    setIsOpen(true);
    setSaveError(null);
  };

  const handleCancelManage = () => {
    setSessionItems(null);
    setIsOpen(false);
    setNewName("");
    setAddError(null);
    setSaveError(null);
    cancelEdit();
  };

  const handleSaveManage = async () => {
    if (readOnly) return;
    if (!isSupabaseConfigured()) {
      setSaveError(ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED_SUPABASE_ENV);
      return;
    }

    const nextItems = sessionItems ?? items;
    const trimmedItems = nextItems.map((x) => ({ ...x, name: normalizeName(x.name) })).filter((x) => x.name);

    if (hasDuplicateNames(trimmedItems)) {
      setSaveError(ERROR_MESSAGES.MASTER.NAME_ALREADY_EXISTS);
      return;
    }

    for (const x of trimmedItems) {
      const validated = validateCatalogName({ itemLabel, keyName, name: x.name });
      if (!validated.ok) {
        setSaveError(validated.message);
        return;
      }
    }

    const confirmed = window.confirm(
      "保存すると、すでに登録されている関連データにも影響する可能性があります。保存してよろしいですか？",
    );
    if (!confirmed) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const beforeById = new Map(items.map((x) => [x.id, x] as const));
      const afterById = new Map(trimmedItems.map((x) => [x.id, x] as const));

      const deleted = items.filter((x) => !afterById.has(x.id));
      const added = trimmedItems.filter((x) => isTempId(x.id));
      const updated = trimmedItems.filter((x) => {
        if (isTempId(x.id)) return false;
        const before = beforeById.get(x.id);
        return before ? normalizeName(before.name) !== normalizeName(x.name) : false;
      });

      if (keyName === "departments") {
        for (const x of added) {
          const r = await addDepartmentToSupabase(x.name);
          if (!r.ok) throw new Error(r.message);
        }
        for (const x of updated) {
          const r = await updateDepartmentInSupabase({ id: x.id, name: x.name });
          if (!r.ok) throw new Error(r.message);
        }
        for (const x of deleted) {
          const r = await deleteDepartmentFromSupabase(x.id);
          if (!r.ok) throw new Error(r.message);
        }
      }

      if (keyName === "clients") {
        for (const x of added) {
          const r = await addClientToSupabase(x.name);
          if (!r.ok) throw new Error(r.message);
        }
        for (const x of updated) {
          const r = await updateClientInSupabase({ id: x.id, name: x.name });
          if (!r.ok) throw new Error(r.message);
        }
        for (const x of deleted) {
          const r = await deleteClientFromSupabase(x.id);
          if (!r.ok) throw new Error(r.message);
        }
      }

      const refreshed = await loadItems();
      setItems(Array.isArray(refreshed) ? refreshed : []);

      setSessionItems(null);
      setIsOpen(false);
      setNewName("");
      setAddError(null);
      cancelEdit();
    } catch (err: any) {
      setSaveError(String(err?.message ?? err ?? ERROR_MESSAGES.SYSTEM.UPDATE_FAILED_GENERIC));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditDraftName(item.name);
    setEditError(null);
    if (saveError) setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraftName("");
    setEditError(null);
  };

  const handleAdd = () => {
    const result = addItem({ name: newName });
    if (!result.ok) {
      setAddError(result.message);
      return;
    }
    setNewName("");
    setAddError(null);
    if (saveError) setSaveError(null);
  };

  const handleSaveEdit = (prevId: string) => {
    const result = updateItem(prevId, { name: editDraftName });
    if (!result.ok) {
      setEditError(result.message);
      return;
    }
    cancelEdit();
    if (saveError) setSaveError(null);
  };

  //
  const handleNewNameChange = (event: any) => {
    setNewName(event.target.value);
    if (addError) setAddError(null);
    if (saveError) setSaveError(null);
  };

  const handleEditDraftNameChange = (event: any) => {
    setEditDraftName(event.target.value);
    if (editError) setEditError(null);
    if (saveError) setSaveError(null);
  };

  const shouldShowList = readOnly || isOpen;
  const displayItems = readOnly ? items : sessionItems ?? items;

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
          {readOnly ? null : isOpen ? (
            <>
              <Button
                type="button"
                variant="danger"
                size="md"
                className="settings-action-button settings-cancel-button"
                onClick={handleCancelManage}
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="settings-action-button"
                onClick={handleSaveManage}
                disabled={isSaving}
              >
                保存
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="md"
              className="settings-action-button"
              onClick={handleOpenManage}
              aria-expanded={isOpen}
            >
              管理する
            </Button>
          )}
        </div>
      </div>

      {shouldShowList ? (
        <div className="px-6 pb-5">
          {saveError ? <p className="mt-3 text-xs text-rose-600">{saveError}</p> : null}
          {!readOnly ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">新規{itemLabel}追加</div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  type="text"
                  value={newName}
                  onChange={handleNewNameChange}
                  placeholder={`${itemLabel}名`}
                  disabled={isSaving}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="settings-action-button"
                    onClick={handleAdd}
                    disabled={isSaving}
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
          ) : null}

          <div className="mt-4 space-y-2">
            {displayItems.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <TextCaption>まだ登録がありません。</TextCaption>
              </div>
            ) : null}

            {displayItems.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-2">
                          <Input
                            type="text"
                            value={editDraftName}
                            onChange={handleEditDraftNameChange}
                            placeholder={`${itemLabel}名`}
                            disabled={isSaving}
                          />
                        </div>
                        {editError ? <p className="text-xs text-rose-600">{editError}</p> : null}
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-slate-900 truncate">{item.name}</div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {readOnly ? null : isEditing ? (
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
                          className="settings-master-icon-button"
                          onClick={() => startEdit(item)}
                          aria-label={`${itemLabel}を編集`}
                          title="編集"
                          disabled={isSaving}
                        >
                          <Icon src="/img/icon_edit.png" alt="編集" />
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          className="settings-master-icon-button"
                          onClick={() => deleteItem(item.id)}
                          aria-label={`${itemLabel}を削除`}
                          title="削除"
                          disabled={isSaving}
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
