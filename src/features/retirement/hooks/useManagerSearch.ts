import { useMemo, useState } from "react";
import { applyManagerSearch } from "@/features/retirement/logic/managerSearch.logic";
import type { ManagerRow } from "@/features/retirement/types";

// 遉ｾ蜩｡讀懃ｴ｢・亥錐蜑・or ID・・
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
