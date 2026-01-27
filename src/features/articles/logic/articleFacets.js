// 記事に「部署」「カテゴリ」などのファセット情報を付与し、追加条件で絞り込む

export const deriveCategory = (article) => {
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

const buildRoleToDepartmentMap = (departments) => {
  const list = Array.isArray(departments) ? departments : [];
  const map = new Map();
  if (list.length === 0) return map;

  for (let i = 0; i < 10; i += 1) {
    map.set(i + 1, list[i % list.length]);
  }

  return map;
};

export const addArticleFacets = (articles, { departments } = {}) => {
  const roleToDepartment = buildRoleToDepartmentMap(departments);
  return (articles ?? []).map((article) => {
    const department =
      article?.department ?? roleToDepartment.get(article?.authorRoleId) ?? null;
    const category = article?.category ?? deriveCategory(article);
    return { ...article, department, category };
  });
};

export const applyFacetFilters = ({
  list,
  selectedTags,
  selectedDepartments,
  selectedCategories,
}) => {
  const tags = selectedTags ?? [];
  const departments = selectedDepartments ?? [];
  const categories = selectedCategories ?? [];

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
