import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Draggable from "react-draggable";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import Button from "@/shared/ui/Button";
import FilterTabButton from "@/features/retirement/components/molecules/FilterTabButton";
import { GENDERS, STATUSES } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";
import AnalyticsMultiSelect from "@/features/retirementAnalytics/components/molecules/AnalyticsMultiSelect";
import useRetirementAnalyticsFiltersView from "@/features/retirementAnalytics/hooks/useRetirementAnalyticsFiltersView";

const ActiveTabToggle = ({ value, onChange }) => (
  <div
    className="manager-filter-tabs manager-filter-tabs--segmented analytics-filter-stack analytics-filter-stack--period"
    role="tablist"
    aria-label="集計期間"
  >
    <FilterTabButton id="current" activeId={value} onSelect={onChange}>
      現在
    </FilterTabButton>
    <FilterTabButton id="month" activeId={value} onSelect={onChange}>
      月
    </FilterTabButton>
    <FilterTabButton id="year" activeId={value} onSelect={onChange}>
      年
    </FilterTabButton>
  </div>
);

const SeriesModeToggle = ({ value, onChange }) => (
  <div
    className="manager-filter-tabs manager-filter-tabs--segmented analytics-filter-stack analytics-filter-stack--axis"
    role="tablist"
    aria-label="分析軸"
  >
    <FilterTabButton id="reason" activeId={value} onSelect={onChange}>
      退職理由
    </FilterTabButton>
    <FilterTabButton id="department" activeId={value} onSelect={onChange}>
      部署
    </FilterTabButton>
    <FilterTabButton id="age" activeId={value} onSelect={onChange}>
      年齢
    </FilterTabButton>
    <FilterTabButton id="tenure" activeId={value} onSelect={onChange}>
      在籍月数
    </FilterTabButton>
  </div>
);

const buildStatusLabel = (selected) => {
    if (selected.length === 0) return "稼働状態：未選択";
    if (selected.length === STATUSES.length) return "稼働状態：全て";
    return `稼働状態：${selected.length}件選択`;
};

const buildGenderLabel = (selected) => {
    if (selected.length === 0) return "性別：未選択";
    if (selected.length === GENDERS.length) return "性別：男女";
    return `性別：${selected[0] ?? "未選択"}`;
};

const buildClientLabel = (selected, options) => {
    if (selected.length === 0) return "稼働先：未選択";
    if (selected.length === options.length) return "稼働先：全て";
    return `稼働先：${selected.length}件選択`;
};

const PERIOD_LABELS = {
  current: "現在",
  month: "月",
  year: "年",
};

const AXIS_LABELS = {
  reason: "退職理由",
  department: "部署",
  age: "年齢",
  tenure: "在籍月数",
};

