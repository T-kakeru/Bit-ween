// サイドバー：メニューとユーザー情報を表示
const Sidebar = ({ navItems, activeNav, onNavChange, user }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-search" role="search">
        <span>🔎</span>
        <input type="text" placeholder="検索" />
      </div>
      <div className="sidebar-title">メニュー</div>
      <nav className="nav">
        {/* メニュー項目を描画 */}
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={item.label === activeNav ? "nav-item active" : "nav-item"}
            onClick={() => onNavChange(item.label)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge ? <span className="badge">{item.badge}</span> : null}
          </button>
        ))}
      </nav>
      <div className="sidebar-section">
        <div className="sidebar-subtitle">チーム</div>
        <div className="sidebar-team">Bit-ween開発</div>
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="avatar">{user.icon}</span>
          <div>
            <p className="sidebar-user-name">{user.name}</p>
            <p className="muted">{user.team}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
