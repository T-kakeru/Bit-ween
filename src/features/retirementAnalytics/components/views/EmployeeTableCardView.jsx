import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import CsvDownloadButton from "@/features/csvDownload/CsvDownloadButton";
import EmployeeTable from "@/features/retirement/components/organisms/EmployeeTable";
import useManagerSort from "@/features/retirement/hooks/useManagerSort";
import { normalizeEmployeeCell } from "@/features/retirement/logic/managerEmployees.logic";
import { MANAGER_EMPLOYEE_COLUMNS } from "@/features/retirement/logic/managerEmployeeTableColumns";
import { buildDetailTableRowsLikeManagerList } from "@/features/retirementAnalytics/logic/retirementAnalyticsDetailTable.logic";
import { ClipboardCopy } from "lucide-react";
import AnalyticsSubCard from "@/features/retirementAnalytics/components/molecules/AnalyticsSubCard";

const EmployeeTableCardView = ({ rows, subtitle }) => {
  const listRows = buildDetailTableRowsLikeManagerList(rows);
  const { sort, sortedRows, toggleSort } = useManagerSort(listRows, MANAGER_EMPLOYEE_COLUMNS);

  return (
    <Card className="analytics-layout-card analytics-table-card">
      <div className="analytics-detail-header">
        <div>
          <Heading level={3}>対象社員リスト</Heading>
          <TextCaption className="analytics-detail-subtitle">{subtitle}</TextCaption>
        </div>
        <CsvDownloadButton
          rows={sortedRows}
          columns={MANAGER_EMPLOYEE_COLUMNS.map((column) => column.key)}
          className="analytics-detail-icon-button analytics-detail-icon-button--download"
          iconOnly
          ariaLabel="対象社員リストをダウンロード"
          tooltipLabel="対象社員リストをダウンロード"
          iconNode={<ClipboardCopy className="manager-edit-icon" size={30} aria-hidden="true" />}
        />
      </div>

      <AnalyticsSubCard>
        <div className="analytics-detail-table" role="region" aria-label="対象社員リスト">
          <EmployeeTable
            columns={MANAGER_EMPLOYEE_COLUMNS}
            rows={sortedRows}
            normalizeCell={normalizeEmployeeCell}
            sort={sort}
            onSort={toggleSort}
          />
        </div>
      </AnalyticsSubCard>
    </Card>
  );
};

export default EmployeeTableCardView;
