import { useState } from "react";

const MyPage = ({ user, tags, onAddTag, isLoggedIn, onToggleLogin, savedArticles }) => {
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
    <section className="mypage">
      <header className="mypage-header">
        <div>
          <p className="eyebrow">マイページ</p>
          <h1 className="title">{user.name}</h1>
          <p className="muted">
            {user.role} · {user.team}
          </p>
        </div>
        <div className="mypage-actions">
          <button className="pill-button" type="button">
            プロフィール編集
          </button>
          <button className="primary-button" type="button">
            新しい投稿
          </button>
        </div>
      </header>

      <div className="mypage-grid">
        <section className="card-panel profile-card">
          <div className="profile-row">
            <span className="avatar avatar-xl">{user.icon}</span>
            <div>
              <p className="profile-name">{user.name}</p>
              <p className="muted">{user.department}</p>
              <span className={`status-chip ${user.status === "オンライン" ? "online" : "offline"}`}>
                {user.status}
              </span>
            </div>
          </div>
          <div className="profile-stats">
            <div>
              <p className="stat-number">{user.stats.posts}</p>
              <p className="stat-label">投稿</p>
            </div>
            <div>
              <p className="stat-number">{user.stats.saved}</p>
              <p className="stat-label">保存</p>
            </div>
            <div>
              <p className="stat-number">{user.stats.reactions}</p>
              <p className="stat-label">リアクション</p>
            </div>
          </div>
        </section>

        <section className="card-panel login-panel">
          <h2>ログイン</h2>
          <p className="muted">今のセッション状態をここで切り替えできます。</p>
          <button className="primary-button" type="button" onClick={onToggleLogin}>
            {isLoggedIn ? "ログアウト" : "ログイン"}
          </button>
        </section>

        <section className="card-panel tag-panel">
          <h2>マイタグ</h2>
          <p className="muted">よく使うタグを整理しておきましょう。</p>
          <div className="tag-list vertical">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
              </span>
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
            <button type="button" onClick={handleAddTag}>
              追加
            </button>
          </div>
        </section>

        <section className="card-panel saved-panel">
          <h2>保存した記事</h2>
          <ul className="saved-list">
            {savedArticles.map((article) => (
              <li key={article.id}>
                <span className="avatar avatar-sm">{article.icon}</span>
                <div>
                  <p className="saved-title">{article.title}</p>
                  <p className="muted">{article.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
};

export default MyPage;
