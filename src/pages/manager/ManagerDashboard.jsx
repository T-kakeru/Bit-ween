import MetricCard from "@/features/manager/components/molecules/MetricCard";
import EmployeeSearchPanel from "@/features/manager/components/organisms/EmployeeSearchPanel";
import FloatingFilterPanel from "@/features/manager/components/organisms/FloatingFilterPanel";
import useManagerFilters from "@/features/manager/hooks/useManagerFilters";
import useManagerRowEditor from "@/features/manager/hooks/useManagerRowEditor";
import useManagerSearch from "@/features/manager/hooks/useManagerSearch";
import useManagerSort from "@/features/manager/hooks/useManagerSort";
import { useState } from "react";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";

import EditableEmployeeTable from "@/pages/manager/EditableEmployeeTable";

const ManagerDashboard = ({ columns, rows, setRows, metrics, normalizeCell, onAddOpen }) => {
  const { query, setQuery, searchedRows } = useManagerSearch(rows);
  const { filters, filteredRows, toggleGroup, updateDetail, resetFilters } = useManagerFilters(searchedRows);
  const { sort, sortedRows, toggleSort } = useManagerSort(filteredRows, columns);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { saveRows } = useManagerRowEditor({ columns, normalizeCell, setRows });

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
          <Heading level={1} className="manager-title">
            管理画面
          </Heading>
        </div>

        <Button type="button" variant="outline" onClick={onAddOpen}>
          新規登録
        </Button>
      </div>

      <Divider />

      <div className="manager-metrics">
        <MetricCard label="総人数" value={metrics.total} />
        <MetricCard label="現職" value={metrics.active} />
        <MetricCard label="退職" value={metrics.resigned} />
      </div>

      <EditableEmployeeTable
        columns={columns}
        rows={sortedRows}
        normalizeCell={normalizeCell}
        sort={sort}
        onSort={toggleSort}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
        onSaveRows={saveRows}
        leadingContent={<EmployeeSearchPanel query={query} onChange={setQuery} />}
      />

      <TextCaption className="manager-footnote">
        ここは土台（表示）に集中：次ステップで絞り込み・並び替え・ページングを追加します。
      </TextCaption>
    </section>
  );
};

export default ManagerDashboard;
