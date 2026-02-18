import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import CsvDownloadButton from "@/features/csvDownload/CsvDownloadButton";
import EmployeeTable from "@/features/retirement/components/organisms/EmployeeTable";
import useManagerSort from "@/features/retirement/hooks/useManagerSort";
import { normalizeEmployeeCell } from "@/features/retirement/logic/managerEmployees.logic";
import { MANAGER_EMPLOYEE_COLUMNS } from "@/features/retirement/logic/managerEmployeeTableColumns";
import { buildDetailTableRowsLikeManagerList } from "@/features/retirementAnalytics/logic/retirementAnalyticsDetailTable.logic";

const EmployeeTableCardView = ({ rows, subtitle }) => {
  const listRows = buildDetailTableRowsLikeManagerList(rows);
  const { sort, sortedRows, toggleSort } = useManagerSort(listRows, MANAGER_EMPLOYEE_COLUMNS);

  return (
    <Card className="analytics-layout-card analytics-table-card">
      <div className="analytics-detail-header">
        <div>
          <Heading level={3}>該当者一覧</Heading>
          <TextCaption className="analytics-detail-subtitle">{subtitle}</TextCaption>
        </div>
        <CsvDownloadButton rows={sortedRows} columns={MANAGER_EMPLOYEE_COLUMNS.map((column) => column.key)} />
      </div>

      <div className="analytics-detail-table" role="region" aria-label="該当者一覧">
        <EmployeeTable
          columns={MANAGER_EMPLOYEE_COLUMNS}
          rows={sortedRows}
          normalizeCell={normalizeEmployeeCell}
          sort={sort}
          onSort={toggleSort}
        />
      </div>
    </Card>
  );
};

export default EmployeeTableCardView;
