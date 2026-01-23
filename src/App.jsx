import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ArticleScreen from "./pages/ArticleScreen";
import HomeScreen from "./pages/HomeScreen";
import MyPageScreen from "./pages/MyPageScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import SettingsScreen from "./pages/SettingsScreen";
import { useArticleEntryParentInfo } from "./hooks/useArticleEntryParentInfo";
// 画面に必要なテストデータ（API未接続時の表示用）
import navItems from "./data/mock/navItems.json";
// App はスクロールや右カラムを持たず、ArticleScreen 内で完結させる

function App() {
  // 現在選択されているタブ
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState("記事");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { articleEntry, articleScreenKey, resetArticleEntry, openArticles, openArticlesWithFilter } =
    useArticleEntryParentInfo({ setActiveNav, setIsSidebarOpen });
  const user = {
    name: "山田 一郎",
    role: "マネージャー",
    team: "OPEN PARK",
    department: "プロダクト推進部",
    status: "オンライン",
    icon: "👤",
    stats: {
      posts: 12,
      saved: 4,
      reactions: 28,
    },
  };

  const handleToggleLogin = () => {
    setIsLoggedIn((prev) => !prev);
  };

  const handleNavChange = (nav) => {
    setActiveNav(nav);
    setIsSidebarOpen(false);

    if (nav === "記事") {
      resetArticleEntry();
    }
  };

  const handleOpenSettings = () => {
    setActiveNav("設定");
    setIsSidebarOpen(false);
  };

  const handleOpenHome = () => {
    setActiveNav("ホーム");
    setIsSidebarOpen(false);
  };

  const handleOpenArticles = () => {
    openArticles();
  };

  const renderNavContent = () => {
    if (activeNav === "ホーム") {
      return <HomeScreen onOpenArticles={openArticlesWithFilter} />;
    }

    if (activeNav === "通知") {
      return <NotificationsScreen />;
    }

    if (activeNav === "マイページ") {
      return <MyPageScreen onOpenSettings={handleOpenSettings} />;
    }

    if (activeNav === "設定") {
      return <SettingsScreen />;
    }

    return (
      <ArticleScreen
        key={articleScreenKey}
        initialFilterId={articleEntry.filterId}
			  hideFilterUI={articleEntry.hideFilterUI}
			  breadcrumbLabel={articleEntry.breadcrumbLabel}
			  onNavigateHome={handleOpenHome}
      />
    );
  };

  return (
    <div className="app">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        isMenuOpen={isSidebarOpen}
      />

      {isSidebarOpen ? (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="メニューを閉じる"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div className={isSidebarOpen ? "sidebar-drawer is-open" : "sidebar-drawer"}>
        <Sidebar
          navItems={navItems}
          activeNav={activeNav}
          onNavChange={handleNavChange}
          user={user}
        />
      </div>

      <div className="layout">
        <main className="content">{renderNavContent()}</main>
      </div>
    </div>
  );
}

export default App;
