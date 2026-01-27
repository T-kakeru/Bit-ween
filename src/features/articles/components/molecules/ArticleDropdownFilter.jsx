import { useEffect, useRef, useState } from "react";
import { ARTICLE_FILTER_OPTIONS, resolveArticleFilter } from "../../logic/articleFilters";

// 記事専用: ドロップダウンメニュー（フィルター）
const ArticleDropdownFilter = ({ value, onChange }) => {
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
    <div ref={rootRef} className="article-filter article-filter-dropdown">
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

export default ArticleDropdownFilter;
