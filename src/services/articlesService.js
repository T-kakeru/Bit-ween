// 記事APIの窓口
import { getJson } from "./apiClient";
import { normalizeArticles } from "./mappers/articleMapper";

// 記事一覧の取得（API → UI向けに整形）
export const fetchArticles = async () => {
  const data = await getJson("/articles");
  return normalizeArticles(data);
};
