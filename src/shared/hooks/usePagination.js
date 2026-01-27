import { useCallback, useMemo, useState } from "react";

const usePagination = ({ initialPage = 1, totalItems = 0, pageSize = 10 } = {}) => {
  const [page, setPage] = useState(initialPage);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems, pageSize]);

  const next = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prev = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    page,
    setPage,
    totalPages,
    next,
    prev,
  };
};

export default usePagination;
