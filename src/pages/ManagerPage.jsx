import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerAddPage from "@/pages/ManagerAddPage.tsx";
import useManagerEmployees from "@/features/manager/hooks/useManagerEmployees";
import useManagerPageController from "@/pages/manager/useManagerPageController";

// pages: 画面全体の責務（配線/遷移）だけを持ち、表示は features 側へ寄せる
const ManagerPage = () => {
  const { columns, rows, setRows, metrics, normalizeCell } = useManagerEmployees();
  const { isAddOpen, openAdd, closeAdd, handleSave } = useManagerPageController({
    columns,
    rows,
    setRows,
    normalizeCell,
  });

  if (isAddOpen) {
    return (
      <ManagerAddPage
        columns={columns}
        onCancel={closeAdd}
        onSave={handleSave}
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

