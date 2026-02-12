import type { ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import Breadcrumb, { type BreadcrumbItem } from "@/shared/components/Breadcrumb";
import Card from "@/shared/ui/Card";
import Divider from "@/shared/ui/Divider";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";

type Props = {
  breadcrumbs: BreadcrumbItem[];
  payload: ManagerRowInput & { is_active: boolean };
  onBack: () => void;
  onConfirm: () => void;
};

const buildRows = (payload: ManagerRowInput & { is_active: boolean }) => {
  const rows: Array<{ label: string; value: string }> = [];

  const push = (label: string, value: any) => {
    const v = String(value ?? "").trim();
    rows.push({ label, value: v || "-" });
  };

  push("社員ID", payload["社員ID"]);
  push("氏名", payload["名前"]);
  push("メールアドレス", payload["メールアドレス"]);
  push("部署", payload["部署"]);
  push("性別", payload["性別"]);
  push("生年月日", payload["生年月日"]);
  push("入社日", payload["入社日"]);
  push("退職日", payload["退職日"]);

  if (payload.is_active === false) {
    push("退職理由", payload["退職理由"]);
  }

  push("稼働状態", payload["ステータス"]);
  push("稼働先", payload["当時のクライアント"]);

  return rows;
};

export const ManagerAddConfirmView = ({ breadcrumbs, payload, onBack, onConfirm }: Props) => {
  const isEmployeeRegistration = payload.is_active;
  const rows = buildRows(payload);

  return (
    <section className="screen manager-add-screen">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="mb-4">
          <Heading level={2}>入力内容の確認</Heading>
          <TextCaption>
            {isEmployeeRegistration
              ? "在籍中として登録されます。登録後に案内（メールアドレス・初期パスワード）を表示します。"
              : "この内容で登録します。"}
          </TextCaption>
        </div>

        <Card className="p-5">
          <div className="divide-y divide-slate-200">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-12 gap-3 py-3">
                <div className="col-span-4 text-sm font-semibold text-slate-600">{r.label}</div>
                <div className="col-span-8 text-sm text-slate-900 break-words">{r.value}</div>
              </div>
            ))}
          </div>

          <Divider className="my-5 border-slate-200" />

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onBack}>
              戻る
            </Button>
            <Button type="button" onClick={onConfirm}>
              登録する
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
