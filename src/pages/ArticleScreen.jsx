import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ArticleGrid from "../components/ArticleGrid";
import ArticleDetail from "../components/ArticleDetail";
import Rightbar from "../components/Rightbar";
import Breadcrumb from "../components/Breadcrumb";
import AdditionalConditionsBar from "../components/AdditionalConditionsBar";
import {
	applyArticleFilter,
	ArticleFilterDropdown,
	legacyTabToFilterId,
} from "../components/ArticleFilter";
import { useAdditionalConditions } from "../hooks/useAdditionalConditions";
// 無限スクロールと右カラムはこのコンポーネント内で完結させる（責務の一元化）
import { fetchArticles } from "../services/articlesService";
import { normalizeArticles } from "../services/mappers/articleMapper";
import mockArticles from "../data/mock/articles.json";
import categories from "../data/mock/categories.json";
import tags from "../data/mock/tags.json";
import departments from "../data/mock/departments.json";

const INITIAL_PAGE_SIZE = 24;
const PAGE_SIZE = 12;

const applyFacetFilters = ({ list, tags: selectedTags, departments: selectedDepartments, categories: selectedCategories }) => {
	const tags = selectedTags ?? [];
	const departments = selectedDepartments ?? [];
	const categories = selectedCategories ?? [];

	// 空ならそのまま返す。あれば絞り込む。
	return (list ?? []).filter((article) => {
		if (!article) return false;

		if (tags.length > 0) {
			const articleTags = Array.isArray(article.tags) ? article.tags : [];
			if (!tags.some((tag) => articleTags.includes(tag))) return false;
		}

		if (departments.length > 0) {
			if (!departments.includes(article.department)) return false;
		}

		if (categories.length > 0) {
			if (!categories.includes(article.category)) return false;
		}

		return true;
	});
};

const deriveCategory = (article) => {
	const tags = Array.isArray(article?.tags) ? article.tags : [];
	const hasAll = (required) => required.every((tag) => tags.includes(tag));

	if (hasAll(["経営", "人事", "組織"])) return "経営・人事・組織";
	if (tags.includes("公園")) return "公園";
	if (tags.includes("MVV")) return "MVV";
	if (tags.includes("Company")) return "Company";
	if (tags.includes("採用")) return "採用";
	if (tags.includes("イベント")) return "イベント";
	if (tags.includes("表彰")) return "表彰";

	return null;
};

