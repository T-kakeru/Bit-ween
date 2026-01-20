// ヘッダー：ロゴとユーザー情報を表示
const Header = ({ user, onMenuToggle, isMenuOpen }) => {
  return (
    <header className="header">
      <div className="brand">
        <button
          type="button"
          className="header-menu"
          aria-label="メニューを開く"
          aria-expanded={isMenuOpen}
          onClick={onMenuToggle}
        >
          ☰
        </button>
        <span className="brand-name">Bit-ween</span>
      </div>
      <div className="header-search" role="search">
        <span>🔎</span>
        <input type="text" placeholder="検索" />
      </div>
      <div className="header-status">
        <span className="status-icon">🔔</span>
        <span className="avatar">{user?.icon ?? "👤"}</span>
        <span className="status-company">Reach</span>
      </div>
    </header>
  );
};

export default Header;
