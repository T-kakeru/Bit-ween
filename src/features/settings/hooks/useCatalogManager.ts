import { useEffect, useMemo, useRef, useState } from "react";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";
import {
  fetchWorkStatusNames,
} from "@/services/masterData/masterDataService";
import type { CatalogItem, CatalogKey } from "@/shared/logic/catalogStorage";
import { isSupabaseConfigured } from "@/services/common/supabaseClient";
import { listDepartments, addDepartmentToSupabase, updateDepartmentInSupabase, deleteDepartmentFromSupabase } from "@/services/department/departmentService";
import { listClients, addClientToSupabase, updateClientInSupabase, deleteClientFromSupabase } from "@/services/client/clientService";
import {
  hasDuplicateNames,
  isTempId,
  normalizeName,
  toWorkStatusItems,
  validateCatalogName,
  type CatalogItemLabel,
} from "@/shared/logic/catalogValidation";

type UseCatalogManagerParams = {
  keyName: CatalogKey;
  itemLabel: CatalogItemLabel;
  readOnly?: boolean;
};

export const useCatalogManager = ({ keyName, itemLabel, readOnly = false }: UseCatalogManagerParams) => {
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

  const getEditingItems = () => sessionItems ?? items;

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraftName("");
    setEditError(null);
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

  const handleNewNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
    if (addError) setAddError(null);
    if (saveError) setSaveError(null);
  };

  const handleEditDraftNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditDraftName(event.target.value);
    if (editError) setEditError(null);
    if (saveError) setSaveError(null);
  };

  const shouldShowList = readOnly || isOpen;
  const displayItems = readOnly ? items : sessionItems ?? items;

  const itemCount = useMemo(() => items.length, [items.length]);

  return {
    isOpen,
    isSaving,
    saveError,
    newName,
    addError,
    editingId,
    editDraftName,
    editError,
    displayItems,
    shouldShowList,
    itemCount,
    handleOpenManage,
    handleCancelManage,
    handleSaveManage,
    handleAdd,
    startEdit,
    cancelEdit,
    deleteItem,
    handleSaveEdit,
    handleNewNameChange,
    handleEditDraftNameChange,
  };
};
