// 記事フィルター（並び替え/絞り込み）の定義を一元管理する

import { getWeekRange, normalizeDateString, sortByDateDesc, toDateTime, toISODateString } from "./articleDate";

export const DEFAULT_ARTICLE_FILTER_ID = "latest";

// 後方互換: 以前は「タブ名（日本語ラベル）」で初期状態が渡ってきていた
const LEGACY_TAB_TO_FILTER_ID = {
  最新: DEFAULT_ARTICLE_FILTER_ID,
  人気: "popular",
  保存済み: "saved",
  未読: "unread",
};

export const legacyTabToFilterId = (tab) => {
  return LEGACY_TAB_TO_FILTER_ID[tab] ?? DEFAULT_ARTICLE_FILTER_ID;
};

export const ARTICLE_FILTERS = {
  latest: {
    id: "latest",
    label: "最新",
    group: "並び替え",
    apply: (list) => sortByDateDesc(list),
  },
  thisWeek: {
    id: "thisWeek",
    label: "今週の記事",
    group: "フィルタ",
    apply: (list) => {
      const { start, end } = getWeekRange(new Date());
      const filtered = (list ?? []).filter((article) => {
        const time = toDateTime(article?.date);
        return time >= start.getTime() && time < end.getTime();
      });
      return sortByDateDesc(filtered);
    },
  },
  popular: {
    id: "popular",
    label: "人気",
    group: "フィルタ",
    apply: (list) => sortByDateDesc((list ?? []).filter((article) => article.isPopular)),
  },
  saved: {
    id: "saved",
    label: "保存済み",
    group: "フィルタ",
    apply: (list) => sortByDateDesc((list ?? []).filter((article) => article.isSaved)),
  },
  unread: {
    id: "unread",
    label: "未読",
    group: "フィルタ",
    apply: (list) => sortByDateDesc((list ?? []).filter((article) => !article.isRead)),
  },
  todayUnread: {
    id: "todayUnread",
    label: "今日の未読",
    group: "フィルタ",
    apply: (list) => {
      const today = toISODateString(new Date());
      const filtered = (list ?? []).filter(
        (article) =>
          !article.isRead && normalizeDateString(article.date) === today
      );
      return sortByDateDesc(filtered);
    },
  },
  important: {
    id: "important",
    label: "お知らせ",
    group: "フィルタ",
    apply: (list) =>
      sortByDateDesc(
        (list ?? []).filter(
          (article) =>
            article.tags?.includes("周知事項") ||
            article.tags?.includes("重要") ||
            article.tags?.includes("お知らせ")
        )
      ),
  },
  recommended: {
    id: "recommended",
    label: "おすすめ",
    group: "フィルタ",
    apply: (list) => sortByDateDesc((list ?? []).filter((article) => article.isPopular)),
  },
};

export const ARTICLE_FILTER_OPTIONS = Object.values(ARTICLE_FILTERS);

export const resolveArticleFilter = (filterId) => {
  return ARTICLE_FILTERS[filterId] ?? ARTICLE_FILTERS[DEFAULT_ARTICLE_FILTER_ID];
};

export const applyArticleFilter = (articles, filterId) => {
  const filter = resolveArticleFilter(filterId);
  return filter?.apply ? filter.apply(articles ?? []) : articles ?? [];
};
