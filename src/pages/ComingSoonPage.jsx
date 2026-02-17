import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

const ComingSoonPage = ({ onBack }) => {
  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }

    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/settings");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <section className="coming-soon-screen" aria-label="準備中ページ">
      <div className="coming-soon-card">
        <Heading level={2}>この機能は現在準備中です</Heading>
        <TextCaption>もうしばらくお待ちください。</TextCaption>
        <Button type="button" variant="outline" size="md" onClick={handleBack}>
          前の画面に戻る
        </Button>
      </div>
    </section>
  );
};

export default ComingSoonPage;
