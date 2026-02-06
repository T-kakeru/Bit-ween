import ArticleSectionContainer from "../features/articles/components/Article/ArticleSectionContainer";
import fetchArticles from "../services/articlesService";
import normalizeArticles from "../services/mappers/articleMapper";
import mockArticles from "../data/mock/articles.json";
import categories from "../data/mock/categories.json";
import tags from "../data/mock/tags.json";
import departments from "../data/mock/departments.json";

// pages は「完成された画面」。テンプレートに実データを注入して完成形UIを作る。
const ArticleScreen = ({
  initialFilterId,
  hideFilterUI,
  breadcrumbLabel,
  onNavigateHome,
  initialTab,
  initialQuickFilter,
}) => {
  const departmentNames = Array.isArray(departments)
    ? departments
        .map((d) => String(d?.name ?? "").trim())
        .filter(Boolean)
    : [];

  const pageData = {
    fetcher: fetchArticles,
    normalize: normalizeArticles,
    mockArticles,
    categories,
    tags,
    departments: departmentNames,
    initialPageSize: 24,
    pageSize: 12,
    rootMargin: "200px",
  };

  return (
    <ArticleSectionContainer
      initialFilterId={initialFilterId}
      hideFilterUI={hideFilterUI}
      breadcrumbLabel={breadcrumbLabel}
      onNavigateHome={onNavigateHome}
      initialTab={initialTab}
      initialQuickFilter={initialQuickFilter}
      {...pageData}
    />
  );
};

export default ArticleScreen;
