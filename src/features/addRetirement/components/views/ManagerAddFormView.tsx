import type { FormEventHandler, ReactNode } from "react";
import Divider from "@/shared/ui/Divider";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
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
  hideBreadcrumbs?: boolean;

  csvImportSection?: ReactNode;

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
  submitLabel?: string;
  title?: string;
  showCancelButton?: boolean;
  cancelLabel?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
};

export const ManagerAddFormView = ({
  breadcrumbs,
  form,
  hideBreadcrumbs = false,
  csvImportSection,
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
  submitLabel = "確認へ進む",
  title = "分析データの追加",
  showCancelButton = true,
  cancelLabel = "キャンセル",
  onSubmit,
  onCancel,
}: Props) => {
  const hasCsvImportSection = Boolean(csvImportSection);

  return (
    <section className={`screen manager-screen ${hasCsvImportSection ? "" : "manager-screen--embedded"}`}>
      <div
        className={`mx-auto w-full manager-add-layout-shell ${
          hasCsvImportSection ? "max-w-6xl px-4 py-6" : "max-w-none px-0 py-0 manager-add-layout-shell--single"
        }`}
      >
        <div className={`manager-add-split-layout ${hasCsvImportSection ? "" : "manager-add-split-layout--single"}`}>
          <Card className="manager-add-form-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Heading level={2}>{title}</Heading>
                {!hideBreadcrumbs && breadcrumbs.length > 0 ? (
                  <div className="mt-1">
                    <Breadcrumb items={breadcrumbs} />
                  </div>
                ) : null}
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
              {showCancelButton ? (
                <Button type="button" variant="danger" className="settings-cancel-button" onClick={onCancel}>
                  {cancelLabel}
                </Button>
              ) : null}
              <Button type="submit" disabled={!canSubmit}>
                {submitLabel}
              </Button>
            </div>
            </form>
          </Card>

          {csvImportSection ? (
            <Card className="manager-add-form-card manager-add-csv-card">
              <div className="manager-add-csv-card-wrap">{csvImportSection}</div>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
};
