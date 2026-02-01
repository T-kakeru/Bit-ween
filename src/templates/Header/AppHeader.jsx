// ヘッダー：ロゴとユーザー情報を表示
const AppHeader = ({ user, onMenuToggle, isMenuOpen }) => {
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
      {/* header search removed - per request the per-page search is used instead */}
      <div className="header-status">
        <span className="status-company">Reach</span>
      </div>
    </header>
  );
};

export default AppHeader;
