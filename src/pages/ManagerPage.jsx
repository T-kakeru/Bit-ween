import ManagerDashboard from "@/features/manager/components/views/ManagerDashboard";

// pages: 画面全体の責務（配線/遷移）だけを持ち、表示は features 側へ寄せる
const ManagerPage = () => {
  return <ManagerDashboard />;
};

export default ManagerPage;
