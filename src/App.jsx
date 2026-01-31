import { useState } from "react";
import AppShell from "./templates/AppShell";
import AppHeader from "./templates/Header/AppHeader";
import AppSidebar from "./templates/Sidebar/AppSidebar";
import ArticlesPage from "./pages/ArticlesPage";
import HomePage from "./pages/HomePage";
import MyPage from "./pages/MyPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import ManagerPage from "./pages/ManagerPage";
import useArticleEntryParentInfo from "./features/articles/hooks/useArticleEntryParentInfo";
import useSavedArticlesState from "@/features/articles/hooks/useSavedArticlesState";
// 画面に必要なテストデータ（API未接続時の表示用）
import navItems from "@/shared/data/mock/navItems.json";

function App() {
  const savedArticles = useSavedArticlesState();

  // 現在選択されているタブ
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
    icon: "/img/sampleimg.png",
    stats: {
      posts: 12,
      saved: 4,
      reactions: 28,
    },
  };

  const handleNavChange = (nav) => {
    setActiveNav(nav);
    setIsSidebarOpen(false);

    // dispatch a global navigation event so feature pages can react (e.g. reset internal UI)
    try {
      window.dispatchEvent(new CustomEvent("app:navigate", { detail: nav }));
    } catch (e) {
      // ignore in non-browser environments
    }

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

  const renderNavContent = () => {
    if (activeNav === "ホーム") {
      return <HomePage onOpenArticles={openArticlesWithFilter} savedArticles={savedArticles} />;
    }

    if (activeNav === "通知") {
      return <NotificationsPage />;
    }

    if (activeNav === "管理画面") {
      return <ManagerPage />;
    }

    if (activeNav === "マイページ") {
      return <MyPage onOpenSettings={handleOpenSettings} />;
    }

    if (activeNav === "設定") {
      return <SettingsPage />;
    }

    return (
      <ArticlesPage
        key={articleScreenKey}
        initialFilterId={articleEntry.filterId}
        hideFilterUI={articleEntry.hideFilterUI}
        breadcrumbLabel={articleEntry.breadcrumbLabel}
        onNavigateHome={handleOpenHome}
        savedArticles={savedArticles}
      />
    );
  };

  return (
    <AppShell
      header={
        <AppHeader
          user={user}
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
          isMenuOpen={isSidebarOpen}
        />
      }
      sidebar={<AppSidebar navItems={navItems} activeNav={activeNav} onNavChange={handleNavChange} user={user} />}
      isSidebarOpen={isSidebarOpen}
      onOverlayClick={() => setIsSidebarOpen(false)}
      pageTitle={activeNav}
    >
      {renderNavContent()}
    </AppShell>
  );
}

export default App;
