// 記事カード一覧
const ArticleGrid = ({ articles, onSelect }) => {
  const handleKeyDown = (event, article) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(article);
    }
  };

  return (
    <section className="cards">
      {/* 記事カードを並べる */}
      {articles.map((article) => {
        const tagList = Array.isArray(article.tags)
          ? article.tags
          : article.tag
          ? article.tag.split("・")
          : [];
        const coverage = article.coverage ?? 0;

        return (
          <article
            key={article.id}
            className={`card ${article.image} ${article.isRead ? "is-read" : "is-unread"} is-clickable`}
            role="button"
            tabIndex={0}
            aria-label={`${article.title}の詳細を見る`}
            onClick={() => onSelect?.(article)}
            onKeyDown={(event) => handleKeyDown(event, article)}
          >
            <div className="card-media" />
            <div className="card-body">
              <div className="card-tags">
                {tagList.map((tag) => (
                  <span key={`${article.id}-${tag}`} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="card-title-row">
                <h2 className="card-title">{article.title}</h2>
                <span
                  className={`read-indicator ${article.isRead ? "is-read" : "is-unread"}`}
                  aria-label={article.isRead ? "既読" : "未読"}
                  title={article.isRead ? "既読" : "未読"}
                />
              </div>
              <div className="card-meta">
                <span className="avatar">{article.icon}</span>
                <span>{article.author}</span>
                <span className="dot">•</span>
                <span>{article.date}</span>
              </div>
              <div className="coverage" aria-label={`網羅率 ${coverage}%`}>
                <div className="coverage-header">
                  <span className="coverage-label">網羅率</span>
                  <span className="coverage-value">{coverage}%</span>
                </div>
                <div className="coverage-bar">
                  <span className="coverage-fill" style={{ width: `${coverage}%` }} />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default ArticleGrid;
