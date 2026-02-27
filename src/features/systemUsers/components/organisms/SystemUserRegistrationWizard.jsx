import { useState } from "react";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import { useSystemUsersCrud } from "@/features/systemUsers/hooks/useSystemUsersCrud";
import { buildEmployeeCredentials } from "@/features/addRetirement/logic/buildEmployeeCredentials";
import { createEmployee, findEmployeeIdByEmployeeCode } from "@/services/employee/employeesService";
import { ERROR_MESSAGES, NOTIFY_MESSAGES } from "@/shared/constants/messages/appMessages";

import SystemUserWizardUnifiedFormStep from "@/features/systemUsers/components/views/SystemUserWizardUnifiedFormStep";
import SystemUserWizardConfirmStep from "@/features/systemUsers/components/views/SystemUserWizardConfirmStep";
import SystemUserWizardCompleteStep from "@/features/systemUsers/components/views/SystemUserWizardCompleteStep";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildInviteLink = (userId) => {
  const base = typeof window !== "undefined" ? window.location.origin : "https://bit-ween.local";
  return `${base}/invite/${encodeURIComponent(String(userId || "new-user"))}`;
};

const SystemUserRegistrationWizard = ({ companyId = "company-default", onCancel, onCompleted }) => {
  const { createUser } = useSystemUsersCrud({ companyId });
  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState({ email: "", role: "general" });
  const [employeePayload, setEmployeePayload] = useState(null);
  const [completionInfo, setCompletionInfo] = useState(null);
  const [basicError, setBasicError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleChangeBasicInfo = (patch) => {
    setBasicInfo((prev) => ({ ...prev, ...patch }));
    if (basicError) setBasicError("");
  };

  const validateBasicInfo = () => {
    const email = String(basicInfo.email ?? "").trim();
    const role = String(basicInfo.role ?? "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      setBasicError(ERROR_MESSAGES.SYSTEM_USERS.EMAIL_FORMAT_CHECK_DOT);
      return false;
    }

    if (role !== "admin" && role !== "general") {
      setBasicError(ERROR_MESSAGES.SYSTEM_USERS.ROLE_SELECT_ADMIN_GENERAL_DOT);
      return false;
    }

    setBasicError("");
    return true;
  };

  const handleRegister = async () => {
    if (!employeePayload) {
      setRegisterError(ERROR_MESSAGES.SYSTEM_USERS.EMPLOYEE_INFO_NOT_SET_DOT);
      return;
    }

    setIsRegistering(true);
    setRegisterError("");

    const baseEmployeeCode = String(employeePayload["社員ID"] ?? "").trim();
    const fullName = String(employeePayload["名前"] ?? "").trim();
    const gender = String(employeePayload["性別"] ?? "").trim();
    const birthDate = String(employeePayload["生年月日"] ?? "").trim();
    const joinDate = String(employeePayload["入社日"] ?? "").trim();
    const departmentName = String(employeePayload["部署"] ?? "").trim();
    const workStatusName = String(employeePayload["ステータス"] ?? "").trim();
    const clientName = String(employeePayload["当時のクライアント"] ?? "").trim();

    // 既存社員の入力を想定するが、DB上にまだ無い場合はここで追加する
    let employeeCode = baseEmployeeCode;
    try {
      const existingEmployeeId = await findEmployeeIdByEmployeeCode(employeeCode);
      if (!existingEmployeeId) {
        const created = await createEmployee({
          employeeCode,
          fullName,
          gender: gender || null,
          birthDate: birthDate || null,
          joinDate: joinDate || null,
          retireDate: null,
          departmentName,
          workStatusName,
          clientName: clientName || null,
          retirementReasonName: null,
          retirementReasonText: null,
        });
        if (!created.ok) {
          setIsRegistering(false);
          setRegisterError(created.message || ERROR_MESSAGES.EMPLOYEE.UI_CREATE_FAILED_DOT);
          return;
        }

        // createEmployee が重複回避で社員IDを自動採番した場合は、以降の処理にも反映する
        const createdEmployeeCode = String(created.employee?.["社員ID"] ?? "").trim();
        if (createdEmployeeCode) {
          employeeCode = createdEmployeeCode;
        }
      }
    } catch (e) {
      setIsRegistering(false);
      setRegisterError(ERROR_MESSAGES.EMPLOYEE.UI_CREATE_FAILED_DOT);
      return;
    }

    const credentials = buildEmployeeCredentials({ ...employeePayload, "社員ID": employeeCode });

    const result = await createUser({
      email: String(basicInfo.email ?? "").trim(),
      role: String(basicInfo.role ?? "general").trim().toLowerCase(),
      employeeCode,
      password: credentials.initialPassword,
    });

    if (!result.ok) {
      setIsRegistering(false);
      setRegisterError(result.message || ERROR_MESSAGES.SYSTEM_USERS.REGISTER_FAILED_DOT);
      return;
    }

    const inviteLink = buildInviteLink(result.user?.id);
    const copyText = [
      `${employeePayload["名前"] || "ご担当者"} 様`,
      "",
      "アカウント登録が完了しました。",
      `メールアドレス: ${String(basicInfo.email ?? "").trim()}`,
      `初期パスワード: ${credentials.initialPassword}`,
      `招待リンク: ${inviteLink}`,
      "",
      "※初回ログイン後にパスワード変更をお願いします。",
    ].join("\n");

    setCompletionInfo({
      email: String(basicInfo.email ?? "").trim(),
      initialPassword: credentials.initialPassword,
      inviteLink,
      copyText,
    });

    setIsRegistering(false);
    setStep(3);
  };

  const handleCopy = async () => {
    const text = String(completionInfo?.copyText ?? "");
    if (!text) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        window.alert(NOTIFY_MESSAGES.SYSTEM_USERS.INVITE_COPIED);
        return;
      }
    } catch {
      // fallbackへ
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      window.alert(NOTIFY_MESSAGES.SYSTEM_USERS.INVITE_COPIED);
    } catch {
      window.alert(NOTIFY_MESSAGES.SYSTEM_USERS.COPY_FAILED);
    }
  };

  return (
    <div className="system-user-wizard-stack">
      {step === 1 ? (
        <Card className="settings-panel">
          <div className="settings-row">
            <div>
              <Heading level={3} className="manager-card-title">アカウント登録</Heading>
            </div>
          </div>

          <div className="px-6 pb-5 space-y-4">
            <SystemUserWizardUnifiedFormStep
              basicInfo={basicInfo}
              onChangeBasicInfo={handleChangeBasicInfo}
              basicErrorMessage={basicError}
              validateBasicInfo={validateBasicInfo}
              initialEmployeePayload={employeePayload}
              onCancel={onCancel}
              onNext={(payload) => {
                setEmployeePayload(payload);
                setStep(2);
              }}
              submitLabel="確認の画面へ"
            />
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="settings-panel">
          <div className="settings-row">
            <div>
              <Heading level={3} className="manager-card-title">アカウント登録</Heading>
            </div>
          </div>

          <div className="px-6 pb-5">
            <SystemUserWizardConfirmStep
              basicInfo={basicInfo}
              employeePayload={employeePayload}
              onBack={() => setStep(1)}
              onRegister={handleRegister}
              isRegistering={isRegistering}
              errorMessage={registerError}
            />
          </div>
        </Card>
      ) : null}

      {step === 3 && completionInfo ? (
        <Card className="settings-panel">
          <div className="settings-row">
            <div>
              <Heading level={3} className="manager-card-title">アカウント登録</Heading>
            </div>
          </div>

          <div className="px-6 pb-5">
            <SystemUserWizardCompleteStep
              completionInfo={completionInfo}
              onCopy={handleCopy}
              onBackToList={onCompleted}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default SystemUserRegistrationWizard;
