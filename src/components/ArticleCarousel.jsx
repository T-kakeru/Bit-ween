import { applyArticleFilter, resolveArticleFilter } from "./ArticleFilter";

// ホームの記事コンポーネントUI
const ArticleImageCard = ({ article, onClick }) => {
  const Tag = onClick ? "button" : "article";

  return (
    <Tag
      className={onClick ? "home-card home-card-button" : "home-card"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      role={onClick ? undefined : "article"}
    >
      <div className={`home-card-image ${article.image ?? "city"}`} aria-hidden="true" />
      <div className="home-card-body">
        <div className="home-card-tags">
          {(article.tags ?? []).slice(0, 2).map((tag) => (
            <span key={`${article.id}-${tag}`} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="home-card-title">{article.title}</h3>
        <p className="home-card-meta">
          {article.author} ・ {article.date}
        </p>
      </div>
    </Tag>
  );
};

export const ArticleCarouselSection = ({ title, badge, onBadgeClick, articles, onCardClick }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="home-section">
      <div className="home-section-head">
        <h2 className="title">{title}</h2>
        {badge ? (
          <button type="button" className="home-section-cta" onClick={onBadgeClick}>
            {badge}
          </button>
        ) : null}
      </div>

      <div className="home-carousel" aria-label={title}>
        {articles.map((article) => (
          <ArticleImageCard key={article.id} article={article} onClick={onCardClick} />
        ))}
      </div>
    </section>
  );
};

// フィルター適用済み記事
export const FilteredArticleCarouselSection = ({
  filterId,
  allArticles,
  onOpenArticles,
  maxItems = 10,
}) => {
  const filter = resolveArticleFilter(filterId);
  const list = applyArticleFilter(allArticles ?? [], filterId);
  const head = filter?.label ?? filterId;
  const slice = list.slice(0, maxItems);

  return (
    <ArticleCarouselSection
      title={head}
      badge={`${list.length}件`}
      onBadgeClick={() => onOpenArticles?.({ filterId })}
      articles={slice}
      onCardClick={() => onOpenArticles?.({ filterId })}
    />
  );
};
