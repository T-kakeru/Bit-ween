import buildQueryString from "@/shared/logic/buildQueryString";

// 記事API用のクエリ文字列を生成
const buildArticleQuery = ({ pageToken, pageSize }) => {
  return buildQueryString({ pageToken, pageSize });
};

export default buildArticleQuery;
