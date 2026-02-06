import { useEffect, useState } from "react";
import AppShell from "./templates/AppShell";
import AppHeader from "./templates/Header/AppHeader";
import AppSidebar from "./templates/Sidebar/AppSidebar";
import ArticlesPage from "./pages/ArticlesPage";
import HomePage from "./pages/HomePage";
import MyPage from "./pages/MyPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import ManagerPage from "./pages/ManagerPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import useArticleEntryParentInfo from "./features/articles/hooks/useArticleEntryParentInfo";
import useSavedArticlesState from "@/features/articles/hooks/useSavedArticlesState";
// 画面に必要なテストデータ（API未接続時の表示用）
import navItems from "@/shared/data/mock/navItems.json";

function App() {
  const savedArticles = useSavedArticlesState();

  const adminNavItems = [
    { label: "退職者分析", icon: "/img/icon_manager.png" },
    { label: "社員情報一覧", icon: "/img/icon_data.png" },
    { label: "設定", icon: "/img/icon_settings.png" },
    { label: "ユーザー画面", icon: "/img/icon_home.png" },
  ];

  // 現在選択されているタブ
  const [activeNav, setActiveNav] = useState("ホーム");
  const [adminNav, setAdminNav] = useState("退職者分析");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageTitleOverride, setPageTitleOverride] = useState(null);
  const { articleEntry, articleScreenKey, resetArticleEntry, openArticles, openArticlesWithFilter } =
    useArticleEntryParentInfo({ setActiveNav, setIsSidebarOpen });
  const user = {
    name: "山田 一郎",
    role: "マネージャー",
    team: "Bit-ween",
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
    setPageTitleOverride(null);
    if (isAdminMode) {
      if (nav === "ユーザー画面") {
        setIsAdminMode(false);
        setIsSidebarOpen(false);
        return;
      }
      setAdminNav(nav);
      setIsSidebarOpen(false);
    } else {
      if (nav === "管理画面") {
        setIsAdminMode(true);
        setAdminNav("退職者分析");
        setIsSidebarOpen(false);
        return;
      }
      setActiveNav(nav);
      setIsSidebarOpen(false);
    }

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

  useEffect(() => {
    if (!isAdminMode) {
      setActiveNav("ホーム");
      resetArticleEntry();
    }
  }, [isAdminMode, resetArticleEntry]);

  useEffect(() => {
    const handler = (e) => {
      try {
        const title = e?.detail;
        setPageTitleOverride(typeof title === "string" && title.trim() ? title : null);
      } catch (err) {
        setPageTitleOverride(null);
      }
    };
    window.addEventListener("app:page-title", handler);
    return () => window.removeEventListener("app:page-title", handler);
  }, []);


  const handleOpenSettings = () => {
    setActiveNav("設定");
    setIsSidebarOpen(false);
  };

  const handleOpenHome = () => {
    setActiveNav("ホーム");
    setIsSidebarOpen(false);
  };

  const renderNavContent = () => {
    if (isAdminMode) {
      if (adminNav === "退職者分析") {
        return <AdminAnalyticsPage />;
      }

      if (adminNav === "社員情報一覧") {
        return <ManagerPage />;
      }

      if (adminNav === "設定") {
        return <SettingsPage />;
      }
    }

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
      sidebar={
        <AppSidebar
          navItems={isAdminMode ? adminNavItems : navItems}
          activeNav={isAdminMode ? adminNav : activeNav}
          onNavChange={handleNavChange}
          user={user}
          menuTitle={isAdminMode ? "管理者メニュー" : "メニュー"}
        />
      }
      isSidebarOpen={isSidebarOpen}
      onOverlayClick={() => setIsSidebarOpen(false)}
      pageTitle={pageTitleOverride ?? (isAdminMode ? adminNav : activeNav)}
    >
      {renderNavContent()}
    </AppShell>
  );
}

export default App;
