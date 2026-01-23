import { useMemo, useState } from "react";
import mockArticles from "../data/mock/articles.json";
// ホーム画面の記事コンポーネント
import { ArticleCarouselSection, FilteredArticleCarouselSection } from "../components/ArticleCarousel";
import { applyArticleFilter } from "../components/ArticleFilter";

const HomeScreen = ({ onOpenArticles }) => {
  const [rating, setRating] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const { unreadCount, importantCount, readingCount } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const unread = mockArticles.filter((article) => !article.isRead);
    const todayUnread = unread.filter((article) => article.date.replace(/\//g, "-") === today);
    const important = mockArticles.filter((article) => article.tags?.includes("周知事項") || article.tags?.includes("重要") || article.tags?.includes("お知らせ"));
    const reading = mockArticles.filter((article) => article.isRead === false && article.coverage >= 30);
    const recommended = mockArticles.filter((article) => article.isPopular);

    return {
      // ホーム画面用の記事の絞り込み件数
      unreadCount: unread.length,
      importantCount: important.length,
      readingCount: reading.length,
    };
  }, []);
  // 今週の記事数
  const thisWeekCount = useMemo(() => applyArticleFilter(mockArticles, "thisWeek").length, []);

  const metrics = useMemo(() => {
    const total = mockArticles.length || 1;
    const readCount = mockArticles.filter((article) => article.isRead).length;
    const averageCoverage = Math.round(
      mockArticles.reduce((sum, article) => sum + (article.coverage ?? 0), 0) / total
    );

    return {
      readRate: Math.round((readCount / total) * 100),
      averageCoverage,
      streakDays: 6,
    };
  }, []);

  const carouselArticles = useMemo(() => mockArticles.slice(0, 10), []);
  const topCoverage = useMemo(() => {
    return [...mockArticles]
      .sort((a, b) => (b.coverage ?? 0) - (a.coverage ?? 0))
      .slice(0, 3);
  }, []);

  const surveyCompleted = rating > 0 && selectedRecommendation !== null;

  return (
    <>
      <header className="content-header">
        <div>
          <h1 className="title">ホーム</h1>
        </div>
      </header>
      <section className="screen home-screen">

        <section className="home-top-grid" aria-label="ダッシュボード">
          <section className="card-panel home-square-card home-shortcuts-card" aria-label="クイックショートカット">
            <div className="home-square-main home-shortcuts-list">
              <button
                type="button"
                className="home-shortcut-item"
                onClick={() =>
                  onOpenArticles?.({
                    filterId: "thisWeek",
                    hideFilterUI: true,
                    breadcrumbLabel: "今週の投稿",
                  })
                }
              >
                <span className="home-shortcut-icon" aria-hidden="true">🗓️</span>
                <span className="home-shortcut-title">今週の記事</span>
                <span className="home-shortcut-meta">
                  <span className="home-shortcut-count">{thisWeekCount}</span>
                  <span className="home-shortcut-arrow" aria-hidden="true">→</span>
                </span>
              </button>

              <button
                type="button"
                className="home-shortcut-item"
                onClick={() =>
                  onOpenArticles?.({
                    filterId: "important",
                    hideFilterUI: true,
                    breadcrumbLabel: "おしらせ",
                  })
                }
              >
                <span className="home-shortcut-icon" aria-hidden="true">⚑</span>
                <span className="home-shortcut-title">おしらせ</span>
                <span className="home-shortcut-meta">
                  <span className="home-shortcut-count">{importantCount}</span>
                  <span className="home-shortcut-arrow" aria-hidden="true">→</span>
                </span>
              </button>

              <button
                type="button"
                className="home-shortcut-item"
                onClick={() =>
                  onOpenArticles?.({
                    filterId: "reading",
                    hideFilterUI: true,
                    breadcrumbLabel: "続きから読む",
                  })
                }
              >
                <span className="home-shortcut-icon" aria-hidden="true">↩</span>
                <span className="home-shortcut-title">続きから読む</span>
                <span className="home-shortcut-meta">
                  <span className="home-shortcut-count">{readingCount}</span>
                  <span className="home-shortcut-arrow" aria-hidden="true">→</span>
                </span>
              </button>
            </div>
          </section>

          <section className="card-panel home-square-card home-metrics-card" aria-label="自分の記事閲覧">
            <div className="home-square-head">
              <h2 className="title">自分の記事閲覧</h2>
            </div>
            <div className="home-square-main">
              <div className="home-metrics-grid">
                <div>
                  <p className="home-metrics-number">{metrics.readRate}%</p>
                  <p className="muted">既読率</p>
                </div>
                <div>
                  <p className="home-metrics-number">{metrics.averageCoverage}%</p>
                  <p className="muted">平均網羅率</p>
                </div>
                <div>
                  <p className="home-metrics-number">{metrics.streakDays}日</p>
                  <p className="muted">連続</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card-panel home-square-card home-survey" aria-label="アンケート">
            <div className="home-square-head">
              <div>
                <h2 className="title">アンケート</h2>
              </div>
              {surveyCompleted ? <span className="home-survey-done">完了</span> : null}
            </div>

            <div className="home-square-main">
              <div className="home-survey-stars" role="group" aria-label="評価">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= rating ? "home-star is-active" : "home-star"}
                    onClick={() => setRating(value)}
                    aria-label={`${value}つ星を付ける`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="home-survey-list" aria-label="網羅率の高い記事">
                {topCoverage.map((article, index) => (
                  <button
                    key={article.id}
                    type="button"
                    className={
                      selectedRecommendation === article.id
                        ? "home-survey-item is-selected"
                        : "home-survey-item"
                    }
                    onClick={() => setSelectedRecommendation(article.id)}
                  >
                    <span className="home-survey-rank">{index + 1}</span>
                    <div className="home-survey-info">
                      <p className="home-survey-title">{article.title}</p>
                      <span className="muted small">網羅率 {article.coverage}%</span>
                    </div>
                  </button>
                ))}
              </div>

              {surveyCompleted ? (
                <p className="home-survey-thanks">ご協力いただきありがとうございます！</p>
              ) : null}
            </div>
          </section>
        </section>


        <ArticleCarouselSection
          title="注目の記事"
          badge="一覧へ"
          onBadgeClick={() => onOpenArticles?.({ filterId: "latest" })}
          articles={carouselArticles}
          onCardClick={() => onOpenArticles?.({ filterId: "latest" })}
        />

        {/* 注目記事と同じカードデザインで、フィルタ別の記事を順番に表示 */}
        <FilteredArticleCarouselSection
          filterId="recommended"
          allArticles={mockArticles}
          onOpenArticles={onOpenArticles}
        />
        <FilteredArticleCarouselSection
          filterId="unread"
          allArticles={mockArticles}
          onOpenArticles={onOpenArticles}
        />
        <FilteredArticleCarouselSection
          filterId="important"
          allArticles={mockArticles}
          onOpenArticles={onOpenArticles}
        />
        <FilteredArticleCarouselSection
          filterId="reading"
          allArticles={mockArticles}
          onOpenArticles={onOpenArticles}
        />
      </section>
    </>
  );
};

export default HomeScreen;
