// サイドバーメニューレスポンシブ対応のためのオーバーレイ追加
const AppShell = ({ header, sidebar, children, isSidebarOpen, onOverlayClick }) => {
  return (
    <div className="app">
      {header}

      {isSidebarOpen ? (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="メニューを閉じる"
          onClick={onOverlayClick}
        />
      ) : null}

      <div className={isSidebarOpen ? "sidebar-drawer is-open" : "sidebar-drawer"}>{sidebar}</div>

      <div className="layout">
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
