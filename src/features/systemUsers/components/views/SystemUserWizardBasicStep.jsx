import Heading from "@/shared/ui/Heading";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import TextCaption from "@/shared/ui/TextCaption";

const SystemUserWizardBasicStep = ({
  basicInfo,
  onChangeBasicInfo,
  errorMessage,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <Heading level={3}>基本情報入力</Heading>
        <TextCaption className="mt-1">メールアドレスと権限を設定します。</TextCaption>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1">メールアドレス</p>
          <Input
            type="email"
            value={basicInfo.email}
            onChange={(e) => onChangeBasicInfo({ email: e.target.value })}
            placeholder="user@example.com"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1">権限</p>
          <Select value={basicInfo.role} onChange={(e) => onChangeBasicInfo({ role: e.target.value })}>
            <option value="general">General（一般）</option>
            <option value="admin">Admin（管理者）</option>
          </Select>
        </div>
      </div>

      {errorMessage ? <p className="text-xs text-rose-600">{errorMessage}</p> : null}
    </div>
  );
};

export default SystemUserWizardBasicStep;
