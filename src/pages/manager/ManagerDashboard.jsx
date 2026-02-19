import { ClipboardCopy, ClipboardPlus } from "lucide-react";
import KPICard from "@/features/retirement/components/molecules/KPICard";
import DataVolumeIndicator from "@/features/retirement/components/molecules/DataVolumeIndicator";
import FloatingFilterPanel from "@/features/retirement/components/organisms/FloatingFilterPanel";
import useManagerFilters from "@/features/retirement/hooks/useManagerFilters";
import useManagerRowEditor from "@/features/retirement/hooks/useManagerRowEditor";
import useManagerSearch from "@/features/retirement/hooks/useManagerSearch";
import useManagerSort from "@/features/retirement/hooks/useManagerSort";
import { useEffect, useMemo, useState } from "react";
import Heading from "@/shared/ui/Heading";
import Button from "@/shared/ui/Button";
import EditableEmployeeTable from "@/features/retirement/components/organisms/EditableEmployeeTable";
import CsvDownloadButton from "@/features/csvDownload/CsvDownloadButton";
import Card from "@/shared/ui/Card";

const getIsRetired = (row) => (row?.is_active === false ? true : false);

const collectCheckedLabels = (group = {}, mapping = {}) =>
  Object.entries(mapping)
    .filter(([key]) => Boolean(group?.[key]))
    .map(([, label]) => label);

const collectSelectedObjectKeys = (group = {}) =>
  Object.entries(group)
    .filter(([, checked]) => Boolean(checked))
    .map(([label]) => label);

const buildFilterSummaryChips = (filters, query) => {
  const chips = [];
  const safeFilters = filters ?? {};

  if (query) {
    chips.push(`検索: ${query}`);
  }

  chips.push(
    ...collectCheckedLabels(safeFilters.employmentStatus, {
      retired: "在籍状態: 退職済の社員",
      active: "在籍状態: 在籍中の社員",
    })
  );

  chips.push(
    ...collectCheckedLabels(safeFilters.ageBands, {
      under20: "年齢: 20代未満",
      between20And25: "年齢: 20〜25",
      between25And30: "年齢: 25〜30",
      between30And35: "年齢: 30〜35",
      between35And40: "年齢: 35〜40",
      over40: "年齢: 40以上",
    })
  );

  chips.push(
    ...collectCheckedLabels(safeFilters.tenureBands, {
      under3: "在籍期間: 3ヶ月未満",
      between3And6: "在籍期間: 3〜6ヶ月",
      between6And12: "在籍期間: 6ヶ月〜1年",
      between12And18: "在籍期間: 1年〜1年半",
      between18And24: "在籍期間: 1年半〜2年",
      between24And30: "在籍期間: 2年〜2年半",
      between30And36: "在籍期間: 2年半〜3年",
      between36And42: "在籍期間: 3年〜3年半",
      over42: "在籍期間: 3年半以上",
    })
  );

  chips.push(
    ...collectCheckedLabels(safeFilters.genders, {
      male: "性別: 男性",
      female: "性別: 女性",
    })
  );

  chips.push(
    ...collectCheckedLabels(safeFilters.statuses, {
      waiting: "稼働状態: 待機",
      working: "稼働状態: 稼働中",
      leave: "稼働状態: 休職中",
    })
  );

  chips.push(...collectSelectedObjectKeys(safeFilters.departments).map((value) => `部署: ${value}`));
  chips.push(...collectSelectedObjectKeys(safeFilters.reasons).map((value) => `退職理由: ${value}`));
  chips.push(...collectSelectedObjectKeys(safeFilters.clients).map((value) => `稼働先: ${value}`));

  // 各種詳細条件のうち、値が存在するものを「項目: 値」の形式で表示
  const detail = safeFilters.detail ?? {};
  if (detail.ageMin || detail.ageMax) chips.push(`年齢詳細: ${detail.ageMin || "-"}〜${detail.ageMax || "-"}`);
  if (detail.tenureMin || detail.tenureMax) {
    chips.push(`在籍月数詳細: ${detail.tenureMin || "-"}〜${detail.tenureMax || "-"}`);
  }
  if (detail.gender) chips.push(`性別詳細: ${detail.gender}`);
  if (detail.joinFrom || detail.joinTo) chips.push(`入社日: ${detail.joinFrom || "-"}〜${detail.joinTo || "-"}`);
  if (detail.retireFrom || detail.retireTo) chips.push(`退職日: ${detail.retireFrom || "-"}〜${detail.retireTo || "-"}`);

  return chips;
};

