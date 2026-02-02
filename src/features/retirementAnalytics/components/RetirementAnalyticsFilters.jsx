import { useMemo, useRef, useState } from "react";
import Select from "@/shared/ui/Select";
import { DEPARTMENTS, STATUSES } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const AxisToggle = ({ value, onChange }) => (
  <div className="segmented-control" role="group" aria-label="集計軸">
    <button type="button" aria-pressed={value === "month"} onClick={() => onChange("month")}>
      月
    </button>
    <button type="button" aria-pressed={value === "year"} onClick={() => onChange("year")}>
      年
    </button>
  </div>
);

const SeriesModeToggle = ({ value, onChange }) => (
  <div className="segmented-control" role="group" aria-label="タブ">
    <button type="button" aria-pressed={value === "reason"} onClick={() => onChange("reason")}>
      退職理由
    </button>
    <button type="button" aria-pressed={value === "department"} onClick={() => onChange("department")}>
      部署
    </button>
  </div>
);

const StatusMultiSelect = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const label = useMemo(() => {
    if (selected.length === 0) return "未選択";
    if (selected.length === STATUSES.length) return "全て";
    return `${selected.length}件選択`;
  }, [selected]);

  const toggleStatus = (status) => {
    if (selected.includes(status)) {
      onChange(selected.filter((item) => item !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  return (
    <div
      className="multi-select"
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="multi-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
        <span className="multi-select-caret">▾</span>
      </button>
      <div className={isOpen ? "multi-select-menu is-open" : "multi-select-menu"} role="listbox">
        <div className="multi-select-actions">
          <button type="button" onClick={() => onChange([...STATUSES])}>
            全選択
          </button>
          <button type="button" onClick={() => onChange([])}>
            クリア
          </button>
        </div>
        {STATUSES.map((status) => (
          <label key={status} className="multi-select-option">
            <input
              type="checkbox"
              checked={selected.includes(status)}
              onChange={() => toggleStatus(status)}
            />
            <span>{status}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const RetirementAnalyticsFilters = ({
  axis,
  department,
  statuses,
  seriesMode,
  onAxisChange,
  onDepartmentChange,
  onStatusesChange,
  onSeriesModeChange,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="analytics-filters">
      <div className="analytics-filter">
        <span className="analytics-filter-label">集計軸</span>
        <AxisToggle value={axis} onChange={onAxisChange} />
      </div>

      <div className="analytics-filter">
        <span className="analytics-filter-label">部署</span>
        <Select value={department} onChange={(event) => onDepartmentChange(event.target.value)}>
          <option value="ALL">全て</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </Select>
      </div>

      <div className="analytics-filter">
        <span className="analytics-filter-label">ステータス</span>
        <StatusMultiSelect selected={statuses} onChange={onStatusesChange} />
      </div>

      <div className="analytics-filter analytics-filter--wide">
        <span className="analytics-filter-label">タブ</span>
        <SeriesModeToggle value={seriesMode} onChange={onSeriesModeChange} />
      </div>

      <div className="analytics-meta">
        <span className="tag-pill">対象: {filteredCount}件</span>
        <span className="tag-pill">総件数: {totalCount}件</span>
      </div>
    </div>
  );
};

export default RetirementAnalyticsFilters;
