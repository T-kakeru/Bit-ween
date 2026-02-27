import { fetchJson } from "@/shared/api/client";

// APIクライアント（共通）
// 実務用途: fetchの単一入口（requestId付与 / 例外の正規化）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const buildUrl = (path) => {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}${path}`;
};

const getJson = async (path) => {
  const url = buildUrl(path);

  // APIのURLが未設定なら取得をスキップ
  if (!url) return null;

  const result = await fetchJson({ url, scope: "apiClient", action: "getJson" });
  return result.data;
};

export default getJson;