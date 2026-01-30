import { useEffect, useMemo, useState } from "react";
import {
  buildPendingChanges,
  buildRowMapById,
} from "@/features/manager/logic/employeeEdit.logic";

// EditableEmployeeTable の編集セッションを管理（状態管理の責務）
const useEditableEmployeeTableSession = ({ rows, columns, normalizeCell, onSaveRows }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftRows, setDraftRows] = useState(() => (rows ?? []).map((row) => ({ ...row })));

  // 確認モーダル
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]);

  const originalRowMap = useMemo(() => buildRowMapById(rows), [rows]);

  // 編集モードでないときは常に最新のrowsへ同期
  useEffect(() => {
    if (!isEditing) {
      setDraftRows((rows ?? []).map((row) => ({ ...row })));
    }
  }, [isEditing, rows]);

  const startEditing = () => {
    setDraftRows((rows ?? []).map((row) => ({ ...row })));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftRows((rows ?? []).map((row) => ({ ...row })));
    setIsEditing(false);
  };

  const changeCell = (rowId, key, value) => {
    setDraftRows((prev) => prev.map((row) => (String(row.id) === String(rowId) ? { ...row, [key]: value } : row)));
  };

  const requestSave = () => {
    const changes = buildPendingChanges({
      draftRows,
      originalRows: rows,
      columns,
      normalizeCell,
    });

    if (changes.length === 0) {
      setIsEditing(false);
      return;
    }

    setPendingChanges(changes);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
  };

  const confirmSave = () => {
    if (onSaveRows) onSaveRows(draftRows.map((row) => ({ ...row })));
    setIsConfirmOpen(false);
    setIsEditing(false);
  };

  return {
    // state
    isEditing,
    draftRows,
    originalRowMap,
    isConfirmOpen,
    pendingChanges,

    // actions
    startEditing,
    cancelEditing,
    changeCell,
    requestSave,
    closeConfirm,
    confirmSave,

    // setters (必要最低限のみ)
    setDraftRows,
  };
};

export default useEditableEmployeeTableSession;
