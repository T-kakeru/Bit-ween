import { useEffect, useMemo, useState } from "react";
import { applyArticleFilter, legacyTabToFilterId } from "../logic/articleFilters";
import { applyFacetFilters } from "../logic/articleFacets";

const useArticleFilters = ({
  initialFilterId,
  initialTab = "最新",
  initialQuickFilter = null,
  articles = [],
  selectedTags = [],
  selectedDepartments = [],
  selectedCategories = [],
} = {}) => {
  const initialFromLegacy = initialQuickFilter ?? legacyTabToFilterId(initialTab);
  const [activeFilterId, setActiveFilterId] = useState(initialFilterId ?? initialFromLegacy);

  useEffect(() => {
    const next = initialFilterId ?? (initialQuickFilter ?? legacyTabToFilterId(initialTab));
    setActiveFilterId(next);
  }, [initialFilterId, initialQuickFilter, initialTab]);

  const filteredArticles = useMemo(() => {
    const quickFiltered = applyArticleFilter(articles, activeFilterId);
    return applyFacetFilters({
      list: quickFiltered,
      selectedTags,
      selectedDepartments,
      selectedCategories,
    });
  }, [activeFilterId, articles, selectedCategories, selectedDepartments, selectedTags]);

  return {
    activeFilterId,
    setActiveFilterId,
    filteredArticles,
  };
};

export default useArticleFilters;
