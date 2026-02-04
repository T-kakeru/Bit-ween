import MetricCard from "@/features/retirement/components/molecules/MetricCard";
import EmployeeSearchPanel from "@/features/retirement/components/organisms/EmployeeSearchPanel";
import FloatingFilterPanel from "@/features/retirement/components/organisms/FloatingFilterPanel";
import useManagerFilters from "@/features/retirement/hooks/useManagerFilters";
import useManagerRowEditor from "@/features/retirement/hooks/useManagerRowEditor";
import useManagerSearch from "@/features/retirement/hooks/useManagerSearch";
import useManagerSort from "@/features/retirement/hooks/useManagerSort";
import { useState } from "react";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import EditableEmployeeTable from "@/features/retirement/components/organisms/EditableEmployeeTable";
import CsvDownloadButton from "@/features/csvDownload/CsvDownloadButton";

const ManagerDashboard = ({ columns, rows, setRows, metrics, normalizeCell, onAddOpen }) => {
  const { query, setQuery, searchedRows } = useManagerSearch(rows);
  const { filters, filteredRows, toggleGroup, updateDetail, resetFilters, departmentOptions, reasonOptions } =
    useManagerFilters(searchedRows);
  const { sort, sortedRows, toggleSort } = useManagerSort(filteredRows, columns);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { saveRows } = useManagerRowEditor({ columns, normalizeCell, setRows });
  const [visibleRowsForCsv, setVisibleRowsForCsv] = useState(sortedRows);

  return (
    <section className="screen manager-screen">
      <FloatingFilterPanel
        isOpen={isFilterOpen}
        filters={filters}
        onToggleGroup={toggleGroup}
        onUpdateDetail={updateDetail}
        onReset={resetFilters}
        departmentOptions={departmentOptions}
        reasonOptions={reasonOptions}
        onClose={() => setIsFilterOpen(false)}
      />

      <div className="manager-header">
        <>
          <Heading level={2} className="manager-title" aria-hidden="true" />
        </>

        <div className="flex items-center gap-2">
          <CsvDownloadButton rows={visibleRowsForCsv ?? sortedRows} columns={columns?.map((c) => c.key)} />
          <Button type="button" variant="outline" className="manager-action-button" onClick={onAddOpen}>
            <Icon className="manager-edit-icon" src="/img/icon_file_add.png" alt="" />
            分析データの追加
          </Button>
        </div>
      </div>
      
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
        onVisibleRowsChange={(visible) => setVisibleRowsForCsv(visible)}
      />

      <TextCaption className="manager-footnote">
        ここは土台（表示）に集中：次ステップで絞り込み・並び替え・ページングを追加します。
      </TextCaption>
    </section>
  );
};

export default ManagerDashboard;
