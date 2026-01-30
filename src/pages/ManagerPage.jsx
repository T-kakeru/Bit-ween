import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerAddPage from "@/pages/ManagerAddPage";
import useManagerEmployees from "@/features/retirement/hooks/useManagerEmployees";
import useManagerPageController from "@/pages/manager/useManagerPageController";

// pages: 画面全体の責務（配線/遷移）だけを持ち、表示は features 側へ寄せる
import { useEffect } from "react";

const ManagerPage = () => {
  const { columns, rows, setRows, metrics, normalizeCell } = useManagerEmployees();
  const { isAddOpen, openAdd, closeAdd, handleSave } = useManagerPageController({
    columns,
    rows,
    setRows,
    normalizeCell,
  });

  // Listen to global navigation events so the sidebar/menu can force-reset this page state.
  useEffect(() => {
    const handler = (e) => {
      try {
        const nav = e?.detail;
        // If the menu was used to select 管理画面 while we're already here,
        // close the add screen to restore the main dashboard view.
        if (nav === "管理画面") {
          closeAdd();
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("app:navigate", handler);
    return () => window.removeEventListener("app:navigate", handler);
  }, [closeAdd]);

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

