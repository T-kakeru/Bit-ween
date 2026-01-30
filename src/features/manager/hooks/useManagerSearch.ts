import { useMemo, useState } from "react";
import { applyManagerSearch } from "@/features/manager/logic/managerSearch.logic";
import type { ManagerRow } from "@/features/manager/types";

// 社員検索（名前 or ID）
const useManagerSearch = (rows: ManagerRow[]) => {
  const [query, setQuery] = useState<string>("");

  const searchedRows = useMemo(() => {
    return applyManagerSearch(rows, query);
  }, [query, rows]);

  return useMemo(
    () => ({
      query,
      setQuery,
      searchedRows,
    }),
    [query, searchedRows]
  );
};

export default useManagerSearch;
