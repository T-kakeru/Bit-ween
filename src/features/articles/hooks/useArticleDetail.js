// 記事の詳細表示の状態管理を行う。

import { useCallback, useRef, useState } from "react";

const useArticleDetail = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const listScrollRef = useRef(0);

  const openArticle = useCallback((article) => {
    listScrollRef.current = window.scrollY;
    setSelectedArticle(article);
  }, []);

  const closeArticle = useCallback(() => {
    setSelectedArticle(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: listScrollRef.current, behavior: "instant" });
    });
  }, []);

  return {
    selectedArticle,
    openArticle,
    closeArticle,
  };
};

export default useArticleDetail;
