import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

const AdminEngagementPage = () => {
  return (
    <section className="screen admin-screen">
      <div className="admin-header">
        <div>
          <Heading level={2} className="admin-title">
            エンゲージメント
          </Heading>
          <TextCaption>従業員のエンゲージメント指標を確認します。</TextCaption>
        </div>
      </div>
      <Card className="admin-panel">
        <TextCaption>エンゲージメントのレポートがここに表示されます。</TextCaption>
      </Card>
    </section>
  );
};

export default AdminEngagementPage;
