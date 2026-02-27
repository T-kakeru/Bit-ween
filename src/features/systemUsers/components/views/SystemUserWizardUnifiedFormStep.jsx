import { useMemo } from "react";
import Divider from "@/shared/ui/Divider";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";

import useManagerEmployees from "@/features/retirement/hooks/useManagerEmployees";
import useManagerAddForm from "@/features/addRetirement/hooks/useManagerAddForm";
import useManagerAddOptionLists from "@/features/addRetirement/hooks/useManagerAddOptionLists";
import { normalizeManagerAddPayload } from "@/features/addRetirement/logic/normalizeManagerAddPayload";

import {
  FieldDate,
  FieldChipGroup,
  FieldSelect,
  FieldText,
  FieldShell,
  NameField,
} from "@/features/addRetirement/components/molecules";

const GENDER_OPTIONS = ["男性", "女性", "その他"];

const buildInitialFormData = (initialPayload) => {
  if (!initialPayload) return undefined;
  return {
    "社員ID": initialPayload["社員ID"],
    "部署": initialPayload["部署"],
    "名前": initialPayload["名前"],
    "性別": initialPayload["性別"],
    "生年月日": initialPayload["生年月日"],
    "入社日": initialPayload["入社日"],
    "退職日": initialPayload["退職日"],
    "ステータス": initialPayload["ステータス"],
    "退職理由": initialPayload["退職理由"],
    "備考": initialPayload["備考"],
    "当時のクライアント": initialPayload["当時のクライアント"],
  };
};

const SystemUserWizardUnifiedFormStep = ({
  basicInfo,
  onChangeBasicInfo,
  basicErrorMessage,
  validateBasicInfo,
  initialEmployeePayload,
  onCancel,
  onNext,
  submitLabel = "確認の画面へ",
}) => {
  const { columns, rows } = useManagerEmployees();
  const { departmentOptions, statusOptions, clientOptions } = useManagerAddOptionLists();

  const initialFormData = useMemo(
    () => buildInitialFormData(initialEmployeePayload),
    [initialEmployeePayload]
  );

  const {
    form,
    canSave,
    registerName,
    employeeIdError,
    departmentError,
    nameError,
    genderError,
    birthDateError,
    joinDateError,
    statusError,
    clientError,
    handleSubmit,
    setEmployeeId,
    setDepartment,
    setGender,
    setBirthDate,
    setJoinDate,
    setStatus,
    setClient,
  } = useManagerAddForm({
    columns,
    rows,
    initialFormData,
    initialIsActive: true,
  });

  const onSubmit = handleSubmit((values) => {
    if (!validateBasicInfo()) return;
    if (!canSave) return;

    const payload = normalizeManagerAddPayload(form, values);
    onNext(payload);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-5">
        <FieldShell label="メールアドレス" required>
          <Input
            type="email"
            value={basicInfo.email}
            onChange={(e) => onChangeBasicInfo({ email: e.target.value })}
            placeholder="user@example.com"
          />
        </FieldShell>

        <FieldShell label="権限" required>
          <Select value={basicInfo.role} onChange={(e) => onChangeBasicInfo({ role: e.target.value })}>
            <option value="general">General（一般）</option>
            <option value="admin">Admin（管理者）</option>
          </Select>
        </FieldShell>
      </div>

      {basicErrorMessage ? <p className="text-xs text-rose-600">{basicErrorMessage}</p> : null}

      {/* 権限の下にグレーのライン */}
      <Divider className="border-slate-200" />

      <div className="space-y-5">
        <NameField label="氏名" register={registerName} errorMessage={nameError} required />

        <FieldChipGroup
          label="性別"
          required
          value={form["性別"]}
          options={GENDER_OPTIONS}
          onChange={setGender}
          allowEmpty={false}
          errorMessage={genderError}
        />

        <FieldDate
          label="生年月日"
          required
          value={form["生年月日"]}
          onChange={setBirthDate}
          errorMessage={birthDateError}
        />

        <FieldText
          label="社員ID"
          required
          value={form["社員ID"]}
          onChange={setEmployeeId}
          placeholder="社員IDを入力"
          errorMessage={employeeIdError}
          maxLength={30}
        />

        <FieldSelect
          label="部署"
          required
          value={form["部署"]}
          options={departmentOptions}
          onChange={setDepartment}
          errorMessage={departmentError}
        />

        <FieldDate
          label="入社日"
          required
          value={form["入社日"]}
          onChange={setJoinDate}
          errorMessage={joinDateError}
        />

        <FieldSelect
          label="稼働状態"
          required
          value={form["ステータス"]}
          options={statusOptions}
          onChange={setStatus}
          errorMessage={statusError}
        />

        <FieldSelect
          label="稼働先"
          value={form["当時のクライアント"]}
          options={clientOptions}
          onChange={setClient}
          placeholder="クライアント名"
          errorMessage={clientError}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={!canSave}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default SystemUserWizardUnifiedFormStep;
