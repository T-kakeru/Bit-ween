import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Rightbar from "./components/Rightbar";
import Tabs from "./components/Tabs";
import ArticleGrid from "./components/ArticleGrid";
import ArticleDetail from "./components/ArticleDetail";
import DashboardHeader from "./components/DashboardHeader";
import MyPage from "./components/MyPage";
// 画面に必要なテストデータ（API未接続時の表示用）
import navItems from "./data/mock/navItems.json";
import tabs from "./data/mock/tabs.json";
import mockArticles from "./data/mock/articles.json";
import departments from "./data/mock/departments.json";
import categories from "./data/mock/categories.json";
import tags from "./data/mock/tags.json";
// API取得（サービス層）
import { fetchArticles } from "./services/articlesService";
import { normalizeArticles } from "./services/mappers/articleMapper";

function App() {
  // 現在選択されているタブ
  const [activeTab, setActiveTab] = useState("最新");
  const [tagList, setTagList] = useState(tags);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState("ホーム");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 記事データ（初期はテストデータ）
  const [articles, setArticles] = useState(normalizeArticles(mockArticles));
  // API取得の状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const user = {
    name: "山田 一郎",
    role: "コミュニティマネージャー",
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

  const handleAddTag = (newTag) => {
    const normalized = newTag.trim();
    if (!normalized) return;
    if (tagList.includes(normalized)) return;
    setTagList((prev) => [...prev, normalized]);
  };

  const handleToggleLogin = () => {
    setIsLoggedIn((prev) => !prev);
  };

  const handleNavChange = (nav) => {
    setActiveNav(nav);
    setSelectedArticle(null);
    setIsSidebarOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedArticle(null);
  };

  // 記事データをAPIから取得（取得できなければテストデータを維持）
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await fetchArticles();

        // API未設定の場合は null が返るため、テストデータで継続
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setArticles(data);
          setLoadError(null);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("記事の取得に失敗しました");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // タブに応じて記事を絞り込み
  const filteredArticles = useMemo(() => {
    if (activeTab === "最新") {
      return [...articles].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    if (activeTab === "人気") {
      return articles.filter((article) => article.isPopular);
    }

    if (activeTab === "保存済み") {
      return articles.filter((article) => article.isSaved);
    }

    if (activeTab === "未読") {
      return articles.filter((article) => !article.isRead);
    }

    return articles;
  }, [activeTab, articles]);

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

      <div className="layout">
        <div className={isSidebarOpen ? "sidebar-drawer is-open" : "sidebar-drawer"}>
          <Sidebar
            navItems={navItems}
            activeNav={activeNav}
            onNavChange={handleNavChange}
            user={user}
          />
        </div>

        <main className="content">
          {activeNav === "マイページ" ? (
            <MyPage
              user={user}
              tags={tagList}
              onAddTag={handleAddTag}
              isLoggedIn={isLoggedIn}
              onToggleLogin={handleToggleLogin}
              savedArticles={articles.filter((article) => article.isSaved)}
            />
          ) : (
            <>
              {selectedArticle ? (
                <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
              ) : (
                <>
                  <DashboardHeader />
                  {/* タブ切り替え */}
                  <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
                  {/* 読み込み・エラー表示 */}
                  {isLoading ? (
                    <p className="notice">記事を読み込み中...</p>
                  ) : null}
                  {loadError ? <p className="notice error">{loadError}</p> : null}
                  {/* 記事一覧 */}
                  <ArticleGrid articles={filteredArticles} onSelect={setSelectedArticle} />
                </>
              )}
            </>
          )}
        </main>

        <Rightbar
          categories={categories}
          tags={tagList}
          onAddTag={handleAddTag}
          departments={departments}
        />
      </div>
    </div>
  );
}

export default App;
