import { useState } from "react";
import SystemUsersManager from "@/features/systemUsers/components/organisms/SystemUsersManager";
import SystemUserRegistrationWizard from "@/features/systemUsers/components/organisms/SystemUserRegistrationWizard";

const SystemUsersPage = () => {
  const [mode, setMode] = useState("list");

  return (
    <section className="screen settings-screen">
      {mode === "list" ? (
        <SystemUsersManager
          companyId="company-default"
          currentRole="admin"
          canStartRegister
          onStartRegister={() => setMode("wizard")}
        />
      ) : (
        <SystemUserRegistrationWizard
          companyId="company-default"
          onCancel={() => setMode("list")}
          onCompleted={() => setMode("list")}
        />
      )}
    </section>
  );
};

export default SystemUsersPage;
