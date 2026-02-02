import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import RetirementAnalyticsDashboard from "@/features/retirementAnalytics/components/RetirementAnalyticsDashboard";

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
      <RetirementAnalyticsDashboard />
    </section>
  );
};

export default AdminAnalyticsPage;
