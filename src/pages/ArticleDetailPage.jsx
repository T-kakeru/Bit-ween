import ArticleDetail from "@/features/articles/components/views/ArticleDetail";

// pages: 画面全体の状態と分岐を統合する（詳細表示 / 戻るなど）
// NOTE: 記事詳細の見た目自体は features 側（ArticleDetail）に寄せ、Page は「画面」としての責務のみ持つ
const ArticleDetailPage = ({ article, onBack, isSaved, toggleSaved }) => {
  if (!article) {
    return (
      <section className="screen article-detail-screen">
        <div className="content-header">
          <div>
            <h1 className="title">記事</h1>
            <p className="muted">記事が見つかりませんでした。</p>
          </div>
          <div>
            <button type="button" className="pill-button" onClick={onBack}>
              戻る
            </button>
          </div>
        </div>
      </section>
    );
  }

  return <ArticleDetail article={article} onBack={onBack} isSaved={isSaved} toggleSaved={toggleSaved} />;
};

export default ArticleDetailPage;
