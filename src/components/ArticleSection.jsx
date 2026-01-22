import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import Tabs from "./Tabs";
import ArticleGrid from "./ArticleGrid";
import ArticleDetail from "./ArticleDetail";
import Rightbar from "./Rightbar";
// 無限スクロールと右カラムはこのコンポーネント内で完結させる（責務の一元化）
import { fetchArticles } from "../services/articlesService";
import { normalizeArticles } from "../services/mappers/articleMapper";
import mockArticles from "../data/mock/articles.json";
import categories from "../data/mock/categories.json";
import tags from "../data/mock/tags.json";
import departments from "../data/mock/departments.json";

const defaultTab = "最新";
const INITIAL_PAGE_SIZE = 24;
const PAGE_SIZE = 12;

// 記事表示まわりを集約するセクションコンポーネント
// - 無限スクロールのロジックもここに集約し、後から見ても責務が追いやすい形にする
const ArticleSection = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [tagList, setTagList] = useState(tags);
  // データ取得ステート（API or モック）
  const mockNormalized = useMemo(() => normalizeArticles(mockArticles), []);
  const [articles, setArticles] = useState(() => mockNormalized.slice(0, INITIAL_PAGE_SIZE));
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(mockNormalized.length > INITIAL_PAGE_SIZE);
  const [isApiMode, setIsApiMode] = useState(false);
  const [fallbackCursor, setFallbackCursor] = useState(INITIAL_PAGE_SIZE);
  const sentinelRef = useRef(null);
  const listScrollRef = useRef(0);

  const handleAddTag = (newTag) => {
    const normalized = newTag.trim();
    if (!normalized) return;
    if (tagList.includes(normalized)) return;
    setTagList((prev) => [...prev, normalized]);
  };

  const filteredArticles = useMemo(() => {
    if (activeTab === "最新") {
      return [...articles].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    if (activeTab === "人気") {
      return articles.filter((article) => article.isPopular);
    }

    if (activeTab === "保存済み") {
      return articles.filter((article) => article.isSaved);
    }

    if (activeTab === "未読") {
      return articles.filter((article) => !article.isRead);
    }

    return articles;
  }, [activeTab, articles]);

  // 初回ロード: APIを試し、未設定/失敗ならモックで継続
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        const result = await fetchArticles({ pageSize: INITIAL_PAGE_SIZE });

        if (isMounted && result?.items && result.items.length > 0) {
          setArticles(result.items);
          setNextPageToken(result.nextPageToken ?? null);
          setHasMore(Boolean(result.nextPageToken) || result.items.length === INITIAL_PAGE_SIZE);
          setIsApiMode(true);
          setLoadError(null);
          return;
        }

        if (isMounted) {
          setHasMore(mockNormalized.length > INITIAL_PAGE_SIZE);
          setIsApiMode(false);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("記事の取得に失敗しました");
          setHasMore(mockNormalized.length > INITIAL_PAGE_SIZE);
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
  }, [mockNormalized]);

  // 次ページを取得（API: nextPageToken、モック: slice）
  const loadMore = useCallback(async () => {
    if (isLoadingInitial || isLoadingMore) return;

    if (isApiMode) {
      if (!hasMore && !nextPageToken) return;

      setIsLoadingMore(true);
      try {
        const result = await fetchArticles({ pageToken: nextPageToken, pageSize: PAGE_SIZE });

        const newItems = result?.items ?? [];
        const nextToken = result?.nextPageToken ?? null;

        setLoadError(null);
        setArticles((prev) => [...prev, ...newItems]);
        setNextPageToken(nextToken);

        const stillHasMore = Boolean(nextToken) || newItems.length === PAGE_SIZE;
        setHasMore(stillHasMore);
      } catch (error) {
        setLoadError("記事の追加取得に失敗しました");
        setHasMore(false);
      } finally {
        setIsLoadingMore(false);
      }
      return;
    }

    // モックデータモード（API未設定時のフェールセーフ）
    if (fallbackCursor >= mockNormalized.length) {
      setHasMore(false);
      return;
    }

    const nextCursor = Math.min(fallbackCursor + PAGE_SIZE, mockNormalized.length);
    setArticles(mockNormalized.slice(0, nextCursor));
    setFallbackCursor(nextCursor);
    setHasMore(nextCursor < mockNormalized.length);
  }, [
    fallbackCursor,
    hasMore,
    isApiMode,
    isLoadingInitial,
    isLoadingMore,
    mockNormalized,
    nextPageToken,
  ]);

  // スクロール終端を監視し、自動で次ページ取得
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
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleSelectArticle = (article) => {
    listScrollRef.current = window.scrollY;
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: listScrollRef.current, behavior: "instant" });
    });
  };

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={handleBackToList} />;
  }

  return (
    <div className="articles-with-rightbar">
      <section className="articles-section">
        <DashboardHeader />
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab)} />
        {isLoadingInitial ? <p className="notice">記事を読み込み中...</p> : null}
        {loadError ? <p className="notice error">{loadError}</p> : null}
        <ArticleGrid articles={filteredArticles} onSelect={handleSelectArticle} />
        {/* 無限スクロール: 追加読込中のステータスと監視対象（sentinel）はここでだけ扱う */}
        {isLoadingMore ? <p className="notice">さらに読み込み中...</p> : null}
        {!hasMore && !isLoadingInitial ? <p className="notice">すべて読み込みました</p> : null}
        <div ref={sentinelRef} className="load-more-sentinel" aria-hidden="true" />
      </section>

      {/* この記事画面専用の右カラム。別メニューでは表示しない */}
      <Rightbar
        categories={categories}
        tags={tagList}
        onAddTag={handleAddTag}
        departments={departments}
      />
    </div>
  );
};

export default ArticleSection;
