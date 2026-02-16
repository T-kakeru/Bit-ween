import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import EmptyState from "@/shared/components/EmptyState";

const NotFoundPanel = ({ title = "該当するページが存在しません", description = "利用可能な画面へ戻って操作を続けてください。", onBack, backLabel = "設定へ戻る" }) => {
  return (
    <section className="screen">
      <Card className="settings-panel">
        <EmptyState title={title} description={description} />
        {typeof onBack === "function" ? (
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="outline" onClick={onBack}>
              {backLabel}
            </Button>
          </div>
        ) : null}
      </Card>
    </section>
  );
};

export default NotFoundPanel;
