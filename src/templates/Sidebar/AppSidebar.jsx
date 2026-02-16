import Icon from "@/shared/ui/Icon";
import Divider from "@/shared/ui/Divider";

// サイドバー：メニューを表示
const AppSidebar = ({ navItems, activeNav, onNavChange, menuTitle = "メニュー" }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">{menuTitle}</div>
      <nav className="nav">
        {navItems.map((item, index) => {
          if (item?.type === "section") {
            return (
              <p key={`${item.label}-${index}`} className="nav-section-title">
                {item.label}
              </p>
            );
          }

          if (item?.type === "divider") {
            return <Divider key={`${item.label}-${index}`} className="sidebar-nav-divider" />;
          }

          return (
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
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
