import { useState } from "react";
import Breadcrumb, { type BreadcrumbItem } from "@/shared/components/Breadcrumb";
import Card from "@/shared/ui/Card";
import Divider from "@/shared/ui/Divider";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";

type Props = {
  breadcrumbs: BreadcrumbItem[];
  initialPassword: string;
  copyText: string;
  onDone: () => void;
};

export const ManagerAddCredentialsView = ({
  breadcrumbs,
  initialPassword,
  copyText,
  onDone,
}: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboardが使えない環境では手動コピーしてもらう
      setCopied(false);
    }
  };

  return (
    <section className="screen manager-add-screen">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="mb-4">
          <Heading level={2}>社員登録が完了しました</Heading>
          <TextCaption>以下をコピーして、本人へ案内してください。</TextCaption>
        </div>

        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4 text-sm font-semibold text-slate-600">初期パスワード</div>
            <div className="col-span-8 text-sm text-slate-900 break-words">{initialPassword || "-"}</div>
          </div>

          <Divider className="border-slate-200" />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-700">送付用テキスト</div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                  コピー
                </Button>
              </div>
            </div>
            {copied ? <TextCaption className="text-blue-600">コピーしました</TextCaption> : null}
            <textarea
              className="w-full min-h-[180px] rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-900"
              value={copyText}
              readOnly
            />
            <TextCaption>
              クリップボードが使えない場合は、上の文章を選択して手動でコピーしてください。
            </TextCaption>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" onClick={onDone}>
              一覧に戻る
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
