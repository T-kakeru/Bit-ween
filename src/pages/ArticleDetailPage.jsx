import ArticleDetail from "@/features/articles/components/views/ArticleDetail";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import Button from "@/shared/ui/Button";
import TextCaption from "@/shared/ui/TextCaption";

// pages: 画面全体の状態と分岐を統合する（詳細表示 / 戻るなど）
// NOTE: 記事詳細の見た目自体は features 側（ArticleDetail）に寄せ、Page は「画面」としての責務のみ持つ
const ArticleDetailPage = ({ article, onBack, isSaved, toggleSaved }) => {
  if (!article) {
    return (
      <section className="screen article-detail-screen">
        <Heading level={1}>記事</Heading>
        <TextCaption>記事が見つかりませんでした。</TextCaption>
        <Divider />
        <Button type="button" variant="outline" onClick={onBack}>
          戻る
        </Button>
      </section>
    );
  }

  return <ArticleDetail article={article} onBack={onBack} isSaved={isSaved} toggleSaved={toggleSaved} />;
};

export default ArticleDetailPage;
