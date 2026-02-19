import { useMemo, useState } from "react";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import { useSystemUsersCrud } from "@/features/systemUsers/hooks/useSystemUsersCrud";
import { buildEmployeeCredentials } from "@/features/addRetirement/logic/buildEmployeeCredentials";

import SystemUserWizardBasicStep from "@/features/systemUsers/components/views/SystemUserWizardBasicStep";
import SystemUserWizardAnalysisStep from "@/features/systemUsers/components/views/SystemUserWizardAnalysisStep";
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
  const [analysisPayload, setAnalysisPayload] = useState(null);
  const [completionInfo, setCompletionInfo] = useState(null);
  const [basicError, setBasicError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const stepLabel = useMemo(() => {
    if (step === 1) return "基本情報";
    if (step === 3) return "確認";
    return "完了";
  }, [step]);

  const handleChangeBasicInfo = (patch) => {
    setBasicInfo((prev) => ({ ...prev, ...patch }));
    if (basicError) setBasicError("");
  };

  const validateBasicInfo = () => {
    const email = String(basicInfo.email ?? "").trim();
    const role = String(basicInfo.role ?? "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      setBasicError("メールアドレスの形式を確認してください。");
      return false;
    }

    if (role !== "admin" && role !== "general") {
      setBasicError("権限は Admin または General を選択してください。");
      return false;
    }

    setBasicError("");
    return true;
  };

  const handleRegister = async () => {
    if (!analysisPayload) {
      setRegisterError("分析データが未設定です。");
      return;
    }

    setIsRegistering(true);
    setRegisterError("");

    const result = createUser({
      email: String(basicInfo.email ?? "").trim(),
      role: String(basicInfo.role ?? "general").trim().toLowerCase(),
      employeeCode: String(analysisPayload["社員ID"] ?? "").trim(),
      employeeName: String(analysisPayload["名前"] ?? "").trim(),
      displayName: String(analysisPayload["名前"] ?? "").trim(),
      analysisProfile: analysisPayload,
    });

    if (!result.ok) {
      setIsRegistering(false);
      setRegisterError(result.message || "登録に失敗しました。");
      return;
    }

    const credentials = buildEmployeeCredentials(analysisPayload);
    const inviteLink = buildInviteLink(result.user?.id);
    const copyText = [
      `${analysisPayload["名前"] || "ご担当者"} 様`,
      "",
      "システム利用者登録が完了しました。",
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
    setStep(4);
  };

  const handleCopy = async () => {
    const text = String(completionInfo?.copyText ?? "");
    if (!text) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        window.alert("招待情報をコピーしました。");
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
      window.alert("招待情報をコピーしました。");
    } catch {
      window.alert("コピーに失敗しました。手動でコピーしてください。");
    }
  };

  return (
    <div className="system-user-wizard-stack">
      {step === 1 ? (
        <>
          <Card className="settings-panel">
            <div className="settings-row">
              <div>
                <Heading level={2} className="manager-card-title">利用者の登録１</Heading>
                <TextCaption>利用者一覧と分離した登録フローです。</TextCaption>
                <TextCaption className="mt-1">現在のステップ: Step {step} / {stepLabel}</TextCaption>
              </div>
            </div>

            <div className="px-6 pb-5">
              <SystemUserWizardBasicStep
                basicInfo={basicInfo}
                onChangeBasicInfo={handleChangeBasicInfo}
                errorMessage={basicError}
              />
            </div>
          </Card>

          <SystemUserWizardAnalysisStep
            initialPayload={analysisPayload}
            onBack={onCancel}
            submitLabel="確認の画面へ"
            onNext={(payload) => {
              if (!validateBasicInfo()) return;
              setAnalysisPayload(payload);
              setStep(3);
            }}
          />
        </>
      ) : null}

      {step === 3 ? (
        <Card className="settings-panel">
          <div className="settings-row">
            <div>
              <Heading level={2} className="manager-card-title">利用者の登録１</Heading>
              <TextCaption>利用者一覧と分離した登録フローです。</TextCaption>
              <TextCaption className="mt-1">現在のステップ: Step {step} / {stepLabel}</TextCaption>
            </div>
          </div>

          <div className="px-6 pb-5">
            <SystemUserWizardConfirmStep
              basicInfo={basicInfo}
              analysisPayload={analysisPayload}
              onBack={() => setStep(1)}
              onRegister={handleRegister}
              isRegistering={isRegistering}
              errorMessage={registerError}
            />
          </div>
        </Card>
      ) : null}

      {step === 4 && completionInfo ? (
        <Card className="settings-panel">
          <div className="settings-row">
            <div>
              <Heading level={2} className="manager-card-title">利用者の登録１</Heading>
              <TextCaption>利用者一覧と分離した登録フローです。</TextCaption>
              <TextCaption className="mt-1">現在のステップ: Step {step} / {stepLabel}</TextCaption>
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
