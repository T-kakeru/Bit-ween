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
import SystemUsersPage from "./pages/SystemUsersPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import SessionExpiredPage from "./pages/SessionExpiredPage";
import NotFoundPanel from "@/shared/components/NotFoundPanel";
import useArticleEntryParentInfo from "./features/articles/hooks/useArticleEntryParentInfo";
import useSavedArticlesState from "@/features/articles/hooks/useSavedArticlesState";
import { useAuth } from "@/features/auth/context/AuthContext";
// 画面に必要なテストデータ（API未接続時の表示用）
import navItems from "@/shared/data/mock/navItems.json";

const AUTH_PATHS = ["/login", "/forgot-password", "/reset-password"];

const normalizeAuthPath = (path) => (AUTH_PATHS.includes(path) ? path : "/login");

function App() {
  const { isLoggedIn } = useAuth();
  const savedArticles = useSavedArticlesState();
  const [authPath, setAuthPath] = useState(() =>
    typeof window === "undefined" ? "/login" : normalizeAuthPath(window.location.pathname)
  );
  const [appPath, setAppPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname
  );

  const adminNavItems = [
    { type: "section", label: "業務" },
    { label: "退職者分析", icon: "/img/icon_manager.png" },
    { label: "社員情報一覧", icon: "/img/icon_data.png" },
    { type: "divider", label: "divider-business" },
    { type: "section", label: "システム管理" },
    { label: "利用者管理", icon: "/img/default.png" },
    { label: "設定", icon: "/img/icon_settings.png" },
    //フェーズ２: ユーザーユースケースへのメニュー導線を再検討後に表示
    // { label: "ユーザー画面", icon: "/img/icon_home.png" },
  ];

  // 現在選択されているタブ
  const [activeNav, setActiveNav] = useState("ホーム");
  const [adminNav, setAdminNav] = useState("退職者分析");
  const [isAdminMode, setIsAdminMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageTitleOverride, setPageTitleOverride] = useState(null);
  const { articleEntry, articleScreenKey, resetArticleEntry, openArticlesWithFilter } =
    useArticleEntryParentInfo({ setActiveNav, setIsSidebarOpen });
  const user = {
    name: "山田 一郎",
    role: "管理者",
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

  useEffect(() => {
    const onPopState = () => {
      if (typeof window === "undefined") return;
      setAppPath(window.location.pathname);
      setAuthPath(normalizeAuthPath(window.location.pathname));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isLoggedIn) {
      setAppPath(window.location.pathname);
      setAuthPath(normalizeAuthPath(window.location.pathname));
      return;
    }

    if (AUTH_PATHS.includes(window.location.pathname)) {
      window.history.replaceState({}, "", "/");
      setAppPath("/");
    }
  }, [isLoggedIn]);

  const navigateAuth = (path) => {
    if (typeof window === "undefined") return;
    const normalized = normalizeAuthPath(path);
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, "", normalized);
    }
    setAppPath(normalized);
    setAuthPath(normalized);
  };

  if (!isLoggedIn) {
    if (!AUTH_PATHS.includes(appPath)) {
      return (
        <SessionExpiredPage
          onGoLogin={() => navigateAuth("/login")}
          onBack={() => {
            if (typeof window === "undefined") return;
            if (window.history.length > 1) {
              window.history.back();
              return;
            }
            navigateAuth("/login");
          }}
        />
      );
    }

    if (authPath === "/forgot-password") {
      return <ForgotPasswordPage onBackToLogin={() => navigateAuth("/login")} />;
    }

    if (authPath === "/reset-password") {
      return <ResetPasswordPage onBackToLogin={() => navigateAuth("/login")} />;
    }

    return (
      <LoginPage
        onNavigateForgotPassword={() => navigateAuth("/forgot-password")}
        onLoginSuccess={() => {
          if (typeof window !== "undefined") {
            window.history.replaceState({}, "", "/");
          }
          setAppPath("/");
        }}
      />
    );
  }

  if (appPath === "/coming-soon") {
    return (
      <ComingSoonPage
        onBack={() => {
          if (typeof window === "undefined") return;
          if (window.history.length > 1) {
            window.history.back();
            return;
          }
          window.history.replaceState({}, "", "/settings");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }}
      />
    );
  }


  const handleOpenSettings = () => {
    setActiveNav("設定");
    setIsSidebarOpen(false);
  };

  const handleOpenHome = () => {
    setActiveNav("ホーム");
    setIsSidebarOpen(false);
  };

  const handleRequestEmployeeRegisterFromSystemUsers = (payload) => {
    const email = String(payload?.email ?? "").trim();
    const role = String(payload?.role ?? "general").trim().toLowerCase();
    try {
      window.dispatchEvent(
        new CustomEvent("systemUsers:startIntegratedRegister", {
          detail: {
            email,
            role: role === "admin" ? "admin" : "general",
          },
        })
      );
    } catch (e) {
      // ignore
    }
    setAdminNav("社員情報一覧");
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

      if (adminNav === "利用者管理") {
        return (
          <SystemUsersPage
            onRequestEmployeeRegister={handleRequestEmployeeRegisterFromSystemUsers}
          />
        );
      }

      return (
        <NotFoundPanel
          onBack={() => setAdminNav("設定")}
          backLabel="設定へ戻る"
        />
      );
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

    if (activeNav === "記事") {
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
    }

    return <NotFoundPanel onBack={handleOpenHome} backLabel="ホームへ戻る" />;
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
          menuTitle={isAdminMode ? "管理者メニュー" : "メニュー"}
        />
      }
      isSidebarOpen={isSidebarOpen}
      onOverlayClick={() => setIsSidebarOpen(false)}
      pageTitle={
        pageTitleOverride ??
        (isAdminMode ? (adminNav === "利用者管理" ? "システム利用者管理" : adminNav) : activeNav)
      }
    >
      {renderNavContent()}
    </AppShell>
  );
}

export default App;