const ManagerDashboard = ({ columns, rows, setRows, metrics, normalizeCell, onAddOpen }) => {
  const { query, setQuery, searchedRows } = useManagerSearch(rows);
  const { filters, filteredRows, toggleGroup, updateDetail, resetFilters, departmentOptions, reasonOptions, clientOptions } =
    useManagerFilters(searchedRows);
  const { sort, sortedRows, toggleSort } = useManagerSort(filteredRows, columns);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { saveRows } = useManagerRowEditor({ columns, normalizeCell, setRows });
  const [quickStatusFilter, setQuickStatusFilter] = useState("all");

  const quickFilteredRows = useMemo(() => {
    if (quickStatusFilter === "active") {
      return sortedRows.filter((row) => !getIsRetired(row));
    }
    if (quickStatusFilter === "resigned") {
      return sortedRows.filter((row) => getIsRetired(row));
    }
    return sortedRows;
  }, [quickStatusFilter, sortedRows]);

  const [visibleRowsForCsv, setVisibleRowsForCsv] = useState(quickFilteredRows);

  useEffect(() => {
    setVisibleRowsForCsv(quickFilteredRows);
  }, [quickFilteredRows]);

  const visibleActiveCount = useMemo(
    () => (visibleRowsForCsv ?? []).filter((row) => !getIsRetired(row)).length,
    [visibleRowsForCsv]
  );
  const visibleResignedCount = useMemo(
    () => (visibleRowsForCsv ?? []).filter((row) => getIsRetired(row)).length,
    [visibleRowsForCsv]
  );

  const handleSegmentClick = (segment) => {
    setQuickStatusFilter((prev) => (prev === segment ? "all" : segment));
  };

  const selectedFilterChips = useMemo(() => buildFilterSummaryChips(filters, query), [filters, query]);

  return (
    <section className="screen manager-screen">
      <FloatingFilterPanel
        isOpen={isFilterOpen}
        filters={filters}
        searchQuery={query}
        onSearchChange={setQuery}
        onToggleGroup={toggleGroup}
        onUpdateDetail={updateDetail}
        onReset={resetFilters}
        departmentOptions={departmentOptions}
        reasonOptions={reasonOptions}
        clientOptions={clientOptions}
        onClose={() => setIsFilterOpen(false)}
      />

      <Card className="manager-summary-card">
        <div className="manager-card-title-wrap mb-0">
          <Heading level={2} className="manager-card-title">データ構造比</Heading>
        </div>

        <div className="manager-summary-chart-row">
          <KPICard
            label="全社員"
            value={metrics.total}
            activeCount={metrics.active}
            resignedCount={metrics.resigned}
            type="total"
            size={168}
            onSegmentClick={handleSegmentClick}
            selectedSegment={quickStatusFilter}
          />
          <DataVolumeIndicator
            current={visibleRowsForCsv?.length ?? quickFilteredRows.length}
            total={rows.length}
            activeCount={visibleActiveCount}
            resignedCount={visibleResignedCount}
            size={168}
            onSegmentClick={handleSegmentClick}
            selectedSegment={quickStatusFilter}
          />
        </div>
      </Card>

      <Card className="manager-shell-card">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
          <div className="manager-card-title-wrap mb-0">
            <Heading level={2} className="manager-card-title">対象社員リスト（分析・管理）</Heading>
          </div>
        </div>

        <EditableEmployeeTable
          columns={columns}
          rows={quickFilteredRows}
          normalizeCell={normalizeCell}
          sort={sort}
          onSort={toggleSort}
          isFilterOpen={isFilterOpen}
          onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
          onSaveRows={saveRows}
          filterSummaryChips={selectedFilterChips}
          trailingContent={
            <div className="ml-auto flex items-center gap-2">
              <CsvDownloadButton
                rows={visibleRowsForCsv ?? quickFilteredRows}
                columns={columns?.map((c) => c.key)}
                label="ダウンロード"
                ariaLabel="対象社員リストをダウンロード"
                iconNode={<ClipboardCopy className="manager-edit-icon" size={16} aria-hidden="true" />}
              />
              <Button type="button" variant="outline" className="manager-action-button" onClick={onAddOpen}>
                <ClipboardPlus className="manager-edit-icon" size={16} aria-hidden="true" />
                分析データの追加
              </Button>
            </div>
          }
          onVisibleRowsChange={(visible) => setVisibleRowsForCsv(visible)}
        />

      </Card>
    </section>
  );
};

export default ManagerDashboard;
