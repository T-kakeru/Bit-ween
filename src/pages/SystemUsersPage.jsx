import Heading from "@/shared/ui/Heading";
import SystemUsersManager from "@/features/systemUsers/components/organisms/SystemUsersManager";

const SystemUsersPage = ({ onRequestEmployeeRegister }) => {
  return (
    <section className="screen settings-screen">
      <div className="settings-section-head">
        <Heading level={2}>システム利用者管理</Heading>
      </div>
      <SystemUsersManager
        companyId="company-default"
        currentRole="admin"
        canStartRegister
        onRequestEmployeeRegister={onRequestEmployeeRegister}
      />
    </section>
  );
};

export default SystemUsersPage;
