import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildPendingChanges,
  buildRowMapById,
  buildAgeFromBirthDate,
  buildRetireMonthLabelFromRetireDate,
  NON_EDITABLE_KEYS,
  toEditableValue,
  validateEditableCell,
} from "@/features/retirement/logic/employeeEdit.logic";
import clients from "@/shared/data/mock/clients.json";

const toNames = (list) =>
  (Array.isArray(list) ? list : [])
    .map((x) => String(x?.name ?? "").trim())
    .filter(Boolean);

// EditableEmployeeTable の編集セッションを管理（状態管理の責務）
const useEditableEmployeeTableSession = ({ rows, columns, normalizeCell, onSaveRows }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftRows, setDraftRows] = useState(() => (rows ?? []).map((row) => ({ ...row })));
  const [cellErrors, setCellErrors] = useState({});

  const [clientOptions, setClientOptions] = useState(() => toNames(clients));

  const addClientOption = useCallback((nextValue) => {
    const value = String(nextValue ?? "").trim();
    if (!value) return;
    setClientOptions((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }, []);

  // 確認モーダル
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]);

  const originalRowMap = useMemo(() => buildRowMapById(rows), [rows]);
  
  // 行のバリデーションをすべて実行して結果を state にセット
  const validateAllDraftRows = (rowsToValidate = draftRows) => {
    const nextErrors = {};

    for (const row of rowsToValidate ?? []) {
      const rowId = row?.id;
      if (rowId == null) continue;

      const rowErrors = {};
      for (const column of columns ?? []) {
        if (!column?.key) continue;
        if (NON_EDITABLE_KEYS.has(column.key)) continue;
        const message = validateEditableCell({ row, key: column.key, value: row?.[column.key] });
        if (message) rowErrors[column.key] = message;
      }

      if (Object.keys(rowErrors).length > 0) {
        nextErrors[String(rowId)] = rowErrors;
      }
    }

    setCellErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // 編集モードでない時は常に最新の rows へ同期
  useEffect(() => {
    if (!isEditing) {
      setDraftRows((rows ?? []).map((row) => ({ ...row })));
      setCellErrors({});
    }
  }, [isEditing, rows]);

  const startEditing = () => {
    const nextDraft = (rows ?? []).map((row) => {
      const nextRow = { ...row };

      // 表示用の「-」などを編集用の空文字へ寄せる（編集開始直後の誤エラー防止）
      for (const column of columns ?? []) {
        if (!column?.key) continue;
        if (NON_EDITABLE_KEYS.has(column.key)) continue;
        nextRow[column.key] = toEditableValue(nextRow[column.key], normalizeCell);
      }

      // 自動計算（編集不可列）は常に最新へ揃える
      nextRow["退職月"] = buildRetireMonthLabelFromRetireDate(nextRow["退職日"]);
      nextRow["年齢"] = buildAgeFromBirthDate(nextRow["生年月日"]);
      return nextRow;
    });
    setDraftRows(nextDraft);
    setIsEditing(true);
    // 既存値に想定外が混ざっていても、編集開始時点で表示できるようにする
    validateAllDraftRows(nextDraft);
  };

  const cancelEditing = () => {
    setDraftRows((rows ?? []).map((row) => ({ ...row })));
    setCellErrors({});
    setIsEditing(false);
  };

  // セル編集時のバリデーション更新
  const updateCellError = (rowId, key, row, value) => {
    const message = validateEditableCell({ row, key, value });
    setCellErrors((prev) => {
      const next = { ...prev };
      const rowKey = String(rowId);
      const rowErrors = { ...(next[rowKey] || {}) };
      if (message) {
        rowErrors[key] = message;
      } else {
        delete rowErrors[key];
      }
      if (Object.keys(rowErrors).length === 0) {
        delete next[rowKey];
      } else {
        next[rowKey] = rowErrors;
      }
      return next;
    });
  };

  const changeCell = (rowId, key, value) => {
    setDraftRows((prev) =>
      prev.map((row) => {
        if (String(row.id) !== String(rowId)) return row;

        const nextRow = { ...row, [key]: value };

        // 在籍状態は is_active を唯一の判定根拠にする
        if (key === "在籍状態") {
          nextRow.is_active = value === "在籍中";
        }

        // 自動計算（編集不可列）
        if (key === "退職日") {
          nextRow["退職月"] = buildRetireMonthLabelFromRetireDate(value);
        }
        if (key === "生年月日") {
          nextRow["年齢"] = buildAgeFromBirthDate(value);
        }

        updateCellError(rowId, key, nextRow, value);
        if (key === "入社日") {
          updateCellError(rowId, "退職日", nextRow, nextRow["退職日"]);
        }
        if (key === "生年月日") {
          updateCellError(rowId, "入社日", nextRow, nextRow["入社日"]);
        }
        return nextRow;
      })
    );
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

    // 送信直前の最終チェック（UI入力制限のバイパス対策）
    // ここでエラーがあれば、確認モーダルは開かずにセル直下のエラー表示へ誘導する
    if (!validateAllDraftRows()) {
      return;
    }

    setPendingChanges(changes);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
  };

  const confirmSave = () => {
    // 念のため確定直前も再チェック（モーダル表示中に値が変わったケース等）
    if (!validateAllDraftRows()) {
      setIsConfirmOpen(false);
      return;
    }
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
    cellErrors,
    hasErrors: Object.keys(cellErrors ?? {}).length > 0,

    // actions
    startEditing,
    cancelEditing,
    changeCell,
    requestSave,
    closeConfirm,
    confirmSave,

    getCellError: (rowId, key) => cellErrors?.[String(rowId)]?.[key],

    clientOptions,
    addClientOption,

    // setters (必要最低限のみ)
    setDraftRows,
  };
};

export default useEditableEmployeeTableSession;
