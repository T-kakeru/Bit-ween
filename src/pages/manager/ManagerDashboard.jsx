import { ChevronDown, ClipboardCopy, ClipboardPlus } from "lucide-react";
import DataVolumeIndicator from "@/features/retirement/components/molecules/DataVolumeIndicator";
import ManagerCategoryPie from "@/features/retirement/components/molecules/ManagerCategoryPie";
import FloatingFilterPanel from "@/features/retirement/components/organisms/FloatingFilterPanel";
import useManagerFilters from "@/features/retirement/hooks/useManagerFilters";
import useManagerRowEditor from "@/features/retirement/hooks/useManagerRowEditor";
import useManagerSearch from "@/features/retirement/hooks/useManagerSearch";
import useManagerSort from "@/features/retirement/hooks/useManagerSort";
import { buildManagerSummaryPieData } from "@/features/retirement/logic/managerSummaryCharts.logic";
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

const buildChartSelectionChip = (segment) => {
  if (segment !== "active" && segment !== "resigned") return null;
  const scopeLabel = "該当社員";
  const segmentLabel = segment === "active" ? "現職" : "退職";
  return `円グラフ: ${scopeLabel} / ${segmentLabel}`;
};

const ManagerDashboard = ({ columns, rows, setRows, metrics, normalizeCell, onAddOpen }) => {
  const { query, setQuery, searchedRows } = useManagerSearch(rows);
  const { filters, filteredRows, toggleGroup, updateDetail, resetFilters, departmentOptions, reasonOptions, clientOptions } =
    useManagerFilters(searchedRows);
  const { sort, sortedRows, toggleSort } = useManagerSort(filteredRows, columns);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { saveRows } = useManagerRowEditor({ columns, normalizeCell, setRows });
  const [quickStatusFilter, setQuickStatusFilter] = useState("all");

  const handleDisplaySegmentClick = (segment) => {
    setQuickStatusFilter((prev) => {
      if (prev === segment) return "all";
      return segment;
    });
  };

  const baseRowsForQuickFilter = useMemo(() => sortedRows, [sortedRows]);

  const quickFilteredRows = useMemo(() => {
    if (quickStatusFilter === "active") {
      return baseRowsForQuickFilter.filter((row) => !getIsRetired(row));
    }
    if (quickStatusFilter === "resigned") {
      return baseRowsForQuickFilter.filter((row) => getIsRetired(row));
    }
    return baseRowsForQuickFilter;
  }, [baseRowsForQuickFilter, quickStatusFilter]);

  const [visibleRowsForCsv, setVisibleRowsForCsv] = useState(quickFilteredRows);

  useEffect(() => {
    setVisibleRowsForCsv(quickFilteredRows);
  }, [quickFilteredRows]);

  const displayedActiveCount = useMemo(
    () => (sortedRows ?? []).filter((row) => !getIsRetired(row)).length,
    [sortedRows]
  );
  const displayedResignedCount = useMemo(
    () => (sortedRows ?? []).filter((row) => getIsRetired(row)).length,
    [sortedRows]
  );

  // 円グラフの集計対象は、検索・フィルタリング・ソートが適用された後のデータ（＝画面に表示されているデータ）とする
  const selectedFilterChips = useMemo(() => {
    const chips = buildFilterSummaryChips(filters, query);
    const chartChip = buildChartSelectionChip(quickStatusFilter);
    if (!chartChip) return chips;
    return [chartChip, ...chips];
  }, [filters, query, quickStatusFilter]);

  const summaryPieOptions = useMemo(() => ({ aggregateOthers: true }), []);

  const reasonPieData = useMemo(
    () => buildManagerSummaryPieData(quickFilteredRows, "reason", summaryPieOptions),
    [quickFilteredRows, summaryPieOptions],
  );

  const departmentPieData = useMemo(
    () => buildManagerSummaryPieData(quickFilteredRows, "department", summaryPieOptions),
    [quickFilteredRows, summaryPieOptions],
  );

  const agePieData = useMemo(
    () => buildManagerSummaryPieData(quickFilteredRows, "age", summaryPieOptions),
    [quickFilteredRows, summaryPieOptions],
  );

  const tenurePieData = useMemo(
    () => buildManagerSummaryPieData(quickFilteredRows, "tenure", summaryPieOptions),
    [quickFilteredRows, summaryPieOptions],
  );

  const statusPieData = useMemo(
    () => buildManagerSummaryPieData(quickFilteredRows, "status", summaryPieOptions),
    [quickFilteredRows, summaryPieOptions],
  );

  const genderPieData = useMemo(
    () => buildManagerSummaryPieData(quickFilteredRows, "gender", summaryPieOptions),
    [quickFilteredRows, summaryPieOptions],
  );

  const clientPieData = useMemo(
    () => buildManagerSummaryPieData(quickFilteredRows, "client", summaryPieOptions),
    [quickFilteredRows, summaryPieOptions],
  );

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

      <Card className="manager-shell-card">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
          <div className="manager-card-title-wrap mb-0">
            <Heading level={3}>対象社員リスト（分析・管理）</Heading>
          </div>
        </div>

        <div className="manager-summary-subcard">
          <button
            type="button"
            className="manager-summary-accordion-trigger"
            onClick={() => setIsSummaryOpen((prev) => !prev)}
            aria-expanded={isSummaryOpen}
          >
            <span>データ構造比</span>
            <ChevronDown
              size={18}
              className={`manager-summary-accordion-chevron ${isSummaryOpen ? "is-open" : ""}`}
              aria-hidden="true"
            />
          </button>

          {isSummaryOpen ? (
            <div className="manager-summary-chart-row manager-summary-chart-row--subcard">
              <div className="manager-summary-chart-block">
                <p className="manager-summary-chart-title">該当社員</p>
                <DataVolumeIndicator
                  current={sortedRows?.length ?? 0}
                  total={rows.length}
                  activeCount={displayedActiveCount}
                  resignedCount={displayedResignedCount}
                  size={156}
                  onSegmentClick={handleDisplaySegmentClick}
                />
              </div>

              <div className="manager-summary-chart-block">
                <p className="manager-summary-chart-title">退職理由</p>
                <ManagerCategoryPie
                  chartLabel="該当社員リストの退職理由構成比"
                  data={reasonPieData}
                  size={156}
                />
              </div>

              <div className="manager-summary-chart-block">
                <p className="manager-summary-chart-title">部署</p>
                <ManagerCategoryPie
                  chartLabel="該当社員リストの部署構成比"
                  data={departmentPieData}
                  size={156}
                />
              </div>

              <div className="manager-summary-chart-block">
                <p className="manager-summary-chart-title">年齢</p>
                <ManagerCategoryPie
                  chartLabel="該当社員リストの年齢構成比"
                  data={agePieData}
                  size={156}
                />
              </div>

              <div className="manager-summary-chart-block">
                <p className="manager-summary-chart-title">在籍月数</p>
                <ManagerCategoryPie
                  chartLabel="該当社員リストの在籍月数構成比"
                  data={tenurePieData}
                  size={156}
                />
              </div>

              <div className="manager-summary-chart-block">
                <p className="manager-summary-chart-title">稼働状態</p>
                <ManagerCategoryPie
                  chartLabel="該当社員リストの稼働状態構成比"
                  data={statusPieData}
                  size={156}
                />
              </div>

              <div className="manager-summary-chart-block">
                <p className="manager-summary-chart-title">性別</p>
                <ManagerCategoryPie
                  chartLabel="該当社員リストの性別構成比"
                  data={genderPieData}
                  size={156}
                />
              </div>

              <div className="manager-summary-chart-block">
                <p className="manager-summary-chart-title">稼働先</p>
                <ManagerCategoryPie
                  chartLabel="該当社員リストの稼働先構成比"
                  data={clientPieData}
                  size={156}
                />
              </div>
            </div>
          ) : null}
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
