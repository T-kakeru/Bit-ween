// APIクライアント（共通）
// 実務ではここに認証トークン付与やエラーハンドリングを集約します
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const buildUrl = (path) => {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}${path}`;
};

export const getJson = async (path) => {
  const url = buildUrl(path);

  // APIのURLが未設定なら取得をスキップ
  if (!url) return null;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`APIエラー: ${response.status}`);
  }

  return response.json();
};
