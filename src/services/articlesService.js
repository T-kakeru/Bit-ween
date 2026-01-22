// 記事APIの窓口
import { getJson } from "./apiClient";
import { normalizeArticles } from "./mappers/articleMapper";

// 記事一覧の取得（API → UI向けに整形）
// Google系APIの nextPageToken / pageToken を前提としたカーソル方式で取得
// pageSize は API 仕様に合わせてリクエストする（例: 12, 24 など）
export const fetchArticles = async ({ pageToken = null, pageSize = 20 } = {}) => {
  const searchParams = new URLSearchParams();
  if (pageToken) searchParams.set("pageToken", pageToken);
  if (pageSize) searchParams.set("pageSize", String(pageSize));

  const query = searchParams.toString();
  const path = query ? `/articles?${query}` : "/articles";

  const data = await getJson(path);

  // APIのURLが未設定の場合はフロント側でフェールセーフするため null を返却
  if (!data) {
    return {
      items: null,
      nextPageToken: null,
    };
  }

  const items = normalizeArticles(data);
  const nextPageToken =
    data?.nextPageToken ?? data?.next_page_token ?? data?.next_token ?? null;

  return {
    items,
    nextPageToken,
  };
};
