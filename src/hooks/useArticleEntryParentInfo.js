import { useCallback, useMemo, useState } from "react";
import { DEFAULT_ARTICLE_FILTER_ID } from "../components/ArticleFilter";

const DEFAULT_ARTICLE_ENTRY = {
  filterId: DEFAULT_ARTICLE_FILTER_ID,
  hideFilterUI: false,
  breadcrumbLabel: null,
};

// 記事画面の「親情報」（入口状態）を管理する Hook。
//
// 重要: filterId のような入口状態は複数の子で扱う為「親」が持ちます。
export const useArticleEntryParentInfo = ({ setActiveNav, setIsSidebarOpen }) => {
  const [articleEntry, setArticleEntry] = useState(DEFAULT_ARTICLE_ENTRY);

  const resetArticleEntry = useCallback(() => {
    setArticleEntry(DEFAULT_ARTICLE_ENTRY);
  }, []);

  const openArticles = useCallback(() => {
    resetArticleEntry();
    setActiveNav("記事");
    setIsSidebarOpen(false);
  }, [resetArticleEntry, setActiveNav, setIsSidebarOpen]);

  const openArticlesWithFilter = useCallback(
    (options) => {
      const filterId = options?.filterId ?? DEFAULT_ARTICLE_FILTER_ID;
      const hideFilterUI = Boolean(options?.hideFilterUI);
      const breadcrumbLabel = options?.breadcrumbLabel ?? null;
      setArticleEntry({ filterId, hideFilterUI, breadcrumbLabel });
      setActiveNav("記事");
      setIsSidebarOpen(false);
    },
    [setActiveNav, setIsSidebarOpen]
  );

  const articleScreenKey = useMemo(
    () =>
      `articles-${articleEntry.filterId ?? DEFAULT_ARTICLE_FILTER_ID}-${
        articleEntry.hideFilterUI ? "nofilter" : "filter"
      }-${articleEntry.breadcrumbLabel ?? "none"}`,
    [articleEntry.breadcrumbLabel, articleEntry.filterId, articleEntry.hideFilterUI]
  );

  return {
    articleEntry,
    articleScreenKey,
    resetArticleEntry,
    openArticles,
    openArticlesWithFilter,
  };
};
