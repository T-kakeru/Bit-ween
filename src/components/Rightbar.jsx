import { useState } from "react";

// 右カラム：カテゴリ/タグ/部門の一覧
const Rightbar = ({ categories, tags, onAddTag, departments }) => {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    onAddTag(value);
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
        <h3>☰ カテゴリ</h3>
        <ul>
          {categories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <h3># タグ</h3>
        <div className="tag-list vertical">
          {tags.map((tag) => (
            <span key={tag} className="tag-chip">#{tag}</span>
          ))}
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
          <button type="button" onClick={handleAddTag}>追加</button>
        </div>
      </section>
      <section className="panel">
        <h3>★ 部門</h3>
        <ul>
          {/* 部門一覧 */}
          {departments.map((department) => (
            <li key={department}>{department}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
};

export default Rightbar;
