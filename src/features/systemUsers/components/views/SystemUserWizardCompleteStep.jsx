import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

const SystemUserWizardCompleteStep = ({ completionInfo, onCopy, onBackToList }) => {
  return (
    <div className="space-y-5">
      <div>
        <Heading level={3}>登録完了・招待情報</Heading>
        <TextCaption className="mt-1">アカウントの登録が完了しました。以下の情報を招待時にご利用ください。</TextCaption>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        登録が完了しました。
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="grid grid-cols-[160px_1fr] gap-2 text-sm">
          <p className="font-semibold text-slate-700">メールアドレス</p>
          <p className="text-slate-900 break-all">{completionInfo.email}</p>
        </div>

        <div className="grid grid-cols-[160px_1fr] gap-2 text-sm">
          <p className="font-semibold text-slate-700">初期パスワード</p>
          <p className="text-slate-900">{completionInfo.initialPassword}</p>
        </div>

        <div className="grid grid-cols-[160px_1fr] gap-2 text-sm">
          <p className="font-semibold text-slate-700">招待リンク</p>
          <p className="text-slate-900 break-all">{completionInfo.inviteLink}</p>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCopy}>
          情報をコピーする
        </Button>
        <Button type="button" onClick={onBackToList}>
          一覧に戻る
        </Button>
      </div>
    </div>
  );
};

export default SystemUserWizardCompleteStep;