const RetirementAnalyticsFiltersView = ({
  activeTab,
  selectedYear,
  statuses,
  clients,
  clientOptions,
  genders,
  seriesMode,
  onActiveTabChange,
  onYearSelect,
  onStatusesChange,
  onClientsChange,
  onGendersChange,
  onSeriesModeChange,
}) => {
  const {
    recentYears,
    isFilterOpen,
    setIsFilterOpen,
  } = useRetirementAnalyticsFiltersView();

  const statusOptions = STATUSES;
  const genderOptions = GENDERS;
  const safeClientOptions = useMemo(() => (Array.isArray(clientOptions) ? clientOptions : []), [clientOptions]);

  const selectedSummaryChips = useMemo(() => {
    const chips = [];
    const periodLabel = PERIOD_LABELS[activeTab] ?? "現在";
    const axisLabel = AXIS_LABELS[seriesMode] ?? "退職理由";

    chips.push(`集計期間：${periodLabel}`);
    chips.push(`分析軸：${axisLabel}`);
    if (activeTab === "month" && selectedYear) chips.push(`年軸：${selectedYear}`);

    const safeStatuses = Array.isArray(statuses) ? statuses : [];
    const safeGenders = Array.isArray(genders) ? genders : [];
    const safeClients = Array.isArray(clients) ? clients : [];

    if (safeStatuses.length !== STATUSES.length) {
      chips.push(safeStatuses.length === 0 ? "稼働状態：未選択" : `稼働状態：${safeStatuses.length}件選択`);
    }
    if (safeGenders.length !== GENDERS.length) {
      chips.push(safeGenders.length === 0 ? "性別：未選択" : `性別：${safeGenders.join("/")}`);
    }
    if (safeClientOptions.length > 0 && safeClients.length !== safeClientOptions.length) {
      chips.push(safeClients.length === 0 ? "稼働先：未選択" : `稼働先：${safeClients.length}件選択`);
    }

    return chips;
  }, [activeTab, seriesMode, selectedYear, statuses, genders, clients, safeClientOptions]);

  const nodeRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const floatingPanel = isFilterOpen ? (
    <Draggable
      nodeRef={nodeRef}
      handle=".analytics-float-header"
      cancel=".analytics-float-toggle,.analytics-float-close"
      bounds="body"
      defaultPosition={{ x: 0, y: 0 }}
    >
      <div ref={nodeRef} className="analytics-float-panel" role="dialog" aria-label="分析条件・絞り込み">
        <div className="analytics-float-header">
          <div className="analytics-float-title">分析条件・絞り込み</div>
          <div className="analytics-float-actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="analytics-float-toggle"
              aria-expanded={!isMinimized}
              aria-label={isMinimized ? "条件パネルを展開" : "条件パネルを最小化"}
              onClick={() => setIsMinimized((prev) => !prev)}
            >
              {isMinimized ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronUp size={16} aria-hidden="true" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="analytics-float-close"
              aria-label="条件パネルを閉じる"
              onClick={() => setIsFilterOpen(false)}
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {!isMinimized ? (
          <div className="analytics-float-body">
            <div className="analytics-filters">
              <section className="analytics-filter analytics-filter-block analytics-filter--tabs">
                <span className="analytics-filter-label">集計期間</span>
                <ActiveTabToggle value={activeTab} onChange={onActiveTabChange} />
              </section>

              <section className="analytics-filter analytics-filter-block analytics-filter--tabs">
                <span className="analytics-filter-label">分析軸</span>
                <SeriesModeToggle value={seriesMode} onChange={onSeriesModeChange} />
              </section>

              <section className="analytics-filter analytics-filter-block analytics-filter--tabs analytics-filter--conditions">
                <span className="analytics-filter-label">絞り込み条件</span>
                <div className="manager-filter-tabs manager-filter-tabs--segmented analytics-filter-stack analytics-filter-condition-row">
                  <AnalyticsMultiSelect
                    selected={statuses}
                    options={statusOptions}
                    onChange={onStatusesChange}
                    labelBuilder={buildStatusLabel}
                  />
                  <AnalyticsMultiSelect
                    selected={genders}
                    options={genderOptions}
                    onChange={onGendersChange}
                    labelBuilder={buildGenderLabel}
                  />
                  <AnalyticsMultiSelect
                    selected={clients}
                    options={safeClientOptions}
                    onChange={onClientsChange}
                    labelBuilder={buildClientLabel}
                    menuClassName="multi-select-menu multi-select-menu--chunk10"
                  />
                </div>
              </section>

              {activeTab === "month" ? (
                <section className="analytics-filter analytics-filter-block analytics-filter--tabs analytics-filter--year-axis">
                  <span className="analytics-filter-label">年軸</span>
                  <div
                    className="analytics-year-axis-wrap analytics-year-axis-wrap--vertical-first"
                    role="group"
                    aria-label="年選択"
                  >
                    {recentYears.map((year) => (
                      <Button
                        key={year}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`manager-filter-tab ${String(selectedYear) === String(year) ? "is-active" : ""}`}
                        aria-pressed={String(selectedYear) === String(year)}
                        onClick={() => onYearSelect?.(year)}
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </Draggable>
  ) : null;

  return (
    <>
      <div className="analytics-filter-trigger-row">
        <Button
          type="button"
          variant="outline"
          className="analytics-filter-trigger-button"
          aria-expanded={isFilterOpen}
          onClick={() => {
            setIsFilterOpen((prev) => !prev);
            setIsMinimized(false);
          }}
        >
          分析条件・絞り込み
        </Button>

        <div className="analytics-filter-selected-summary" aria-label="現在の分析条件">
          {selectedSummaryChips.map((chip) => (
            <span key={chip} className="analytics-filter-selected-chip">
              {chip}
            </span>
          ))}
        </div>
      </div>

      {floatingPanel ? (typeof document !== "undefined" ? createPortal(floatingPanel, document.body) : floatingPanel) : null}
    </>
  );
};

export default RetirementAnalyticsFiltersView;
