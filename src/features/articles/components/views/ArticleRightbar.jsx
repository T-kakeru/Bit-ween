import { useMemo, useState } from "react";
import Icon from "@/shared/ui/Icon";

// 右カラム：カテゴリ/タグ/部門の一覧
const ArticleRightbar = ({
  categories,
  tags,
  onAddTag,
  departments,
  selectedCategories = [],
  selectedTags = [],
  selectedDepartments = [],
  onToggleCategory,
  onToggleTag,
  onToggleDepartment,
}) => {
  const [tagInput, setTagInput] = useState("");

  const selectedCategorySet = useMemo(() => new Set(selectedCategories), [selectedCategories]);
  const selectedTagSet = useMemo(() => new Set(selectedTags), [selectedTags]);
  const selectedDepartmentSet = useMemo(
    () => new Set(selectedDepartments),
    [selectedDepartments]
  );

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    onAddTag?.(value);
    setTagInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  return (
    <aside className="rightbar">
      <section className="panel">
        <h3>
          <Icon className="manager-filter-icon" src="/img/icon_article.png" alt="" /> カテゴリ
        </h3>
        <ul>
          {categories.map((category) => {
            const isActive = selectedCategorySet.has(category);

            return (
              <li key={category}>
                <button
                  type="button"
                  className={isActive ? "rightbar-pill is-active" : "rightbar-pill"}
                  onClick={
                    typeof onToggleCategory === "function"
                      ? () => onToggleCategory(category)
                      : undefined
                  }
                  aria-pressed={isActive}
                >
                  {category}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="panel">
        <h3># タグ</h3>
        <div className="tag-list vertical">
          {tags.map((tag) => {
            const isActive = selectedTagSet.has(tag);

            return (
              <button
                key={tag}
                type="button"
                className={isActive ? "tag-chip is-active" : "tag-chip"}
                onClick={typeof onToggleTag === "function" ? () => onToggleTag(tag) : undefined}
                aria-pressed={isActive}
              >
                #{tag}
              </button>
            );
          })}
        </div>
        <div className="tag-add modern">
          <input
            type="text"
            placeholder="タグを追加"
            aria-label="タグを追加"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" onClick={handleAddTag}>
            追加
          </button>
        </div>
      </section>
      <section className="panel">
        <h3>部署</h3>
        <ul>
          {departments.map((department) => {
            const isActive = selectedDepartmentSet.has(department);

            return (
              <li key={department}>
                <button
                  type="button"
                  className={isActive ? "rightbar-pill is-active" : "rightbar-pill"}
                  onClick={
                    typeof onToggleDepartment === "function"
                      ? () => onToggleDepartment(department)
                      : undefined
                  }
                  aria-pressed={isActive}
                >
                  {department}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
};

export default ArticleRightbar;
