import type { FormEventHandler } from "react";
import type { UserProfile } from "@/shared/api/usersService";
import Divider from "@/shared/ui/Divider";
import Button from "@/shared/ui/Button";
import Breadcrumb from "@/shared/components/Breadcrumb";

import type { ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";
import { FieldDate, FieldNumber, FieldChipGroup, FieldCombobox, FieldShell, NameField } from "@/features/addRetirement/components/molecules";

type EmploymentMode = "retired" | "active";

type Props = {
  breadcrumbs: Array<{ label: string; onClick?: () => void }>;

  employmentMode: EmploymentMode;
  onChangeEmploymentMode: (next: EmploymentMode) => void;

  employeeQuery: string;
  onChangeEmployeeQuery: (v: string) => void;

  selectedEmployee: UserProfile | null;// 選択中の社員情報
  activeCandidates: UserProfile[];
  onSelectEmployee: (u: UserProfile) => void;// 選択された社員を設定する

  shouldShowDetails: boolean;
  isFormLocked: boolean;// 入力不可状態かどうか

  form: ManagerRowInput;

  registerName: any;
  nameError?: string;

  genderError?: string;

  birthDateError?: string;
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
  onChangeJoinDate: (v: string) => void;
  onChangeRetireDate: (v: string) => void;

  statusOptions: string[];
  reasonOptions: string[];
  clientOptions: string[];
  onAddStatusOption: (v: string) => void;
  onAddReasonOption: (v: string) => void;
  onAddClientOption: (v: string) => void;

  hasStatusColumn: boolean;

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
  employmentMode,
  onChangeEmploymentMode,
  employeeQuery,
  onChangeEmployeeQuery,
  selectedEmployee,
  activeCandidates,
  onSelectEmployee,
  shouldShowDetails,
  isFormLocked,
  form,
  registerName,
  nameError,
  genderError,
  birthDateError,
  joinDateError,
  retireDateError,
  statusError,
  clientError,
  reasonError,
  educationPointError,
  careerPointError,
  genderOptions,
  onChangeGender,
  onChangeBirthDate,
  onChangeJoinDate,
  onChangeRetireDate,
  statusOptions,
  reasonOptions,
  clientOptions,
  onAddStatusOption,
  onAddReasonOption,
  onAddClientOption,
  hasStatusColumn,
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
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-8">
          <div className="space-y-5">
            <FieldChipGroup
              label="登録する社員の状態"
              required
              helper="退職者を登録するか、既存（在籍）社員に紐づけて登録するかを選択します"
              value={employmentMode === "retired" ? "退職者" : "在籍"}
              options={["退職者", "在籍"]}
              allowEmpty={false}
              onChange={(v) => {
                if (v === "退職者") {
                  onChangeEmploymentMode("retired");
                  return;
                }
                onChangeEmploymentMode("active");
              }}
            />

            <Divider className="border-slate-200" />

            {employmentMode === "active" ? (
              <FieldShell label="社員を検索する" required helper="名前で検索して既存（在籍）社員を選択してください">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={employeeQuery}
                    onChange={(e) => onChangeEmployeeQuery(e.target.value)}
                    placeholder="例）山田"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
                  />

                  {selectedEmployee ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      選択中: {String(selectedEmployee?.name ?? "")}
                    </div>
                  ) : null}

                  {activeCandidates.length ? (
                    <ul className="max-h-44 overflow-auto rounded-lg border border-slate-200 bg-white">
                      {activeCandidates.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            onClick={() => onSelectEmployee(u)}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-50"
                          >
                            <span className="font-medium">{String(u?.name ?? "")}</span>
                            <span className="text-xs text-slate-500">{String(u?.status ?? "")}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">候補がありません</p>
                  )}
                </div>
              </FieldShell>
            ) : null}
          </div>

          {shouldShowDetails ? (
            <>
              <div className="space-y-5">
                {isFormLocked ? (
                  <>
                    <FieldShell label="名前" required>
                      <input
                        type="text"
                        value={form["名前"]}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
                      />
                    </FieldShell>
                    <FieldShell label="性別">
                      <input
                        type="text"
                        value={form["性別"] || ""}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
                      />
                    </FieldShell>
                    <FieldShell label="生年月日">
                      <input
                        type="text"
                        value={form["生年月日"] || ""}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
                      />
                    </FieldShell>
                  </>
                ) : (
                  <>
                    <NameField label="名前" register={registerName} errorMessage={nameError} required />
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
                  </>
                )}
              </div>

              <Divider className="border-slate-200" />

              <div className="space-y-5">
                {isFormLocked ? (
                  <FieldShell label="入社日">
                    <input
                      type="text"
                      value={form["入社日"] || ""}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
                    />
                  </FieldShell>
                ) : (
                  <FieldDate
                    label="入社日"
                    value={form["入社日"]}
                    onChange={onChangeJoinDate}
                    errorMessage={joinDateError}
                  />
                )}

                {employmentMode === "retired" ? (
                  <FieldDate
                    label="退職日"
                    value={form["退職日"]}
                    onChange={onChangeRetireDate}
                    errorMessage={retireDateError}
                  />
                ) : null}

                {isFormLocked ? (
                  <FieldShell label="ステータス">
                    <input
                      type="text"
                      value={form["ステータス"] || ""}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
                    />
                  </FieldShell>
                ) : (
                  <FieldCombobox
                    label="ステータス"
                    value={form["ステータス"]}
                    options={statusOptions}
                    onChange={onChangeStatus}
                    onAddOption={onAddStatusOption}
                    helper={hasStatusColumn ? "検索して選択 / 新規追加" : "（COLUMNSに無い場合でも保存可能）"}
                    placeholder="検索 or 追加"
                    errorMessage={statusError}
                  />
                )}

                <FieldCombobox
                  label="当時のクライアント"
                  value={form["当時のクライアント"]}
                  options={clientOptions}
                  onChange={onChangeClient}
                  onAddOption={onAddClientOption}
                  placeholder="検索 or 追加"
                  errorMessage={clientError}
                />

                {employmentMode === "retired" ? (
                  <FieldCombobox
                    label="退職理由"
                    value={form["退職理由"]}
                    options={reasonOptions}
                    onChange={onChangeReason}
                    onAddOption={onAddReasonOption}
                    placeholder="検索 or 追加"
                    errorMessage={reasonError}
                  />
                ) : null}
              </div>

              <Divider className="border-slate-200" />

              <div className="space-y-5">
                <FieldNumber
                  label="学歴point"
                  value={form["学歴point"]}
                  onChange={onChangeEducationPoint}
                  errorMessage={educationPointError}
                />
                <FieldNumber
                  label="経歴point"
                  value={form["経歴point"]}
                  onChange={onChangeCareerPoint}
                  errorMessage={careerPointError}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">社員を選択すると入力内容が表示されます。</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              保存する
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
