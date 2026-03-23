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
import { addClientToSupabase, listClientNames } from "@/services/client/clientService";
import {
  fetchDepartmentNames,
  fetchRetirementReasonNames,
  fetchWorkStatusNames,
} from "@/services/masterData/masterDataService";

// EditableEmployeeTable の編集セッションを管理（状態管理の責務）
const useEditableEmployeeTableSession = ({ rows, columns, normalizeCell, onSaveRows, onDeleteRows }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftRows, setDraftRows] = useState(() => (rows ?? []).map((row) => ({ ...row })));
  const [cellErrors, setCellErrors] = useState({});
  const [selectedRowIds, setSelectedRowIds] = useState({});

  const [clientOptions, setClientOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]);

  useEffect(() => {
    let disposed = false;

    const loadOptions = async () => {
      const [clients, departments, statuses, reasons] = await Promise.all([
        listClientNames(),
        fetchDepartmentNames(),
        fetchWorkStatusNames(),
        fetchRetirementReasonNames(),
      ]);
      if (disposed) return;
      setClientOptions(Array.isArray(clients) ? clients : []);
      setDepartmentOptions(Array.isArray(departments) ? departments : []);
      setStatusOptions(Array.isArray(statuses) ? statuses : []);
      setReasonOptions(Array.isArray(reasons) ? reasons : []);
    };

    void loadOptions();

    return () => {
      disposed = true;
    };
  }, []);

  const addClientOption = useCallback(async (nextValue) => {
    const value = String(nextValue ?? "").trim();
    if (!value) return;

    try {
      const result = await addClientToSupabase(value);
      if (result.ok) {
        const names = await listClientNames();
        setClientOptions(Array.isArray(names) ? names : []);
        return;
      }
    } catch {
      // fallback to local option
    }

    setClientOptions((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }, []);

  // 確認モーダル
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState("save");
  const [pendingChanges, setPendingChanges] = useState([]);
  const [pendingDeleteRows, setPendingDeleteRows] = useState([]);
  const [saveError, setSaveError] = useState("");

  const originalRowMap = useMemo(() => buildRowMapById(rows), [rows]);

  const buildRowErrors = (rowsToValidate = []) => {
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

    return nextErrors;
  };

  // 行のバリデーションを実行して結果を state にセット
  const validateAllDraftRows = (rowsToValidate = draftRows) => {
    const nextErrors = buildRowErrors(rowsToValidate);

    setCellErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateSelectedDraftRows = (selectedState = selectedRowIds, rowsToValidate = draftRows) => {
    const selectedRows = (rowsToValidate ?? []).filter((row) => Boolean(selectedState?.[String(row?.id)]));
    const nextErrors = buildRowErrors(selectedRows);
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
    setSelectedRowIds({});
    setSaveError("");
    setCellErrors({});
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftRows((rows ?? []).map((row) => ({ ...row })));
    setCellErrors({});
    setSelectedRowIds({});
    setSaveError("");
    setIsEditing(false);
  };

  const toggleRowSelection = (rowId) => {
    const key = String(rowId ?? "");
    if (!key) return;
    setSelectedRowIds((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };

      if (!next[key]) {
        const selectedRows = (draftRows ?? []).filter((row) => Boolean(next[String(row?.id)]));
        setCellErrors(buildRowErrors(selectedRows));
      } else {
        validateSelectedDraftRows(next, draftRows);
      }

      return next;
    });
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
    const rowKey = String(rowId ?? "");
    if (!selectedRowIds[rowKey]) return;

    setDraftRows((prev) =>
      prev.map((row) => {
        if (String(row.id) !== String(rowId)) return row;

        const nextRow = { ...row, [key]: value };

        // 自動計算（編集不可列）
        if (key === "退職日") {
          nextRow["退職月"] = buildRetireMonthLabelFromRetireDate(value);

          // 退職日が入っていれば「退職扱い」
          const text = String(value ?? "").trim();
          nextRow.is_active = !text || text === "-";
        }
        if (key === "生年月日") {
          nextRow["年齢"] = buildAgeFromBirthDate(value);
        }

        updateCellError(rowId, key, nextRow, value);

        // 退職日 ⇄ 退職理由 は相互に必須条件があるため、どちらを編集しても両方のエラーを更新する
        if (key === "退職日") {
          updateCellError(rowId, "退職理由", nextRow, nextRow["退職理由"]);
        }
        if (key === "退職理由") {
          updateCellError(rowId, "退職日", nextRow, nextRow["退職日"]);
        }

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
    if (!validateSelectedDraftRows()) {
      return;
    }

    setConfirmMode("save");
    setPendingDeleteRows([]);
    setPendingChanges(changes);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmMode("save");
    setPendingDeleteRows([]);
    setIsConfirmOpen(false);
  };

  const confirmSave = async () => {
    // 念のため確定直前も再チェック（モーダル表示中に値が変わったケース等）
    if (!validateSelectedDraftRows()) {
      setIsConfirmOpen(false);
      return;
    }

    if (onSaveRows) {
      const result = await onSaveRows(
        draftRows.map((row) => ({ ...row })),
        rows
      );
      if (result?.ok === false) {
        setSaveError(String(result.message || "保存に失敗しました。"));
        setIsConfirmOpen(false);
        return;
      }
    }

    setSaveError("");
    setPendingChanges([]);
    setPendingDeleteRows([]);
    setConfirmMode("save");
    setIsConfirmOpen(false);
    setIsEditing(false);
    setSelectedRowIds({});
  };

  const requestDelete = () => {
    const targets = (draftRows ?? []).filter((row) => Boolean(selectedRowIds?.[String(row?.id)]));
    if (targets.length === 0) return;

    setPendingDeleteRows(
      targets.map((row) => ({
        id: String(row?.id ?? ""),
        employeeId: String(row?.["社員ID"] ?? "").trim(),
        name: String(row?.["名前"] ?? "社員").trim() || "社員",
      }))
    );
    setPendingChanges([]);
    setConfirmMode("delete");
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const targetIds = pendingDeleteRows.map((row) => row.id).filter(Boolean);
    if (targetIds.length === 0) {
      setIsConfirmOpen(false);
      return;
    }

    if (onDeleteRows) {
      const result = await onDeleteRows(targetIds);
      if (result?.ok === false) {
        setSaveError(String(result.message || "削除に失敗しました。"));
        setIsConfirmOpen(false);
        return;
      }
    }

    setSaveError("");
    setPendingChanges([]);
    setPendingDeleteRows([]);
    setConfirmMode("save");
    setSelectedRowIds({});
    setIsConfirmOpen(false);
    setIsEditing(false);
  };

  return {
    // state
    isEditing,
    draftRows,
    originalRowMap,
    isConfirmOpen,
    confirmMode,
    pendingChanges,
    pendingDeleteRows,
    cellErrors,
    hasErrors: Object.keys(cellErrors ?? {}).length > 0,
    selectedRowIds,
    selectedCount: Object.values(selectedRowIds ?? {}).filter(Boolean).length,
    saveError,

    // actions
    startEditing,
    cancelEditing,
    changeCell,
    requestSave,
    requestDelete,
    toggleRowSelection,
    closeConfirm,
    confirmSave,
    confirmDelete,

    getCellError: (rowId, key) => cellErrors?.[String(rowId)]?.[key],

    clientOptions,
    departmentOptions,
    statusOptions,
    reasonOptions,
    addClientOption,

    // setters (必要最低限のみ)
    setDraftRows,
  };
};

export default useEditableEmployeeTableSession;
