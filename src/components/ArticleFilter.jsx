import { useEffect, useRef, useState } from "react";

export const DEFAULT_ARTICLE_FILTER_ID = "latest";

// 後方互換: 以前の画面では「タブ名（日本語ラベル）」で初期状態が渡ってきていた。
// 新設計では filterId を唯一の正にしたいので、変換はここ（フィルター定義側）に集約する。
const LEGACY_TAB_TO_FILTER_ID = {
  最新: DEFAULT_ARTICLE_FILTER_ID,
  人気: "popular",
  保存済み: "saved",
  未読: "unread",
};

export const legacyTabToFilterId = (tab) => {
  return LEGACY_TAB_TO_FILTER_ID[tab] ?? DEFAULT_ARTICLE_FILTER_ID;
};

// 日付文字列/値をタイムスタンプに変換（不正値は0を返す）
const toDateTime = (value) => {
  const normalized = String(value ?? "").replace(/\//g, "-");
  const time = new Date(normalized).getTime();
  return Number.isFinite(time) ? time : 0;
};

// 日付降順ソート
const sortByDateDesc = (list) => {
  return [...(list ?? [])].sort((a, b) => toDateTime(b?.date) - toDateTime(a?.date));
};

// 今週の開始・終了日時を取得（開始: 月曜0時、終了: 次の月曜0時）
const getWeekRange = (base = new Date()) => {
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);

  // 週の始まり: 月曜日
  const day = start.getDay();
  const diffToMonday = (day + 6) % 7;
  start.setDate(start.getDate() - diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
};

// 「アーティクルフィルター」
// - 記事の並び替え（ソート）/フィルタの定義を一元管理する
// - ほしい条件（filterId）を渡せば、ラベル表示や絞り込み処理をここに任せられる
//
// 重要: 画面間（Home→記事など）で同じ filterId を使い回せるので、
// 条件追加/名称変更がこの1箇所で済むようになります。
export const ARTICLE_FILTERS = {
  latest: {
    id: "latest",
    label: "最新",
    group: "並び替え",
    apply: (list) => {
      return sortByDateDesc(list);
    },
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
      const today = new Date().toISOString().slice(0, 10);
      const filtered = (list ?? []).filter(
        (article) =>
          !article.isRead && String(article.date ?? "").replace(/\//g, "-") === today
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
  reading: {
    id: "reading",
    label: "読みかけ",
    group: "フィルタ",
    apply: (list) =>
      sortByDateDesc(
        (list ?? []).filter((article) => article.isRead === false && (article.coverage ?? 0) >= 30)
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

// 指定の filterId に基づいて記事リストを絞り込む
export const applyArticleFilter = (articles, filterId) => {
  const filter = resolveArticleFilter(filterId);
  return filter?.apply ? filter.apply(articles ?? []) : articles ?? [];
};

// 記事フィルター選択ドロップダウンコンポーネント
export const ArticleFilterDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(event.target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const active = resolveArticleFilter(value);

  return (
    <div
      ref={rootRef}
      className="article-filter article-filter-dropdown"
    >
      <button
        type="button"
        className="tab-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="tab-trigger-label">{active?.label ?? "フィルタ"}</span>
        <span className="tab-trigger-caret">▾</span>
      </button>

      <div className={isOpen ? "tab-menu is-open" : "tab-menu"} role="menu">
        {ARTICLE_FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="menuitemradio"
            aria-checked={option.id === active?.id}
            className={option.id === active?.id ? "tab-option is-active" : "tab-option"}
            onClick={() => {
              onChange?.(option.id);
              setIsOpen(false);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
