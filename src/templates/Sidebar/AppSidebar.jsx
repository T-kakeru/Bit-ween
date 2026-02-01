import Icon from "@/shared/ui/Icon";

// サイドバー：メニューとユーザー情報を表示
const AppSidebar = ({ navItems, activeNav, onNavChange, user, menuTitle = "メニュー" }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">{menuTitle}</div>
      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={item.label === activeNav ? "nav-item active" : "nav-item"}
            onClick={() => onNavChange(item.label)}
          >
            <Icon className="nav-icon" name={item.icon} />
            <span className="nav-item-text">
              <span className="nav-item-label">{item.label}</span>
            </span>
            {item.badge ? <span className="badge">{item.badge}</span> : null}
          </button>
        ))}
      </nav>
      <div className="sidebar-section">
        <div className="sidebar-subtitle">チーム</div>
        <div className="sidebar-team">Bit-ween開発</div>
      </div>
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-user"
          onClick={() => onNavChange("マイページ")}
          aria-label="マイページを開く"
        >
          <Icon className="avatar" name={user.icon} alt="" />
          <div>
            <p className="sidebar-user-name">{user.name}</p>
            <p className="muted">{user.team}</p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
