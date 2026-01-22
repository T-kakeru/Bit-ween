import { useMemo, useState } from "react";
import mockArticles from "../data/mock/articles.json";

const HomeScreen = ({ onOpenArticles }) => {
  const [rating, setRating] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const { unreadCount, todayUnreadCount, importantCount, readingCount, recommendedCount } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const unread = mockArticles.filter((article) => !article.isRead);
    const todayUnread = unread.filter((article) => article.date.replace(/\//g, "-") === today);
    const important = mockArticles.filter((article) => article.tags?.includes("経営") || article.tags?.includes("重要"));
    const reading = mockArticles.filter((article) => article.isRead === false && article.coverage >= 30);
    const recommended = mockArticles.filter((article) => article.isPopular);

    return {
      unreadCount: unread.length,
      todayUnreadCount: todayUnread.length,
      importantCount: important.length,
      readingCount: reading.length,
      recommendedCount: recommended.length,
    };
  }, []);

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
    <section className="screen home-screen">
      <header className="content-header">
        <div>
          <h1>ホーム</h1>
          <p className="muted">note 風ガジェットで、気になる記事を素早く確認できます</p>
        </div>
      </header>

      <section className="home-section">
        <div className="home-section-head">
          <h2 className="home-section-title">注目の記事</h2>
          <span className="muted small">横にスワイプして閲覧</span>
        </div>
        <div className="home-carousel" aria-label="注目の記事">
          {carouselArticles.map((article) => (
            <article key={article.id} className="home-card" role="article">
              <div className={`home-card-image ${article.image ?? "city"}`} aria-hidden="true" />
              <div className="home-card-body">
                <div className="home-card-tags">
                  {(article.tags ?? []).slice(0, 2).map((tag) => (
                    <span key={`${article.id}-${tag}`} className="tag-pill">{tag}</span>
                  ))}
                </div>
                <h3 className="home-card-title">{article.title}</h3>
                <p className="home-card-meta">
                  {article.author} ・ {article.date}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <button
          type="button"
          className="card-panel home-status-card"
          onClick={onOpenArticles}
        >
          <div className="home-status-head">
            <h2 className="home-section-title">未読・既読の状態</h2>
            <span className="home-status-cta">未読一覧へ</span>
          </div>
          <div className="home-status-grid">
            <div className="home-status-item">
              <p className="home-status-number">{unreadCount}</p>
              <p className="muted">未読</p>
            </div>
            <div className="home-status-item">
              <p className="home-status-number">{todayUnreadCount}</p>
              <p className="muted">今日の未読</p>
            </div>
            <div className="home-status-item">
              <p className="home-status-number">{importantCount}</p>
              <p className="muted">重要記事</p>
            </div>
            <div className="home-status-item">
              <p className="home-status-number">{readingCount}</p>
              <p className="muted">読みかけ</p>
            </div>
            <div className="home-status-item">
              <p className="home-status-number">{recommendedCount}</p>
              <p className="muted">おすすめ</p>
            </div>
          </div>
        </button>
      </section>

      <section className="home-section">
        <div className="card-panel home-metrics-card">
          <h2 className="home-section-title">読了メトリクス</h2>
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

      <section className="home-section">
        <div className="card-panel home-survey">
          <div className="home-survey-head">
            <div>
              <h2 className="home-section-title">直近の記事の評価</h2>
              <p className="muted">ワンクリックで完了します</p>
            </div>
            {surveyCompleted ? <span className="home-survey-done">完了</span> : null}
          </div>

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
          ) : (
            <p className="muted small">星評価と記事選択で送信完了になります。</p>
          )}
        </div>
      </section>
    </section>
  );
};

export default HomeScreen;
