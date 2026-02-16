import { useMemo, useRef, useState } from "react";
import Button from "@/shared/ui/Button";
import FilterTabButton from "@/features/retirement/components/molecules/FilterTabButton";
import { GENDERS, STATUSES, getRecentPeriodKeys } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const ActiveTabToggle = ({ value, onChange }) => (
  <div className="manager-filter-tabs manager-filter-tabs--segmented" role="tablist" aria-label="タブ">
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
  <div className="manager-filter-tabs manager-filter-tabs--segmented" role="tablist" aria-label="集計項目">
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

const ClientMultiSelect = ({ selected, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const safeOptions = Array.isArray(options) ? options : [];

  const label = useMemo(() => {
    if (selected.length === 0) return "未選択";
    if (selected.length === safeOptions.length) return "全て";
    return `${selected.length}件選択`;
  }, [safeOptions.length, selected]);

  const toggleClient = (client) => {
    if (selected.includes(client)) {
      onChange(selected.filter((item) => item !== client));
    } else {
      onChange([...selected, client]);
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
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...safeOptions])}>
            全選択
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([])}>
            クリア
          </Button>
        </div>
        {safeOptions.map((client) => (
          <label key={client} className="multi-select-option">
            <input type="checkbox" checked={selected.includes(client)} onChange={() => toggleClient(client)} />
            <span>{client}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const RetirementAnalyticsFilters = ({
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
  const recentYears = useMemo(() => getRecentPeriodKeys("year"), []);

  return (
    <div className="analytics-filters">
      <div className="analytics-filter">
        <span className="analytics-filter-label">タブ</span>
        <ActiveTabToggle value={activeTab} onChange={onActiveTabChange} />
      </div>

      <div className="analytics-filter analytics-filter--tabs">
        <span className="analytics-filter-label">集計項目</span>
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

      <div className="analytics-filter">
        <span className="analytics-filter-label">稼働先（クライアント名）</span>
        <ClientMultiSelect selected={clients} options={clientOptions} onChange={onClientsChange} />
      </div>

      {activeTab === "month" ? (
        <div className="analytics-filter analytics-filter--tabs">
          <span className="analytics-filter-label">年</span>
          <div
            className="manager-filter-tabs manager-filter-tabs--segmented"
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
                onClick={() => onYearSelect?.(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RetirementAnalyticsFilters;
