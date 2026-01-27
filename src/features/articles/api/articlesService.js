// 通信周りの処理をまとめたサービス層

import getJson from "@/shared/api/apiClient";
import buildArticleQuery from "../logic/buildArticleQuery";
import normalizeArticles from "./mappers/articleMapper";

// 記事一覧の取得（API → UI向けに整形）
const fetchArticles = async ({ pageToken = null, pageSize = 20 } = {}) => {
  const query = buildArticleQuery({ pageToken, pageSize });
  const path = query ? `/articles${query}` : "/articles";

  const data = await getJson(path);

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

export default fetchArticles;
