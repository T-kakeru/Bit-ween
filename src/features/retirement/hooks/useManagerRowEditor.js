import { useCallback } from "react";
import { mergeEditedRows } from "@/features/retirement/logic/managerRowEditor.logic";
import { updateEmployee } from "@/services/employee/employeesService";
import { isSupabaseConfigured } from "@/services/common/supabaseClient";

const EDITABLE_KEYS = [
  "社員ID",
  "部署",
  "名前",
  "性別",
  "生年月日",
  "入社日",
  "退職日",
  "ステータス",
  "退職理由",
  "備考",
  "当時のクライアント",
];

const normalizeComparableValue = (value, normalizeCell) => {
  const normalized = normalizeCell ? normalizeCell(value) : value;
  return String(normalized ?? "").trim();
};

const hasEditableChange = ({ originalRow, draftRow, normalizeCell }) => {
  for (const key of EDITABLE_KEYS) {
    const fromValue = normalizeComparableValue(originalRow?.[key], normalizeCell);
    const toValue = normalizeComparableValue(draftRow?.[key], normalizeCell);
    if (fromValue !== toValue) return true;
  }
  return false;
};

// 編集結果を行データへ反映するためのフック
const useManagerRowEditor = ({ columns, normalizeCell, setRows }) => {
  const saveRows = useCallback(
    async (draftRows, originalRows) => {
      if (!setRows) return;

      const previousRows = Array.isArray(originalRows) ? originalRows : [];

      if (isSupabaseConfigured()) {
        const originalMap = new Map(previousRows.map((row) => [String(row?.id), row]));
        const changedRows = (draftRows ?? []).filter((draftRow) => {
          const originalRow = originalMap.get(String(draftRow?.id));
          if (!originalRow) return false;
          return hasEditableChange({ originalRow, draftRow, normalizeCell });
        });

        for (const draftRow of changedRows) {
          const originalRow = originalMap.get(String(draftRow?.id));
          const originalEmployeeId = String(originalRow?.id ?? "").trim();
          const originalEmployeeCode = String(originalRow?.["社員ID"] ?? "").trim();

          const result = await updateEmployee({
            originalEmployeeId,
            originalEmployeeCode,
            employeeCode: String(draftRow?.["社員ID"] ?? "").trim(),
            fullName: String(draftRow?.["名前"] ?? "").trim(),
            gender: String(draftRow?.["性別"] ?? "").trim() || null,
            birthDate: String(draftRow?.["生年月日"] ?? "").trim() || null,
            joinDate: String(draftRow?.["入社日"] ?? "").trim() || null,
            retireDate: String(draftRow?.["退職日"] ?? "").trim() || null,
            departmentName: String(draftRow?.["部署"] ?? "").trim(),
            workStatusName: String(draftRow?.["ステータス"] ?? "").trim(),
            clientName: String(draftRow?.["当時のクライアント"] ?? "").trim() || null,
            retirementReasonName: String(draftRow?.["退職理由"] ?? "").trim() || null,
            retirementReasonText: String(draftRow?.["退職理由"] ?? "").trim() || null,
          });

          if (!result.ok) {
            return { ok: false, message: result.message };
          }
        }
      }

      setRows((prev) => {
        return mergeEditedRows({ prevRows: prev, draftRows, columns, normalizeCell });
      });

      return { ok: true };
    },
    [columns, normalizeCell, setRows]
  );

  return { saveRows };
};

export default useManagerRowEditor;
