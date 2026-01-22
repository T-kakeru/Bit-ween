import Breadcrumb from "./Breadcrumb";

const ArticleDetail = ({ article, onBack }) => {
  if (!article) return null;

  const tagList = Array.isArray(article.tags)
    ? article.tags
    : article.tag
    ? article.tag.split("・")
    : [];
  const coverage = article.coverage ?? 0;

  const breadcrumbItems = [
    { label: "記事", onClick: onBack },
    { label: "記事の詳細" },
  ];

  return (
    <section className="article-detail">
      <Breadcrumb items={breadcrumbItems} />

      <div className={`detail-hero ${article.image}`} />

      <div className="detail-body">
        <div className="detail-tags">
          {tagList.map((tag) => (
            <span key={`${article.id}-${tag}`} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>

        <div className="detail-title-row">
          <h1 className="detail-title">{article.title}</h1>
          <span
            className={`read-indicator ${article.isRead ? "is-read" : "is-unread"}`}
            aria-label={article.isRead ? "既読" : "未読"}
            title={article.isRead ? "既読" : "未読"}
          />
        </div>

        <div className="detail-meta">
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

        <p className="detail-summary">{article.summary ?? "本文は準備中です。"}</p>
      </div>
    </section>
  );
};

export default ArticleDetail;
