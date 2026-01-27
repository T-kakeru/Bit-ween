// UI、API間で扱う記事データの整形処理
const normalizeArticle = (raw) => {
  if (!raw) return null;

  return {
    id: raw.id ?? raw.articleId ?? raw.postId,
    title: raw.title ?? raw.name ?? "(無題)",
    author: raw.author ?? raw.authorName ?? raw.userName ?? "不明",
    date: raw.date ?? raw.publishedAt ?? raw.createdAt ?? "-",
    icon: raw.icon ?? "/img/default.png",
    image: raw.image ?? raw.coverImage ?? "city",
    tags: Array.isArray(raw.tags)
      ? raw.tags
      : raw.tag
      ? String(raw.tag).split("・")
      : [],
    authorRoleId: raw.authorRoleId ?? raw.roleId ?? raw.permissionId ?? null,
    isPopular: Boolean(raw.isPopular ?? raw.popular ?? false),
    isSaved: Boolean(raw.isSaved ?? raw.saved ?? false),
    isRead: Boolean(raw.isRead ?? raw.read ?? false),
    summary: raw.summary ?? raw.description ?? "",
  };
};

const normalizeArticles = (rawData) => {
  if (!rawData) return [];

  const source = Array.isArray(rawData) ? rawData : rawData.items ?? rawData.data ?? [];
  return source.map(normalizeArticle).filter(Boolean);
};

export default normalizeArticles;
