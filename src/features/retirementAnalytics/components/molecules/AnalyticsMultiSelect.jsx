import { useMemo, useRef, useState } from "react";
import Button from "@/shared/ui/Button";

const AnalyticsMultiSelect = ({
  selected,
  options,
  onChange,
  labelBuilder,
  menuClassName = "multi-select-menu",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];

  const label = useMemo(() => {
    if (typeof labelBuilder === "function") {
      return labelBuilder(safeSelected, safeOptions);
    }
    if (safeSelected.length === 0) return "未選択";
    if (safeSelected.length === safeOptions.length) return "全て";
    return `${safeSelected.length}件選択`;
  }, [labelBuilder, safeOptions, safeSelected]);

  const toggleOption = (option) => {
    if (safeSelected.includes(option)) {
      onChange(safeSelected.filter((item) => item !== option));
      return;
    }
    onChange([...safeSelected, option]);
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
        <span className="multi-select-label" title={label}>{label}</span>
        <span className="multi-select-caret" aria-hidden="true">▾</span>
      </Button>

      <div className={isOpen ? `${menuClassName} is-open` : menuClassName} role="listbox">
        <div className="multi-select-actions">
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...safeOptions])}>
            全選択
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([])}>
            クリア
          </Button>
        </div>

        <div className="multi-select-options-grid">
          {safeOptions.map((option) => (
            <label key={option} className="multi-select-option">
              <input
                type="checkbox"
                checked={safeSelected.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMultiSelect;
