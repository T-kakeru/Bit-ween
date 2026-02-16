import type { FormEventHandler, ReactNode } from "react";
import Divider from "@/shared/ui/Divider";
import Button from "@/shared/ui/Button";
import Breadcrumb, { type BreadcrumbItem } from "@/shared/components/Breadcrumb";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

import type { ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import {
  FieldDate,
  FieldChipGroup,
  FieldSelect,
  FieldText,
  NameField,
} from "@/features/addRetirement/components/molecules";

type Props = {
  breadcrumbs: BreadcrumbItem[];
  form: ManagerRowInput;

  csvImportSection?: ReactNode;
  onScrollToCsvImport?: () => void;

  isActive: boolean | null;
  onChangeIsActive: (next: boolean) => void;

  registerName: any;

  employeeIdError?: string;
  departmentError?: string;
  nameError?: string;

  genderError?: string;

  birthDateError?: string;
  joinDateError?: string;
  retireDateError?: string;
  isActiveError?: string;
  statusError?: string;
  clientError?: string;
  reasonError?: string;
  remarkError?: string;

  genderOptions: Array<ManagerRowInput["性別"]>;
  onChangeGender: (v: string) => void;

  onChangeBirthDate: (v: string) => void;

  onChangeEmployeeId: (v: string) => void;
  departmentOptions: string[];
  onChangeDepartment: (v: string) => void;

  onChangeJoinDate: (v: string) => void;
  onChangeRetireDate: (v: string) => void;

  statusOptions: string[];
  reasonOptions: string[];
  clientOptions: string[];

  onChangeStatus: (v: string) => void;
  onChangeClient: (v: string) => void;
  onChangeReason: (v: string) => void;
  onChangeRemark: (v: string) => void;

  canSubmit: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
};

export const ManagerAddFormView = ({
  breadcrumbs,
  form,
  csvImportSection,
  onScrollToCsvImport,
  isActive,
  onChangeIsActive,
  isActiveError,
  registerName,
  employeeIdError,
  departmentError,
  nameError,
  genderError,
  birthDateError,
  joinDateError,
  retireDateError,
  statusError,
  clientError,
  reasonError,
  remarkError,
  genderOptions,
  departmentOptions,
  onChangeEmployeeId,
  onChangeDepartment,
  onChangeGender,
  onChangeBirthDate,
  onChangeJoinDate,
  onChangeRetireDate,
  statusOptions,
  reasonOptions,
  clientOptions,
  onChangeStatus,
  onChangeClient,
  onChangeReason,
  onChangeRemark,
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

          {onScrollToCsvImport ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onScrollToCsvImport}
              >
                まとめて登録 (CSV)
              </Button>
            </div>
          ) : null}
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
              required
              value={form["生年月日"]}
              onChange={onChangeBirthDate}
              errorMessage={birthDateError}
            />
          </div>

          {/* 基本情報の下にグレーのライン（社員ID区切り） */}
          <Divider className="border-slate-200" />

          <div className="space-y-5">
            <FieldText
              label="社員ID"
              required
              value={form["社員ID"]}
              onChange={onChangeEmployeeId}
              placeholder="社員IDを入力"
              errorMessage={employeeIdError}
              maxLength={30}
            />

            <FieldSelect
              label="部署"
              required
              value={form["部署"]}
              options={departmentOptions}
              onChange={onChangeDepartment}
              errorMessage={departmentError}
            />

            <FieldDate
              label="入社日"
              required
              value={form["入社日"]}
              onChange={onChangeJoinDate}
              errorMessage={joinDateError}
            />

            <FieldChipGroup
              label="在籍状態"
              required
              value={isActive === null ? "" : isActive ? "在籍中" : "退職済"}
              options={["在籍中", "退職済"]}
              onChange={(v) => onChangeIsActive(v === "在籍中")}
              allowEmpty={false}
              errorMessage={isActiveError}
            />

            {isActive === false ? (
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

                <FieldText
                  label="備考"
                  value={form["備考"]}
                  onChange={onChangeRemark}
                  placeholder="備考を入力（200文字まで）"
                  maxLength={200}
                  errorMessage={remarkError}
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

            <FieldSelect
              label="稼働先"
              value={form["当時のクライアント"]}
              options={clientOptions}
              onChange={onChangeClient}
              placeholder="クライアント名"
              errorMessage={clientError}
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

        {csvImportSection ? <div className="mt-10">{csvImportSection}</div> : null}
      </div>
    </section>
  );
};
