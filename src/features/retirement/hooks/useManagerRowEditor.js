import { useCallback } from "react";
import { mergeEditedRows } from "@/features/retirement/logic/managerRowEditor.logic";

// 編集結果を行データへ反映するためのフック
const useManagerRowEditor = ({ columns, normalizeCell, setRows }) => {
  const saveRows = useCallback(
    (draftRows) => {
      if (!setRows) return;

      setRows((prev) => {
        return mergeEditedRows({ prevRows: prev, draftRows, columns, normalizeCell });
      });
    },
    [columns, normalizeCell, setRows]
  );

  return { saveRows };
};

export default useManagerRowEditor;