// 記事表示まわりを集約するページコンポーネント
const ArticleScreen = ({
	initialFilterId,
	hideFilterUI = false,
	breadcrumbLabel = null,
	onNavigateHome,
	// 後方互換（以前のPropsからも初期値を作れるようにしておく）
	initialTab = "最新",
	initialQuickFilter = null,
}) => {
	const initialFromLegacy = initialQuickFilter ?? legacyTabToFilterId(initialTab);
	const [activeFilterId, setActiveFilterId] = useState(
		initialFilterId ?? initialFromLegacy
	);
	const [selectedArticle, setSelectedArticle] = useState(null);
	const [tagList, setTagList] = useState(tags);
	const {
		selectedTags,
		selectedDepartments,
		selectedCategories,
		toggleTag,
		toggleDepartment,
		toggleCategory,
		chips: additionalConditionChips,
		removeChip,
		clearAll: clearAllAdditionalConditions,
	} = useAdditionalConditions();
	// 記事データ
	const mockNormalizedBase = useMemo(() => normalizeArticles(mockArticles), []);
	const roleToDepartment = useMemo(() => {
		const list = Array.isArray(departments) ? departments : [];
		const map = new Map();
		if (list.length === 0) return map;
		//
		for (let i = 0; i < 10; i += 1) {
			map.set(i + 1, list[i % list.length]);
		}
		return map;
	}, []);
	const mockNormalized = useMemo(() => {
		return mockNormalizedBase.map((article) => {
			const department = article?.department ?? roleToDepartment.get(article?.authorRoleId) ?? null;
			const category = article?.category ?? deriveCategory(article);
			return { ...article, department, category };
		});
	}, [mockNormalizedBase, roleToDepartment]);
	const [articles, setArticles] = useState(() => mockNormalized.slice(0, INITIAL_PAGE_SIZE));
	const [isLoadingInitial, setIsLoadingInitial] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [loadError, setLoadError] = useState(null);
	const [nextPageToken, setNextPageToken] = useState(null);
	const [hasMore, setHasMore] = useState(mockNormalized.length > INITIAL_PAGE_SIZE);
	const [isApiMode, setIsApiMode] = useState(false);
	const [fallbackCursor, setFallbackCursor] = useState(INITIAL_PAGE_SIZE);
	const sentinelRef = useRef(null);
	const listScrollRef = useRef(0);

	const handleAddTag = (newTag) => {
		const normalized = newTag.trim();
		if (!normalized) return;
		if (tagList.includes(normalized)) return;
		setTagList((prev) => [...prev, normalized]);
	};

  // 初期フィルター設定（Props変更時も反映）
	useEffect(() => {
		const next = initialFilterId ?? (initialQuickFilter ?? legacyTabToFilterId(initialTab));
		setActiveFilterId(next);
	}, [initialFilterId, initialQuickFilter, initialTab]);

	const articlesWithFacets = useMemo(() => {
		return (articles ?? []).map((article) => {
			const department = article?.department ?? roleToDepartment.get(article?.authorRoleId) ?? null;
			const category = article?.category ?? deriveCategory(article);
			return { ...article, department, category };
		});
	}, [articles, roleToDepartment]);

	const filteredArticles = useMemo(() => {
		const quickFiltered = applyArticleFilter(articlesWithFacets, activeFilterId);
		return applyFacetFilters({
			list: quickFiltered,
			tags: selectedTags,
			departments: selectedDepartments,
			categories: selectedCategories,
		});
	}, [activeFilterId, articlesWithFacets, selectedCategories, selectedDepartments, selectedTags]);

	const hasAdditionalConditions = additionalConditionChips.length > 0;
	const shouldShowEmptyResultNotice =
		!isLoadingInitial &&
		!isLoadingMore &&
		!loadError &&
		filteredArticles.length === 0;

	// 初回ロード: APIを試し、未設定/失敗ならモックで継続
	useEffect(() => {
		let isMounted = true;

		const loadInitial = async () => {
			try {
				const result = await fetchArticles({ pageSize: INITIAL_PAGE_SIZE });

				if (isMounted && result?.items && result.items.length > 0) {
					setArticles(result.items);
					setNextPageToken(result.nextPageToken ?? null);
					setHasMore(Boolean(result.nextPageToken) || result.items.length === INITIAL_PAGE_SIZE);
					setIsApiMode(true);
					setLoadError(null);
					return;
				}

				if (isMounted) {
					setHasMore(mockNormalized.length > INITIAL_PAGE_SIZE);
					setIsApiMode(false);
				}
			} catch (error) {
				if (isMounted) {
					setLoadError("記事の取得に失敗しました");
					setHasMore(mockNormalized.length > INITIAL_PAGE_SIZE);
					setIsApiMode(false);
				}
			} finally {
				if (isMounted) {
					setIsLoadingInitial(false);
				}
			}
		};

		loadInitial();

		return () => {
			isMounted = false;
		};
	}, [mockNormalized]);

	// 次ページを取得（API: nextPageToken、モック: slice）
	const loadMore = useCallback(async () => {
		if (isLoadingInitial || isLoadingMore) return;

		if (isApiMode) {
			if (!hasMore && !nextPageToken) return;

			setIsLoadingMore(true);
			try {
				const result = await fetchArticles({ pageToken: nextPageToken, pageSize: PAGE_SIZE });

				const newItems = result?.items ?? [];
				const nextToken = result?.nextPageToken ?? null;

				setLoadError(null);
				setArticles((prev) => [...prev, ...newItems]);
				setNextPageToken(nextToken);

				const stillHasMore = Boolean(nextToken) || newItems.length === PAGE_SIZE;
				setHasMore(stillHasMore);
			} catch (error) {
				setLoadError("記事の追加取得に失敗しました");
				setHasMore(false);
			} finally {
				setIsLoadingMore(false);
			}
			return;
		}

		// モックデータモード（API未設定時のフェールセーフ）
		if (fallbackCursor >= mockNormalized.length) {
			setHasMore(false);
			return;
		}

		const nextCursor = Math.min(fallbackCursor + PAGE_SIZE, mockNormalized.length);
		setArticles(mockNormalized.slice(0, nextCursor));
		setFallbackCursor(nextCursor);
		setHasMore(nextCursor < mockNormalized.length);
	}, [
		fallbackCursor,
		hasMore,
		isApiMode,
		isLoadingInitial,
		isLoadingMore,
		mockNormalized,
		nextPageToken,
	]);

	// スクロール終端を監視し、自動で次ページ取得
	useEffect(() => {
		const target = sentinelRef.current;
		if (!target) return;
		if (!hasMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry?.isIntersecting) {
					loadMore();
				}
			},
			{ rootMargin: "200px" }
		);

		observer.observe(target);
		return () => observer.disconnect();
	}, [hasMore, loadMore]);

	const handleSelectArticle = (article) => {
		listScrollRef.current = window.scrollY;
		setSelectedArticle(article);
	};

	const handleBackToList = () => {
		setSelectedArticle(null);
		requestAnimationFrame(() => {
			window.scrollTo({ top: listScrollRef.current, behavior: "instant" });
		});
	};

	if (selectedArticle) {
		return <ArticleDetail article={selectedArticle} onBack={handleBackToList} />;
	}

	return (
		<>
			<div className="articles-page">
				<div className="content-header">
					<div className="content-header-left">
						{breadcrumbLabel ? (
							<Breadcrumb
								items={[
									{ label: "ホーム", onClick: onNavigateHome },
									{ label: breadcrumbLabel },
								]}
							/>
						) : (
							<h1 className="title">記事</h1>
						)}

						{hideFilterUI ? null : (
							<div className="article-filter-bar article-filter-bar--left">
								<ArticleFilterDropdown
									value={activeFilterId}
									onChange={setActiveFilterId}
								/>
							</div>
						)}

						{hasAdditionalConditions ? (
							<AdditionalConditionsBar
								label="追加条件"
								chips={additionalConditionChips}
								onRemove={removeChip}
								onClear={clearAllAdditionalConditions}
							/>
						) : null}
					</div>
				</div>
				<div className="articles-with-rightbar">
				<section className="articles-section">
					{isLoadingInitial ? <p className="notice">記事を読み込み中...</p> : null}
					{loadError ? <p className="notice error">{loadError}</p> : null}
					<ArticleGrid articles={filteredArticles} onSelect={handleSelectArticle} />
					{isLoadingMore ? <p className="notice">さらに読み込み中...</p> : null}
					{shouldShowEmptyResultNotice ? (
						<p className="notice">該当する記事がありませんでした。</p>
					) : null}
					{!shouldShowEmptyResultNotice && !hasMore && !isLoadingInitial ? (
						<p className="notice">すべて読み込みました</p>
					) : null}
					<div ref={sentinelRef} className="load-more-sentinel" aria-hidden="true" />
				</section>

				{/* この記事画面専用の右カラム。別メニューでは表示しない */}
				<Rightbar
					categories={categories}
					tags={tagList}
					onAddTag={handleAddTag}
					departments={departments}
					selectedCategories={selectedCategories}
					selectedTags={selectedTags}
					selectedDepartments={selectedDepartments}
					onToggleCategory={toggleCategory}
					onToggleTag={toggleTag}
					onToggleDepartment={toggleDepartment}
				/>
				</div>
			</div>
		</>
	);
};

export default ArticleScreen;
