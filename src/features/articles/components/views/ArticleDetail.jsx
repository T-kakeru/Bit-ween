import Breadcrumb from "@/shared/components/Breadcrumb";
import Icon from "@/shared/ui/Icon";
import Heading from "@/shared/ui/Heading";
import { useEffect, useState } from "react";
import BookmarkButton from "@/features/articles/components/molecules/BookmarkButton";

const ArticleDetail = ({ article, onBack, isSaved, toggleSaved }) => {
  const saved = isSaved(article?.id);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!saved) return;
    setIsAnimating(true);
    const t = window.setTimeout(() => setIsAnimating(false), 520);
    return () => window.clearTimeout(t);
  }, [saved]);

  if (!article) return null;

  const tagList = Array.isArray(article.tags)
    ? article.tags
    : article.tag
    ? article.tag.split("・")
    : [];

  const breadcrumbItems = [{ label: "記事", onClick: onBack }, { label: "記事の詳細" }];

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
          <Heading level={2} className="detail-title">{article.title}</Heading>
          <div className="detail-title-actions">
            <BookmarkButton
              saved={saved}
              isAnimating={isAnimating}
              onToggle={() => toggleSaved(article.id)}
            />

            <span
              className={`read-indicator ${article.isRead ? "is-read" : "is-unread"}`}
              aria-label={article.isRead ? "既読" : "未読"}
              title={article.isRead ? "既読" : "未読"}
            />
          </div>
        </div>

        <div className="detail-meta">
          <Icon className="avatar" name={article.icon} alt="" />
          <span>{article.author}</span>
          <span className="dot">•</span>
          <span>{article.date}</span>
        </div>

        <p className="detail-summary">{article.summary ?? "本文は準備中です。"}</p>
      </div>
    </section>
  );
};

export default ArticleDetail;
