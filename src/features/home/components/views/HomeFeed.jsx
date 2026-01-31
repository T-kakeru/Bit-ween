import { ArticleCarouselSection, FilteredArticleCarouselSection } from "@/features/articles/components/views/ArticleCarousel";
import Heading from "@/shared/ui/Heading";

const HomeFeed = ({
  onOpenArticles,
  rating,
  onRate,
  selectedRecommendation,
  onSelectRecommendation,
  counts,
  metrics,
  thisWeekCount,
  carouselArticles,
  topRecommendations,
  articles,
}) => {
  const surveyCompleted = rating > 0 && selectedRecommendation !== null;

  return (
    <>
      <header className="content-header">
        <div>
          <Heading level={2} className="title">ホーム</Heading>
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
                  <span className="home-shortcut-count">{counts.importantCount}</span>
                  <span className="home-shortcut-arrow" aria-hidden="true">→</span>
                </span>
              </button>

              <button
                type="button"
                className="home-shortcut-item"
                onClick={() =>
                  onOpenArticles?.({
                    filterId: "saved",
                    hideFilterUI: true,
                    breadcrumbLabel: "保存した記事",
                  })
                }
              >
                <span className="home-shortcut-icon" aria-hidden="true">🔖</span>
                <span className="home-shortcut-title">保存した記事</span>
                <span className="home-shortcut-meta">
                  <span className="home-shortcut-count">{counts.savedCount}</span>
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
                  <p className="home-metrics-number">{metrics.unreadCount}</p>
                  <p className="muted">未読</p>
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
                    onClick={() => onRate(value)}
                    aria-label={`${value}つ星を付ける`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="home-survey-list" aria-label="おすすめの記事">
                {topRecommendations.map((article, index) => (
                  <button
                    key={article.id}
                    type="button"
                    className={
                      selectedRecommendation === article.id
                        ? "home-survey-item is-selected"
                        : "home-survey-item"
                    }
                    onClick={() => onSelectRecommendation(article.id)}
                  >
                    <span className="home-survey-rank">{index + 1}</span>
                    <div className="home-survey-info">
                      <p className="home-survey-title">{article.title}</p>
                      <span className="muted small">{article.author} ・ {article.date}</span>
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

        <FilteredArticleCarouselSection
          filterId="recommended"
          allArticles={articles}
          onOpenArticles={onOpenArticles}
        />
        <FilteredArticleCarouselSection
          filterId="unread"
          allArticles={articles}
          onOpenArticles={onOpenArticles}
        />
        <FilteredArticleCarouselSection
          filterId="important"
          allArticles={articles}
          onOpenArticles={onOpenArticles}
        />
        <FilteredArticleCarouselSection
          filterId="saved"
          allArticles={articles}
          onOpenArticles={onOpenArticles}
        />
      </section>
    </>
  );
};

export default HomeFeed;
