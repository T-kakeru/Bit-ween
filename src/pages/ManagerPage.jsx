import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerAddPage from "@/pages/manager/ManagerAddPage";
import useManagerEmployees from "@/features/retirement/hooks/useManagerEmployees";
import useManagerPageController from "@/pages/manager/useManagerPageController";
import SystemUsersManager from "@/features/systemUsers/components/organisms/SystemUsersManager";
import { useSystemUsersCrud } from "@/features/systemUsers/hooks/useSystemUsersCrud";

// pages: 画面全体の責務（配線/遷移）だけを持ち、表示は features 側へ寄せる
import { useCallback, useEffect, useState } from "react";

const ManagerPage = () => {
  const { columns, rows, setRows, metrics, normalizeCell } = useManagerEmployees();
  const { isAddOpen, openAdd, closeAdd, handleSave } = useManagerPageController({
    columns,
    rows,
    setRows,
    normalizeCell,
  });
  const { createUser } = useSystemUsersCrud({ companyId: "company-default" });
  const [isUserRegisterOpen, setIsUserRegisterOpen] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState("");
  const [isIntegratedFlow, setIsIntegratedFlow] = useState(false);

  const openUserRegister = useCallback(() => {
    setPendingUserEmail("");
    setIsIntegratedFlow(false);
    setIsUserRegisterOpen(true);
  }, []);
  const closeUserRegister = useCallback(() => setIsUserRegisterOpen(false), []);

  // 画面遷移時に追加モーダルを閉じる
  useEffect(() => {
    const handler = (e) => {
      try {
        const nav = e?.detail;
        if (nav === "社員情報一覧") {
          closeAdd();
          closeUserRegister();
          setPendingUserEmail("");
          setIsIntegratedFlow(false);
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("app:navigate", handler);
    return () => window.removeEventListener("app:navigate", handler);
  }, [closeAdd, closeUserRegister]);

  if (isUserRegisterOpen) {
    return (
      <SystemUsersManager
        companyId="company-default"
        currentRole="admin"
        onDone={closeUserRegister}
        onRequestEmployeeRegister={(email) => {
          setPendingUserEmail(String(email ?? "").trim());
          setIsIntegratedFlow(true);
          closeUserRegister();
          openAdd();
        }}
      />
    );
  }

  if (isAddOpen) {
    return (
      <ManagerAddPage
        columns={columns}
        rows={rows}
        enableCsvImport={!isIntegratedFlow}
        onCancel={() => {
          closeAdd();
          setPendingUserEmail("");
          setIsIntegratedFlow(false);
        }}
        onSave={(input) => {
          handleSave(input);

          if (!isIntegratedFlow) return;

          const employeeCode = String(input?.["社員ID"] ?? "").trim();
          const employeeName = String(input?.["名前"] ?? "").trim();
          const email = String(pendingUserEmail ?? "").trim();
          if (!email || !employeeCode || !employeeName) return;

          const result = createUser({
            email,
            role: "general",
            employeeCode,
            employeeName,
          });

          if (!result.ok) {
            window.alert(result.message || "利用者登録に失敗しました");
          }

          setPendingUserEmail("");
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
      onUserRegisterOpen={openUserRegister}
    />
  );
};

export default ManagerPage;

