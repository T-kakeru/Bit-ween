import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// 記事の無限スクロール取得をまとめたHook
const useArticleList = ({
  fetcher,
  mockItems = [],
  initialPageSize = 24,
  pageSize = 12,
  rootMargin = "200px",
} = {}) => {
  const mockList = useMemo(() => mockItems ?? [], [mockItems]);

  const [articles, setArticles] = useState(() => mockList.slice(0, initialPageSize));
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(mockList.length > initialPageSize);
  const [isApiMode, setIsApiMode] = useState(false);
  const [fallbackCursor, setFallbackCursor] = useState(initialPageSize);
  const sentinelRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        const result = await fetcher?.({ pageSize: initialPageSize });

        if (isMounted && result?.items && result.items.length > 0) {
          setArticles(result.items);
          setNextPageToken(result.nextPageToken ?? null);
          setHasMore(Boolean(result.nextPageToken) || result.items.length === initialPageSize);
          setIsApiMode(true);
          setLoadError(null);
          return;
        }

        if (isMounted) {
          setHasMore(mockList.length > initialPageSize);
          setIsApiMode(false);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("記事の取得に失敗しました");
          setHasMore(mockList.length > initialPageSize);
          setIsApiMode(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingInitial(false);
        }
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [fetcher, initialPageSize, mockList]);

  const loadMore = useCallback(async () => {
    if (isLoadingInitial || isLoadingMore) return;

    if (isApiMode) {
      if (!hasMore && !nextPageToken) return;

      setIsLoadingMore(true);
      try {
        const result = await fetcher?.({ pageToken: nextPageToken, pageSize });
        const newItems = result?.items ?? [];
        const nextToken = result?.nextPageToken ?? null;

        setLoadError(null);
        setArticles((prev) => [...prev, ...newItems]);
        setNextPageToken(nextToken);

        const stillHasMore = Boolean(nextToken) || newItems.length === pageSize;
        setHasMore(stillHasMore);
      } catch (error) {
        setLoadError("記事の追加取得に失敗しました");
        setHasMore(false);
      } finally {
        setIsLoadingMore(false);
      }
      return;
    }

    if (fallbackCursor >= mockList.length) {
      setHasMore(false);
      return;
    }

    const nextCursor = Math.min(fallbackCursor + pageSize, mockList.length);
    setArticles(mockList.slice(0, nextCursor));
    setFallbackCursor(nextCursor);
    setHasMore(nextCursor < mockList.length);
  }, [
    fallbackCursor,
    fetcher,
    hasMore,
    isApiMode,
    isLoadingInitial,
    isLoadingMore,
    mockList,
    nextPageToken,
    pageSize,
  ]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore, rootMargin]);

  return {
    articles,
    isLoadingInitial,
    isLoadingMore,
    loadError,
    hasMore,
    loadMoreRef: sentinelRef,
  };
};

export default useArticleList;
