import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

const SessionExpiredPage = ({ onGoLogin, onBack }) => {
  return (
    <section className="screen settings-screen">
      <Card className="settings-panel max-w-[560px] w-full mx-auto">
        <div className="settings-card-title-wrap">
          <Heading level={2}>セッションの有効期限が切れました</Heading>
          <TextCaption>
            安全のためログイン状態が解除されました。お手数ですが、もう一度ログインしてください。
          </TextCaption>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={onBack}>
            前の画面に戻る
          </Button>
          <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={onGoLogin}>
            ログイン画面へ
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default SessionExpiredPage;
