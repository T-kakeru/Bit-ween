import MetricCard from "@/features/manager/components/molecules/MetricCard";
import EmployeeTable from "@/features/manager/components/organisms/EmployeeTable";
import FloatingFilterPanel from "@/features/manager/components/organisms/FloatingFilterPanel";
import useManagerEmployees from "@/features/manager/hooks/useManagerEmployees";
import useManagerFilters from "@/features/manager/hooks/useManagerFilters";
import useManagerSort from "@/features/manager/hooks/useManagerSort";
import { useState } from "react";

const ManagerDashboard = () => {
  const { columns, rows, metrics, normalizeCell } = useManagerEmployees();
  const { filters, filteredRows, toggleGroup, updateDetail, resetFilters } = useManagerFilters(rows);
  const { sort, sortedRows, toggleSort } = useManagerSort(filteredRows, columns);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <section className="screen manager-screen">
      <FloatingFilterPanel
        isOpen={isFilterOpen}
        filters={filters}
        onToggleGroup={toggleGroup}
        onUpdateDetail={updateDetail}
        onReset={resetFilters}
        onClose={() => setIsFilterOpen(false)}
      />
      <div className="manager-header">
        <div>
          <h1 className="title manager-title">管理画面</h1>
          <p className="muted">現職・退職者をまとめて一覧表示（モック: .json）</p>
        </div>
      </div>

      <div className="manager-metrics">
        <MetricCard label="総人数" value={metrics.total} />
        <MetricCard label="現職" value={metrics.active} />
        <MetricCard label="退職" value={metrics.resigned} />
      </div>

      <div className="manager-table-toolbar">
        <button
          type="button"
          className={isFilterOpen ? "manager-filter-button is-open" : "manager-filter-button"}
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          <span className="manager-filter-icon">⛅</span>
          絞り込み
        </button>
      </div>

      <EmployeeTable
        columns={columns}
        rows={sortedRows}
        normalizeCell={normalizeCell}
        sort={sort}
        onSort={toggleSort}
      />

      <p className="muted manager-footnote">
        ここは土台（表示）に集中：次ステップで絞り込み・並び替え・ページングを追加します。
      </p>
    </section>
  );
};

export default ManagerDashboard;
