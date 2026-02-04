import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import { TableContainer, Table, Th, Td } from "@/shared/ui/Table";

const getValue = (value) => (value == null || value === "" ? "-" : String(value));

const RetirementAnalyticsDetailPanel = ({ title, subtitle, rows, onClear }) => {
  const totalCount = Array.isArray(rows) ? rows.length : 0;
  return (
    <Card className="analytics-detail">
      <div className="analytics-detail-header">
        <div>
          <Heading level={3}>{title}</Heading>
          <TextCaption className="analytics-detail-subtitle">{subtitle}</TextCaption>
        </div>
        <Button type="button" variant="outline" onClick={onClear}>
          クリア
        </Button>
      </div>

      <TableContainer className="analytics-detail-table" role="region" aria-label="該当者一覧">
        <Table>
          <thead>
            <tr>
              <Th>名前</Th>
              <Th>部署</Th>
              <Th>入社日</Th>
              <Th>退職日</Th>
              <Th>在籍月数</Th>
              <Th>ステータス</Th>
              <Th>退職理由</Th>
              <Th>当時のクライアント</Th>
              <Th>性別</Th>
              <Th>生年月日</Th>
              <Th>年齢</Th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <tr key={String(row.id)}>
                <Td>{getValue(row?.["名前"])}</Td>
                <Td>{getValue(row?.department)}</Td>
                <Td>{getValue(row?.["入社日"])}</Td>
                <Td>{getValue(row?.["退職日"])}</Td>
                <Td>{getValue(row?.["在籍月数"])}</Td>
                <Td>{getValue(row?.status ?? row?.["ステータス"])}</Td>
                <Td>{getValue(row?.reason ?? row?.["退職理由"])}</Td>
                <Td>{getValue(row?.["当時のクライアント"])}</Td>
                <Td>{getValue(row?.["性別"])}</Td>
                <Td>{getValue(row?.["生年月日"])}</Td>
                <Td>{getValue(row?.["年齢"])}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      <div className="analytics-detail-meta">
        <span className="tag-pill">対象: {totalCount}件</span>
      </div>
    </Card>
  );
};

export default RetirementAnalyticsDetailPanel;
