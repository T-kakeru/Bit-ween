import { useMemo, useState } from "react";
import mockArticles from "../data/mock/articles.json";
// ホーム画面の記事コンポーネント
import {
  ArticleCarouselSection,
  FilteredArticleCarouselSection,
} from "../features/articles/components/Article/ArticleCarousel";
import { applyArticleFilter } from "../features/articles/domain/articleFilters";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import TextCaption from "@/shared/ui/TextCaption";

const HomeScreen = ({ onOpenArticles }) => {
  const [rating, setRating] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const { importantCount, readingCount } = useMemo(() => {
    const important = mockArticles.filter((article) => article.tags?.includes("周知事項") || article.tags?.includes("重要") || article.tags?.includes("お知らせ"));
    const saved = mockArticles.filter((article) => article.isSaved);

    return {
      // ホーム画面用の記事の絞り込み件数
      importantCount: important.length,
      readingCount: saved.length,
    };
  }, []);
  // 今週の記事数
  const thisWeekCount = useMemo(() => applyArticleFilter(mockArticles, "thisWeek").length, []);

  const metrics = useMemo(() => {
    const total = mockArticles.length || 1;
    const readCount = mockArticles.filter((article) => article.isRead).length;
    const unread = mockArticles.filter((article) => !article.isRead).length;

    return {
      readRate: Math.round((readCount / total) * 100),
      unreadCount: unread,
      streakDays: 6,
    };
  }, []);

  const carouselArticles = useMemo(() => mockArticles.slice(0, 10), []);
  const topRecommendations = useMemo(() => {
    return [...mockArticles].filter((a) => a?.isPopular).slice(0, 3);
  }, []);

  const surveyCompleted = rating > 0 && selectedRecommendation !== null;

  return (
    <>
      <section className="screen home-screen">
        <Heading level={2}>ホーム</Heading>

        <section className="home-top-grid" aria-label="ダッシュボード">
          <Card className="home-square-card home-shortcuts-card" aria-label="クイックショートカット">
            <div className="home-square-main home-shortcuts-list">
              <Button
                type="button"
                variant="outline"
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
              </Button>

              <Button
                type="button"
                variant="outline"
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
              </Button>

              <Button
                type="button"
                variant="outline"
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
                  <span className="home-shortcut-count">{readingCount}</span>
                  <span className="home-shortcut-arrow" aria-hidden="true">→</span>
                </span>
              </Button>
            </div>
          </Card>

          <Card className="home-square-card home-metrics-card" aria-label="自分の記事閲覧">
            <div className="home-square-head">
              <Heading level={2}>自分の記事閲覧</Heading>
            </div>
            <div className="home-square-main">
              <div className="home-metrics-grid">
                <div>
                  <p className="home-metrics-number">{metrics.readRate}%</p>
                  <TextCaption>既読率</TextCaption>
                </div>
                <div>
                  <p className="home-metrics-number">{metrics.unreadCount}</p>
                  <TextCaption>未読</TextCaption>
                </div>
                <div>
                  <p className="home-metrics-number">{metrics.streakDays}日</p>
                  <TextCaption>連続</TextCaption>
                </div>
              </div>
            </div>
          </Card>

          <Card className="home-square-card home-survey" aria-label="アンケート">
            <div className="home-square-head">
              <div>
                <Heading level={2}>アンケート</Heading>
              </div>
              {surveyCompleted ? <span className="home-survey-done">完了</span> : null}
            </div>

            <div className="home-square-main">
              <div className="home-survey-stars" role="group" aria-label="評価">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    className={value <= rating ? "home-star is-active" : "home-star"}
                    onClick={() => setRating(value)}
                    aria-label={`${value}つ星を付ける`}
                  >
                    ★
                  </Button>
                ))}
              </div>

              <div className="home-survey-list" aria-label="おすすめの記事">
                {topRecommendations.map((article, index) => (
                  <Button
                    key={article.id}
                    type="button"
                    variant="outline"
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
                      <TextCaption as="span" className="small">{article.author} ・ {article.date}</TextCaption>
                    </div>
                  </Button>
                ))}
              </div>

              {surveyCompleted ? (
                <p className="home-survey-thanks">ご協力いただきありがとうございます！</p>
              ) : null}
            </div>
          </Card>
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
          filterId="saved"
          allArticles={mockArticles}
          onOpenArticles={onOpenArticles}
        />
      </section>
    </>
  );
};

export default HomeScreen;
