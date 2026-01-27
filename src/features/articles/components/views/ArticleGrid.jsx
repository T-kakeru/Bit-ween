import ArticleTagPills from "./ArticleTagPills";
import Icon from "@/shared/ui/Icon";

const resolveArticleTags = (article) => {
  if (Array.isArray(article.tags)) {
    return article.tags;
  }

  if (article.tag) {
    return article.tag.split("・");
  }

  return [];
};

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
      {articles.map((article) => {
        const tagList = resolveArticleTags(article);

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
              <ArticleTagPills tags={tagList} articleId={article.id} />
              <div className="card-title-row">
                <h2 className="card-title">{article.title}</h2>
                <span
                  className={`read-indicator ${article.isRead ? "is-read" : "is-unread"}`}
                  aria-label={article.isRead ? "既読" : "未読"}
                  title={article.isRead ? "既読" : "未読"}
                />
              </div>
              <div className="card-meta">
                <Icon className="avatar" name={article.icon} alt="" />
                <span>{article.author}</span>
                <span className="dot">•</span>
                <span>{article.date}</span>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default ArticleGrid;
