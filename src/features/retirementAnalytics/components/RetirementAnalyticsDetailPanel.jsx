import { forwardRef } from "react";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import EmployeeTable from "@/features/retirement/components/organisms/EmployeeTable";
import useManagerSort from "@/features/retirement/hooks/useManagerSort";
import { normalizeEmployeeCell } from "@/features/retirement/logic/managerEmployees.logic";
import { MANAGER_EMPLOYEE_COLUMNS } from "@/features/retirement/logic/managerEmployeeTableColumns";
import { buildDetailTableRowsLikeManagerList } from "@/features/retirementAnalytics/logic/retirementAnalyticsDetailTable.logic";

const RetirementAnalyticsDetailPanel = forwardRef(({ title, subtitle, rows, onClose }, ref) => {
  const listRows = buildDetailTableRowsLikeManagerList(rows);
  const totalCount = listRows.length;
  const { sort, sortedRows, toggleSort } = useManagerSort(listRows, MANAGER_EMPLOYEE_COLUMNS);
  return (
    <Card className="analytics-detail" ref={ref} tabIndex={-1} aria-label="該当者一覧">
      <div className="analytics-detail-header">
        <div>
          <Heading level={3}>{title}</Heading>
          <TextCaption className="analytics-detail-subtitle">{subtitle}</TextCaption>
        </div>
        <Button type="button" variant="outline" onClick={onClose} aria-label="閉じる">
          閉じる
        </Button>
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

      <div className="analytics-detail-meta">
        <span className="tag-pill">対象: {totalCount}件</span>
      </div>
    </Card>
  );
});

export default RetirementAnalyticsDetailPanel;
