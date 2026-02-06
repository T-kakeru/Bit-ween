import { useMemo, useRef, useState } from "react";
import Button from "@/shared/ui/Button";
import FilterTabButton from "@/features/retirement/components/molecules/FilterTabButton";
import { GENDERS, STATUSES } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const AxisToggle = ({ value, onChange }) => (
  <div className="manager-filter-tabs manager-filter-tabs--segmented" role="tablist" aria-label="集計軸">
    <FilterTabButton id="month" activeId={value} onSelect={onChange}>
      月
    </FilterTabButton>
    <FilterTabButton id="year" activeId={value} onSelect={onChange}>
      年
    </FilterTabButton>
  </div>
);

const SeriesModeToggle = ({ value, onChange }) => (
  <div className="manager-filter-tabs manager-filter-tabs--segmented" role="tablist" aria-label="タブ">
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="multi-select-trigger manager-filter-tab"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
        <span className="multi-select-caret" aria-hidden="true">
          ▾
        </span>
      </Button>
      <div className={isOpen ? "multi-select-menu is-open" : "multi-select-menu"} role="listbox">
        <div className="multi-select-actions">
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...STATUSES])}>
            全選択
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([])}>
            クリア
          </Button>
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

const GenderMultiSelect = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // ラベル表示用
  const label = useMemo(() => {
    if (selected.length === 0) return "未選択";
    if (selected.length === GENDERS.length) return "男女";
    return selected[0] ?? "未選択";
  }, [selected]);

  // 性別の選択・解除切り替え
  const toggleGender = (gender) => {
    if (selected.includes(gender)) {
      onChange(selected.filter((item) => item !== gender));
    } else {
      onChange([...selected, gender]);
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="multi-select-trigger manager-filter-tab"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
        <span className="multi-select-caret" aria-hidden="true">
          ▾
        </span>
      </Button>

      <div className={isOpen ? "multi-select-menu is-open" : "multi-select-menu"} role="listbox">
        <div className="multi-select-actions">
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...GENDERS])}>
            全選択
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([])}>
            クリア
          </Button>
        </div>
        {GENDERS.map((gender) => (
          <label key={gender} className="multi-select-option">
            <input
              type="checkbox"
              checked={selected.includes(gender)}
              onChange={() => toggleGender(gender)}
            />
            <span>{gender}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const RetirementAnalyticsFilters = ({
  axis,
  statuses,
  genders,
  seriesMode,
  onAxisChange,
  onStatusesChange,
  onGendersChange,
  onSeriesModeChange,
}) => {
  return (
    <div className="analytics-filters">
      <div className="analytics-filter">
        <span className="analytics-filter-label">集計軸</span>
        <AxisToggle value={axis} onChange={onAxisChange} />
      </div>

      <div className="analytics-filter analytics-filter--tabs">
        <span className="analytics-filter-label">タブ</span>
        <SeriesModeToggle value={seriesMode} onChange={onSeriesModeChange} />
      </div>

      <div className="analytics-filter">
        <span className="analytics-filter-label">稼働状態</span>
        <StatusMultiSelect selected={statuses} onChange={onStatusesChange} />
      </div>

      <div className="analytics-filter">
        <span className="analytics-filter-label">性別</span>
        <GenderMultiSelect selected={genders} onChange={onGendersChange} />
      </div>
    </div>
  );
};

export default RetirementAnalyticsFilters;
