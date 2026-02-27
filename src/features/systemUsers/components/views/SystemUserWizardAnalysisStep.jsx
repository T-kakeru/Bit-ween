import { useMemo } from "react";
import useManagerEmployees from "@/features/retirement/hooks/useManagerEmployees";
import useManagerAddForm from "@/features/addRetirement/hooks/useManagerAddForm";
import useManagerAddOptionLists from "@/features/addRetirement/hooks/useManagerAddOptionLists";
import { normalizeManagerAddPayload } from "@/features/addRetirement/logic/normalizeManagerAddPayload";
import { ManagerAddFormView } from "@/features/addRetirement/components/views/ManagerAddFormView";

const GENDER_OPTIONS = ["男性", "女性", "その他"];

const EMPTY_BREADCRUMBS = [];

const SystemUserWizardAnalysisStep = ({ initialPayload, onBack, onNext, submitLabel = "確認へ進む" }) => {
  const { columns, rows } = useManagerEmployees();
  const { departmentOptions, statusOptions, reasonOptions, clientOptions } = useManagerAddOptionLists();
  const initialFormData = useMemo(() => {
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
  }, [initialPayload]);

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
    retireDateError,
    isActiveError,
    reasonError,
    remarkError,
    statusError,
    clientError,
    handleSubmit,
    setEmployeeId,
    setDepartment,
    setGender,
    setBirthDate,
    setJoinDate,
    setRetireDate,
    setStatus,
    setClient,
    setReason,
    setRemark,
    isActive,
    setIsActive,
  } = useManagerAddForm({
    columns,
    rows,
    initialFormData,
    initialIsActive: true,
  });

  const onSubmit = handleSubmit((values) => {
    if (!canSave) return;
    const payload = normalizeManagerAddPayload(form, values);
    onNext(payload);
  });

  return (
    <ManagerAddFormView
      breadcrumbs={EMPTY_BREADCRUMBS}
      hideBreadcrumbs
      hideIsActiveField
      title="社員情報入力"
      form={form}
      csvImportSection={undefined}
      isActive={isActive}
      registerName={registerName}
      employeeIdError={employeeIdError}
      departmentError={departmentError}
      nameError={nameError}
      genderError={genderError}
      birthDateError={birthDateError}
      joinDateError={joinDateError}
      retireDateError={retireDateError}
      isActiveError={isActiveError}
      reasonError={reasonError}
      remarkError={remarkError}
      statusError={statusError}
      clientError={clientError}
      genderOptions={GENDER_OPTIONS}
      departmentOptions={departmentOptions}
      statusOptions={statusOptions}
      reasonOptions={reasonOptions}
      clientOptions={clientOptions}
      onChangeEmployeeId={setEmployeeId}
      onChangeDepartment={setDepartment}
      onChangeGender={setGender}
      onChangeBirthDate={setBirthDate}
      onChangeJoinDate={setJoinDate}
      onChangeRetireDate={setRetireDate}
      onChangeStatus={setStatus}
      onChangeClient={setClient}
      onChangeReason={setReason}
      onChangeRemark={setRemark}
      onChangeIsActive={setIsActive}
      canSubmit={canSave}
      submitLabel={submitLabel}
      showCancelButton
      cancelLabel="キャンセル"
      onSubmit={onSubmit}
      onCancel={onBack}
    />
  );
};

export default SystemUserWizardAnalysisStep;
