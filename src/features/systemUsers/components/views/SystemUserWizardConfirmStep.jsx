import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

const roleLabelMap = {
  admin: "Admin（管理者）",
  general: "General（一般）",
};

const renderRow = (label, value) => (
  <div className="grid grid-cols-[140px_1fr] gap-2 text-sm" key={label}>
    <p className="font-semibold text-slate-700">{label}</p>
    <p className="text-slate-900">{String(value ?? "-") || "-"}</p>
  </div>
);

const SystemUserWizardConfirmStep = ({
  basicInfo,
  analysisPayload,
  onBack,
  onRegister,
  isRegistering,
  errorMessage,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <Heading level={3}>Step 3 / 確認</Heading>
        <TextCaption className="mt-1">入力内容を確認して、問題なければ登録してください。</TextCaption>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
        <p className="text-sm font-bold text-slate-900">基本情報</p>
        {renderRow("メールアドレス", basicInfo.email)}
        {renderRow("権限", roleLabelMap[basicInfo.role] || basicInfo.role)}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
        <p className="text-sm font-bold text-slate-900">分析データ紐付け</p>
        {renderRow("社員ID", analysisPayload?.["社員ID"])}
        {renderRow("氏名", analysisPayload?.["名前"])}
        {renderRow("部署", analysisPayload?.["部署"])}
        {renderRow("性別", analysisPayload?.["性別"])}
        {renderRow("生年月日", analysisPayload?.["生年月日"])}
        {renderRow("入社日", analysisPayload?.["入社日"])}
        {renderRow("在籍状態", analysisPayload?.is_active ? "在籍中" : "退職済")}
        {!analysisPayload?.is_active ? renderRow("退職日", analysisPayload?.["退職日"]) : null}
        {!analysisPayload?.is_active ? renderRow("退職理由", analysisPayload?.["退職理由"]) : null}
        {renderRow("稼働状態", analysisPayload?.["ステータス"])}
        {renderRow("稼働先", analysisPayload?.["当時のクライアント"])}
      </section>

      {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isRegistering}>
          戻る
        </Button>
        <Button type="button" onClick={onRegister} disabled={isRegistering}>
          登録する
        </Button>
      </div>
    </div>
  );
};

export default SystemUserWizardConfirmStep;
