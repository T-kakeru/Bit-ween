import { useCallback, useMemo, useState } from "react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import Heading from "@/shared/ui/Heading";
import ArticleDropdownFilter from "../molecules/ArticleDropdownFilter";
import SearchField from "../molecules/SearchField";
import ArticleActionBar from "../molecules/ArticleActionBar";
import ArticleGrid from "../views/ArticleGrid";
import ArticleRightbar from "../views/ArticleRightbar";
const ArticleSectionContainer = ({
  hideFilterUI = false,
  breadcrumbLabel = null,
  onNavigateHome,
  // フィルター
  activeFilterId,
  onFilterChange,
  // 追加条件（チップ）
  conditionChips = [],
  onRemoveChip,
  onClearChips,
  // 記事一覧
  articles = [],
  onSelectArticle,
  // ページング
  isLoadingInitial = false,
  isLoadingMore = false,
  loadError = null,
  hasMore = true,
  loadMoreRef,
  // 右カラム（絞り込み）
  categories = [],
  tags = [],
  onAddTag,
  departments = [],
  selectedCategories = [],
  selectedTags = [],
  selectedDepartments = [],
  onToggleCategory,
  onToggleTag,
  onToggleDepartment,
}) => {
  const hasAdditionalConditions = conditionChips.length > 0;
  const shouldShowEmptyResultNotice =
    !isLoadingInitial && !isLoadingMore && !loadError && (articles?.length ?? 0) === 0;

  // 検索用 state
  const [searchValue, setSearchValue] = useState("");
  const onSearchSubmit = useCallback(() => {
    // TODO: 検索ロジックをここに実装（例: フィルタやAPI呼び出し）
    // 現状はUIのみ設置
  }, []);

  const [tagList, setTagList] = useState(() => tags);

  const handleAddTag = useCallback(
    (newTag) => {
      const normalizedValue = String(newTag ?? "").trim();
      if (!normalizedValue) return;
      setTagList((prev) => (prev.includes(normalizedValue) ? prev : [...prev, normalizedValue]));
      onAddTag?.(normalizedValue);
    },
    [onAddTag]
  );

  const resolvedTags = useMemo(() => {
    const unique = Array.from(new Set([...(tags ?? []), ...(tagList ?? [])]));
    return unique;
  }, [tagList, tags]);

  return (
    <div className="articles-page">
      <div className="content-header">
        <div className="content-header-left">
          {breadcrumbLabel ? (
            <Breadcrumb
              items={[{ label: "ホーム", onClick: onNavigateHome }, { label: breadcrumbLabel }]}
            />
          ) : (
            <Heading level={2} className="title" aria-hidden="true" />
          )}

          {hideFilterUI ? null : (
            <div className="article-filter-bar article-filter-bar--left">
              <SearchField
                value={searchValue}
                onChange={setSearchValue}
                onSubmit={onSearchSubmit}
                placeholder="検索"
              />
              <ArticleDropdownFilter value={activeFilterId} onChange={onFilterChange} />
            </div>
          )}

          <ArticleActionBar
            chips={conditionChips}
            onRemove={onRemoveChip}
            onClear={onClearChips}
          />
        </div>
      </div>

      <div className="articles-with-rightbar">
        <section className="articles-section">
          {isLoadingInitial ? <p className="notice">記事を読み込み中...</p> : null}
          {loadError ? <p className="notice error">{loadError}</p> : null}

          <ArticleGrid articles={articles} onSelect={onSelectArticle} />

          {isLoadingMore ? <p className="notice">さらに読み込み中...</p> : null}
          {shouldShowEmptyResultNotice ? (
            <p className="notice">該当する記事がありませんでした。</p>
          ) : null}
          {!shouldShowEmptyResultNotice && !hasMore && !isLoadingInitial ? (
            <p className="notice">すべて読み込みました</p>
          ) : null}
          <div ref={loadMoreRef} className="load-more-sentinel" aria-hidden="true" />
        </section>

        <ArticleRightbar
          categories={categories}
          tags={resolvedTags}
          onAddTag={handleAddTag}
          departments={departments}
          selectedCategories={selectedCategories}
          selectedTags={selectedTags}
          selectedDepartments={selectedDepartments}
          onToggleCategory={onToggleCategory}
          onToggleTag={onToggleTag}
          onToggleDepartment={onToggleDepartment}
        />
      </div>
    </div>
  );
};

export default ArticleSectionContainer;
