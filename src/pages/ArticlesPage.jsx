import { useMemo } from "react";
import ArticleSectionContainer from "@/features/articles/components/organisms/ArticleSectionContainer";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import useArticleList from "@/features/articles/hooks/useArticleList";
import useArticleFilters from "@/features/articles/hooks/useArticleFilters";
import useAdditionalConditions from "@/features/articles/hooks/useAdditionalConditions";
import useArticleDetail from "@/features/articles/hooks/useArticleDetail";
import fetchArticles from "@/features/articles/api/articlesService";
import normalizeArticles from "@/features/articles/api/mappers/articleMapper";
import { addArticleFacets } from "@/features/articles/logic/articleFacets";
import { DEFAULT_ARTICLE_FILTER_ID } from "@/features/articles/logic/articleFilters";
import mockArticles from "@/shared/data/mock/articles.json";
import categories from "@/shared/data/mock/categories.json";
import tags from "@/shared/data/mock/tags.json";
import departments from "@/shared/data/mock/departments.json";

// pages: 画面全体の状態を統合する（フィルター / ページング / モーダル / 選択ID）
const ArticlesPage = ({
  initialFilterId,
  hideFilterUI,
  breadcrumbLabel,
  onNavigateHome,
  initialTab,
  initialQuickFilter,
  savedArticles,
}) => {
  const { applySavedState, isSaved, toggleSaved } = savedArticles;
  const {
    selectedTags,
    selectedDepartments,
    selectedCategories,
    toggleTag,
    toggleDepartment,
    toggleCategory,
    chips: conditionChips,
    removeChip,
    clearAll: clearAllConditions,
  } = useAdditionalConditions();

  // モックデータを正規化し、絞り込み用のfacetも付与（データの“入口”はPagesで統合）
  const mockItems = useMemo(() => {
    const normalized = normalizeArticles(mockArticles);
    return addArticleFacets(normalized, { departments });
  }, []);

  const { articles, isLoadingInitial, isLoadingMore, loadError, hasMore, loadMoreRef } = useArticleList({
    fetcher: fetchArticles,
    mockItems,
    initialPageSize: 24,
    pageSize: 12,
    rootMargin: "200px",
  });

  // facet付与（API/モック両方の出力に適用）
  const articlesWithFacets = useMemo(() => addArticleFacets(articles ?? [], { departments }), [articles]);
  const articlesWithSavedState = useMemo(
    () => applySavedState(articlesWithFacets),
    [applySavedState, articlesWithFacets]
  );

  const { activeFilterId, setActiveFilterId, filteredArticles } = useArticleFilters({
    initialFilterId: initialFilterId ?? DEFAULT_ARTICLE_FILTER_ID,
    initialTab,
    initialQuickFilter,
    articles: articlesWithSavedState,
    selectedTags,
    selectedDepartments,
    selectedCategories,
  });

  const { selectedArticle, openArticle, closeArticle } = useArticleDetail();

  // 画面の判断: 詳細を開いているかどうか（= 選択中ID）
  if (selectedArticle) {
    return (
      <ArticleDetailPage
        article={selectedArticle}
        onBack={closeArticle}
        isSaved={isSaved}
        toggleSaved={toggleSaved}
      />
    );
  }

  return (
    <ArticleSectionContainer
      hideFilterUI={hideFilterUI}
      breadcrumbLabel={breadcrumbLabel}
      onNavigateHome={onNavigateHome}
      activeFilterId={activeFilterId}
      onFilterChange={setActiveFilterId}
      conditionChips={conditionChips}
      onRemoveChip={removeChip}
      onClearChips={clearAllConditions}
      articles={filteredArticles}
      onSelectArticle={openArticle}
      isLoadingInitial={isLoadingInitial}
      isLoadingMore={isLoadingMore}
      loadError={loadError}
      hasMore={hasMore}
      loadMoreRef={loadMoreRef}
      categories={categories}
      tags={tags}
      departments={departments}
      selectedCategories={selectedCategories}
      selectedTags={selectedTags}
      selectedDepartments={selectedDepartments}
      onToggleCategory={toggleCategory}
      onToggleTag={toggleTag}
      onToggleDepartment={toggleDepartment}
    />
  );
};

export default ArticlesPage;
