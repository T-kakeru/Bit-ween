import { useCallback, useMemo, useState } from "react";

// 記事の保存(ブックマーク)は「押したら切り替わる」だけの in-memory 状態。
// 永続化(DB/Storage)は後でここを差し替える。
const useSavedArticlesState = () => {
  const [savedIds, setSavedIds] = useState(() => new Set());

  const isSaved = useCallback(
    (id) => {
      if (id == null) return false;
      return savedIds.has(String(id));
    },
    [savedIds]
  );

  const toggleSaved = useCallback((id) => {
    if (id == null) return;
    const key = String(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const applySavedState = useCallback(
    (articles) => {
      return (articles ?? []).map((article) => {
        if (!article) return article;
        const key = String(article.id);
        return {
          ...article,
          isSaved: savedIds.has(key),
        };
      });
    },
    [savedIds]
  );

  return useMemo(
    () => ({
      savedIds,
      isSaved,
      toggleSaved,
      applySavedState,
    }),
    [applySavedState, isSaved, savedIds, toggleSaved]
  );
};

export default useSavedArticlesState;
