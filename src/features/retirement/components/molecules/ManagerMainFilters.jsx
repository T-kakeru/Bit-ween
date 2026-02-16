import FilterCheckbox from "@/features/retirement/components/molecules/FilterCheckbox";
import Button from "@/shared/ui/Button";

const FilterAccordionSection = ({ title, children }) => {
  return (
    <details className="manager-filter-section">
      <summary className="manager-filter-section-title">
        <span>{title}</span>
        <span className="manager-filter-section-chevron" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="manager-filter-options">{children}</div>
    </details>
  );
};

// 絞り込みメインタブ
// - UIだけを担う（状態は親から受け取る）
const ManagerMainFilters = ({ filters, onToggleGroup, onReset, departmentOptions, reasonOptions, clientOptions }) => {
  return (
    <div className="manager-filter-grid">
      <FilterAccordionSection title="在籍状態">
        <FilterCheckbox
          label="退職済の社員"
          checked={filters.employmentStatus.retired}
          onChange={() => onToggleGroup("employmentStatus", "retired")}
        />
        <FilterCheckbox
          label="在籍中の社員"
          checked={filters.employmentStatus.active}
          onChange={() => onToggleGroup("employmentStatus", "active")}
        />
      </FilterAccordionSection>

      <FilterAccordionSection title="年齢">
        <FilterCheckbox
          label="20代未満"
          checked={filters.ageBands.under20}
          onChange={() => onToggleGroup("ageBands", "under20")}
        />
        <FilterCheckbox
          label="20〜25"
          checked={filters.ageBands.between20And25}
          onChange={() => onToggleGroup("ageBands", "between20And25")}
        />
        <FilterCheckbox
          label="25〜30"
          checked={filters.ageBands.between25And30}
          onChange={() => onToggleGroup("ageBands", "between25And30")}
        />
        <FilterCheckbox
          label="30〜35"
          checked={filters.ageBands.between30And35}
          onChange={() => onToggleGroup("ageBands", "between30And35")}
        />
        <FilterCheckbox
          label="35〜40"
          checked={filters.ageBands.between35And40}
          onChange={() => onToggleGroup("ageBands", "between35And40")}
        />
        <FilterCheckbox
          label="40以上"
          checked={filters.ageBands.over40}
          onChange={() => onToggleGroup("ageBands", "over40")}
        />
      </FilterAccordionSection>

      <FilterAccordionSection title="在籍期間">
        <FilterCheckbox
          label="3ヶ月未満"
          checked={filters.tenureBands.under3}
          onChange={() => onToggleGroup("tenureBands", "under3")}
        />
        <FilterCheckbox
          label="3ヶ月〜6ヶ月"
          checked={filters.tenureBands.between3And6}
          onChange={() => onToggleGroup("tenureBands", "between3And6")}
        />
        <FilterCheckbox
          label="6ヶ月〜1年"
          checked={filters.tenureBands.between6And12}
          onChange={() => onToggleGroup("tenureBands", "between6And12")}
        />
        <FilterCheckbox
          label="1年〜1年半"
          checked={filters.tenureBands.between12And18}
          onChange={() => onToggleGroup("tenureBands", "between12And18")}
        />
        <FilterCheckbox
          label="1年半〜2年"
          checked={filters.tenureBands.between18And24}
          onChange={() => onToggleGroup("tenureBands", "between18And24")}
        />
        <FilterCheckbox
          label="2年〜2年半"
          checked={filters.tenureBands.between24And30}
          onChange={() => onToggleGroup("tenureBands", "between24And30")}
        />
        <FilterCheckbox
          label="2年半〜3年"
          checked={filters.tenureBands.between30And36}
          onChange={() => onToggleGroup("tenureBands", "between30And36")}
        />
        <FilterCheckbox
          label="3年〜3年半"
          checked={filters.tenureBands.between36And42}
          onChange={() => onToggleGroup("tenureBands", "between36And42")}
        />
        <FilterCheckbox
          label="3年半以上"
          checked={filters.tenureBands.over42}
          onChange={() => onToggleGroup("tenureBands", "over42")}
        />
      </FilterAccordionSection>

      <FilterAccordionSection title="性別">
        <FilterCheckbox
          label="男性"
          checked={filters.genders.male}
          onChange={() => onToggleGroup("genders", "male")}
        />
        <FilterCheckbox
          label="女性"
          checked={filters.genders.female}
          onChange={() => onToggleGroup("genders", "female")}
        />
      </FilterAccordionSection>

      <FilterAccordionSection title="部署">
        {(departmentOptions ?? []).map((dept) => (
          <FilterCheckbox
            key={dept}
            label={dept}
            checked={Boolean(filters.departments?.[dept])}
            onChange={() => onToggleGroup("departments", dept)}
          />
        ))}
      </FilterAccordionSection>

      <FilterAccordionSection title="退職理由">
        {(reasonOptions ?? []).map((reason) => (
          <FilterCheckbox
            key={reason}
            label={reason}
            checked={Boolean(filters.reasons?.[reason])}
            onChange={() => onToggleGroup("reasons", reason)}
          />
        ))}
      </FilterAccordionSection>

      <FilterAccordionSection title="稼働先（クライアント名）">
        {(clientOptions ?? []).map((client) => (
          <FilterCheckbox
            key={client}
            label={client}
            checked={Boolean(filters.clients?.[client])}
            onChange={() => onToggleGroup("clients", client)}
          />
        ))}
      </FilterAccordionSection>

      <FilterAccordionSection title="稼働状態">
        <FilterCheckbox
          label="待機"
          checked={filters.statuses.waiting}
          onChange={() => onToggleGroup("statuses", "waiting")}
        />
        <FilterCheckbox
          label="稼働中"
          checked={filters.statuses.working}
          onChange={() => onToggleGroup("statuses", "working")}
        />
        <FilterCheckbox
          label="休職中"
          checked={filters.statuses.leave}
          onChange={() => onToggleGroup("statuses", "leave")}
        />
      </FilterAccordionSection>

      <div className="manager-filter-actions">
        <Button type="button" variant="outline" size="sm" className="manager-filter-reset" onClick={onReset}>
          絞り込み解除
        </Button>
      </div>
    </div>
  );
};

export default ManagerMainFilters;
