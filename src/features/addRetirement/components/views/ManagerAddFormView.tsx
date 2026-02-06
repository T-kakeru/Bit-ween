import type { FormEventHandler } from "react";
import Divider from "@/shared/ui/Divider";
import Button from "@/shared/ui/Button";
import Breadcrumb, { type BreadcrumbItem } from "@/shared/components/Breadcrumb";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

import type { ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import {
  FieldDate,
  FieldNumber,
  FieldChipGroup,
  FieldCombobox,
  FieldSelect,
  FieldText,
  NameField,
} from "@/features/addRetirement/components/molecules";

type Props = {
  breadcrumbs: BreadcrumbItem[];
  form: ManagerRowInput;

  isActive: boolean;
  onChangeIsActive: (next: boolean) => void;

  registerName: any;

  employeeIdError?: string;
  departmentError?: string;
  nameError?: string;

  genderError?: string;

  birthDateError?: string;
  emailError?: string;
  joinDateError?: string;
  retireDateError?: string;
  statusError?: string;
  clientError?: string;
  reasonError?: string;
  educationPointError?: string;
  careerPointError?: string;

  genderOptions: Array<ManagerRowInput["性別"]>;
  onChangeGender: (v: string) => void;

  onChangeBirthDate: (v: string) => void;
  onChangeEmail: (v: string) => void;

  onChangeEmployeeId: (v: string) => void;
  departmentOptions: string[];
  onChangeDepartment: (v: string) => void;
  onAddDepartmentOption: (v: string) => void;

  onChangeJoinDate: (v: string) => void;
  onChangeRetireDate: (v: string) => void;

  statusOptions: string[];
  reasonOptions: string[];
  clientOptions: string[];
  onAddClientOption: (v: string) => void;

  onChangeStatus: (v: string) => void;
  onChangeClient: (v: string) => void;
  onChangeReason: (v: string) => void;

  onChangeEducationPoint: (v: number | "") => void;
  onChangeCareerPoint: (v: number | "") => void;

  canSubmit: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
};

export const ManagerAddFormView = ({
  breadcrumbs,
  form,
  isActive,
  onChangeIsActive,
  registerName,
  employeeIdError,
  departmentError,
  nameError,
  genderError,
  birthDateError,
  emailError,
  joinDateError,
  retireDateError,
  statusError,
  clientError,
  reasonError,
  educationPointError,
  careerPointError,
  genderOptions,
  departmentOptions,
  onAddDepartmentOption,
  onChangeEmployeeId,
  onChangeDepartment,
  onChangeGender,
  onChangeBirthDate,
  onChangeEmail,
  onChangeJoinDate,
  onChangeRetireDate,
  statusOptions,
  reasonOptions,
  clientOptions,
  onAddClientOption,
  onChangeStatus,
  onChangeClient,
  onChangeReason,
  onChangeEducationPoint,
  onChangeCareerPoint,
  canSubmit,
  onSubmit,
  onCancel,
}: Props) => {
  return (
    <section className="screen manager-screen">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="mb-1">
              <Breadcrumb items={breadcrumbs} />
            </div>

				<Heading level={2}>新規従業員登録</Heading>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-8">
          <div className="space-y-5">
            <NameField label="氏名" register={registerName} errorMessage={nameError} required />

            <FieldChipGroup
              label="性別"
              required
              value={form["性別"]}
              options={genderOptions}
              onChange={onChangeGender}
              allowEmpty={false}
              errorMessage={genderError}
            />

            <FieldDate
              label="生年月日"
              value={form["生年月日"]}
              onChange={onChangeBirthDate}
              errorMessage={birthDateError}
            />
          </div>

          {/* 連絡先の上にグレーのライン */}
          <Divider className="border-slate-200" />

          <div className="space-y-5">
            <FieldText
              label="メールアドレス"
              required
              value={form["メールアドレス"]}
              onChange={onChangeEmail}
              placeholder="example@company.com"
              errorMessage={emailError}
            />
          </div>

          {/* 連絡先の下にグレーのライン（社員ID区切り） */}
          <Divider className="border-slate-200" />

          <div className="space-y-5">
            <FieldText
              label="社員ID"
              required
              value={form["社員ID"]}
              onChange={onChangeEmployeeId}
              placeholder="社員IDを入力"
              errorMessage={employeeIdError}
            />

            <FieldCombobox
              label="部署"
              required
              value={form["部署"]}
              options={departmentOptions}
              onChange={onChangeDepartment}
              onAddOption={onAddDepartmentOption}
              placeholder="部署を登録"
              errorMessage={departmentError}
            />

            <FieldDate
              label="入社日"
              value={form["入社日"]}
              onChange={onChangeJoinDate}
              errorMessage={joinDateError}
            />

            <FieldChipGroup
              label="在籍状態"
              required
              value={isActive ? "在籍中" : "退職済"}
              options={["在籍中", "退職済"]}
              onChange={(v) => onChangeIsActive(v === "在籍中")}
              allowEmpty={false}
            />

            {!isActive ? (
              <>
                <FieldDate
                  label="退職日"
                  value={form["退職日"]}
                  onChange={onChangeRetireDate}
                  errorMessage={retireDateError}
                />
                <FieldSelect
                  label="退職理由"
                  required
                  value={form["退職理由"]}
                  options={reasonOptions}
                  onChange={onChangeReason}
                  errorMessage={reasonError}
                />
              </>
            ) : null}

            <Divider className="border-slate-200" />

            <FieldSelect
              label="稼働状態"
              required
              value={form["ステータス"]}
              options={statusOptions}
              onChange={onChangeStatus}
              errorMessage={statusError}
            />

            <FieldCombobox
              label="稼働先"
              value={form["当時のクライアント"]}
              options={clientOptions}
              onChange={onChangeClient}
              onAddOption={onAddClientOption}
              placeholder="検索 or 追加"
              errorMessage={clientError}
            />
          </div>

          <div className="space-y-5">
            <FieldNumber
              label="学歴P"
              value={form["学歴point"]}
              onChange={onChangeEducationPoint}
              errorMessage={educationPointError}
            />
            <FieldNumber
              label="経歴P"
              value={form["経歴point"]}
              onChange={onChangeCareerPoint}
              errorMessage={careerPointError}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              確認へ進む
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
