import { useEffect, useState } from "react";
import SystemUsersManager from "@/features/systemUsers/components/organisms/SystemUsersManager";
import SystemUserRegistrationWizard from "@/features/systemUsers/components/organisms/SystemUserRegistrationWizard";
import useAuthorization from "@/features/auth/hooks/useAuthorization";

const SystemUsersPage = () => {
  const [mode, setMode] = useState("list");
  const { permissions } = useAuthorization();
  const canWrite = Boolean(permissions?.systemUsersWrite);
  const readOnly = !canWrite;

  useEffect(() => {
    if (readOnly && mode === "wizard") {
      setMode("list");
    }
  }, [mode, readOnly]);

  return (
    <section className="screen settings-screen">
      {mode === "list" ? (
        <SystemUsersManager
          companyId="company-default"
          canWrite={canWrite}
          canStartRegister={canWrite}
          onStartRegister={() => {
            if (!canWrite) return;
            setMode("wizard");
          }}
        />
      ) : (
        canWrite ? (
          <SystemUserRegistrationWizard
            companyId="company-default"
            onCancel={() => setMode("list")}
            onCompleted={() => setMode("list")}
          />
        ) : null
      )}
    </section>
  );
};

export default SystemUsersPage;
