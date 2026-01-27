import { useMemo } from "react";
import { applyArticleFilter } from "@/features/articles/logic/articleFilters";

const useHomeFeed = ({ articles = [] } = {}) => {
  const counts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const unread = articles.filter((article) => !article.isRead);
    const todayUnread = unread.filter((article) => article.date.replace(/\//g, "-") === today);
    const important = articles.filter(
      (article) =>
        article.tags?.includes("周知事項") ||
        article.tags?.includes("重要") ||
        article.tags?.includes("お知らせ")
    );
    const saved = articles.filter((article) => article.isSaved);

    return {
      unreadCount: unread.length,
      importantCount: important.length,
      savedCount: saved.length,
      todayUnreadCount: todayUnread.length,
    };
  }, [articles]);

  const thisWeekCount = useMemo(() => applyArticleFilter(articles, "thisWeek").length, [articles]);

  const metrics = useMemo(() => {
    const total = articles.length || 1;
    const readCount = articles.filter((article) => article.isRead).length;
    const unreadCount = (articles ?? []).filter((article) => !article.isRead).length;

    return {
      readRate: Math.round((readCount / total) * 100),
      unreadCount,
      streakDays: 6,
    };
  }, [articles]);

  const carouselArticles = useMemo(() => articles.slice(0, 10), [articles]);
  const topRecommendations = useMemo(() => {
    return [...(articles ?? [])]
      .filter((article) => article?.isPopular)
      .slice(0, 3);
  }, [articles]);

  return {
    counts,
    metrics,
    thisWeekCount,
    carouselArticles,
    topRecommendations,
  };
};

export default useHomeFeed;
