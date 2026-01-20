// 記事データをUIで扱いやすい形に整形
// バックエンドの項目名が変わっても、ここを修正すればUI側の変更を最小化できる
const normalizeArticle = (raw) => {
  if (!raw) return null;

  return {
    // 必須項目
    id: raw.id ?? raw.articleId ?? raw.postId,
    title: raw.title ?? raw.name ?? "(無題)",
    author: raw.author ?? raw.authorName ?? raw.userName ?? "不明",
    date: raw.date ?? raw.publishedAt ?? raw.createdAt ?? "-",

    // 表示用
    icon: raw.icon ?? "👤",
    image: raw.image ?? raw.coverImage ?? "city",

    // タグは配列に統一
    tags: Array.isArray(raw.tags)
      ? raw.tags
      : raw.tag
      ? String(raw.tag).split("・")
      : [],

    // 権限ID（将来の権限チェック用）
    authorRoleId: raw.authorRoleId ?? raw.roleId ?? raw.permissionId ?? null,

    // フィルタや表示で使うフラグ
    isPopular: Boolean(raw.isPopular ?? raw.popular ?? false),
    isSaved: Boolean(raw.isSaved ?? raw.saved ?? false),
    isRead: Boolean(raw.isRead ?? raw.read ?? false),

    // 補足情報
    coverage: raw.coverage ?? raw.coverageRate ?? 0,
    summary: raw.summary ?? raw.description ?? "",
  };
};

export const normalizeArticles = (rawData) => {
  if (!rawData) return [];

  const source = Array.isArray(rawData) ? rawData : rawData.items ?? rawData.data ?? [];
  return source.map(normalizeArticle).filter(Boolean);
};
