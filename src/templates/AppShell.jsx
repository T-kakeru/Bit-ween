// サイドバーメニューレスポンシブ対応のためのオーバーレイ追加
import PageTitle from "@/shared/ui/PageTitle/PageTitle";

const AppShell = ({ header, sidebar, children, isSidebarOpen, onOverlayClick, pageTitle }) => {
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
        <main className="content">
          <PageTitle title={pageTitle} />
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
