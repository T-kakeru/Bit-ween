import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerAddPage from "@/pages/manager/ManagerAddPage";
import useManagerEmployees from "@/features/retirement/hooks/useManagerEmployees";
import useManagerPageController from "@/pages/manager/useManagerPageController";
import { useSystemUsersCrud } from "@/features/systemUsers/hooks/useSystemUsersCrud";
import { buildEmployeeCredentials } from "@/features/addRetirement/logic/buildEmployeeCredentials";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

// pages: 画面全体の責務（配線/遷移）だけを持ち、表示は features 側へ寄せる
import { useEffect, useState } from "react";

const ManagerPage = () => {
  const { columns, rows, setRows, metrics, normalizeCell } = useManagerEmployees();
  const { isAddOpen, openAdd, closeAdd, handleSave } = useManagerPageController({
    columns,
    rows,
    setRows,
    normalizeCell,
  });
  const { createUser } = useSystemUsersCrud({ companyId: "company-default" });
  const [pendingUserEmail, setPendingUserEmail] = useState("");
  const [pendingUserRole, setPendingUserRole] = useState("general");
  const [isIntegratedFlow, setIsIntegratedFlow] = useState(false);

  // 画面遷移時に追加モーダルを閉じる
  useEffect(() => {
    const handler = (e) => {
      try {
        const nav = e?.detail;
        if (nav === "社員情報管理") {
          closeAdd();
          setPendingUserEmail("");
          setPendingUserRole("general");
          setIsIntegratedFlow(false);
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("app:navigate", handler);
    return () => window.removeEventListener("app:navigate", handler);
  }, [closeAdd]);

  useEffect(() => {
    const handler = (event) => {
      const email = String(event?.detail?.email ?? "").trim();
      const role = String(event?.detail?.role ?? "general").trim().toLowerCase();
      if (!email) return;
      setPendingUserEmail(email);
      setPendingUserRole(role === "admin" ? "admin" : "general");
      setIsIntegratedFlow(true);
      openAdd();
    };

    window.addEventListener("systemUsers:startIntegratedRegister", handler);
    return () => window.removeEventListener("systemUsers:startIntegratedRegister", handler);
  }, [openAdd]);

  if (isAddOpen) {
    return (
      <ManagerAddPage
        columns={columns}
        rows={rows}
        enableCsvImport={!isIntegratedFlow}
        onCancel={() => {
          closeAdd();
          setPendingUserEmail("");
          setPendingUserRole("general");
          setIsIntegratedFlow(false);
        }}
        onSave={async (input) => {
          handleSave(input);

          if (!isIntegratedFlow) return;

          const employeeCode = String(input?.["社員ID"] ?? "").trim();
          const employeeName = String(input?.["名前"] ?? "").trim();
          const email = String(pendingUserEmail ?? "").trim();
          if (!email || !employeeCode || !employeeName) return;
          const credentials = buildEmployeeCredentials(input);

          const result = await createUser({
            email,
            role: pendingUserRole,
            employeeCode,
            password: credentials.initialPassword,
            employeeName,
            displayName: employeeName,
            analysisProfile: {
              ...input,
              is_active: true,
              "退職日": "",
              "退職理由": "",
              "備考": "",
            },
          });

          if (!result.ok) {
            window.alert(result.message || ERROR_MESSAGES.SYSTEM_USERS.ACCOUNT_REGISTER_FAILED);
          }

          setPendingUserEmail("");
          setPendingUserRole("general");
          setIsIntegratedFlow(false);
        }}
      />
    );
  }

  return (
    <ManagerDashboard
      columns={columns}
      rows={rows}
      setRows={setRows}
      metrics={metrics}
      normalizeCell={normalizeCell}
      onAddOpen={openAdd}
    />
  );
};

export default ManagerPage;

