import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

const AdminAnalyticsPage = () => {
  return (
    <section className="screen admin-screen">
      <div className="admin-header">
        <div>
          <Heading level={2} className="admin-title">
            退職者分析
          </Heading>
          <TextCaption>離職傾向と要因を俯瞰するダッシュボードです。</TextCaption>
        </div>
      </div>
      <Card className="admin-panel">
        <TextCaption>分析カードやグラフはここに表示されます。</TextCaption>
      </Card>
    </section>
  );
};

export default AdminAnalyticsPage;
