import FilterCheckbox from "@/features/retirement/components/molecules/FilterCheckbox";
import Button from "@/shared/ui/Button";

// 絞り込みメインタブ
// - UIだけを担う（状態は親から受け取る）
const ManagerMainFilters = ({ filters, onToggleGroup, onReset }) => {
  return (
    <div className="manager-filter-grid">
      <div className="manager-filter-section">
        <div className="manager-filter-section-title">年齢</div>
        <div className="manager-filter-options">
          <FilterCheckbox
            label="20代未満"
            checked={filters.ageBands.under20}
            onChange={() => onToggleGroup("ageBands", "under20")}
          />
          <FilterCheckbox
            label="20代"
            checked={filters.ageBands.twenties}
            onChange={() => onToggleGroup("ageBands", "twenties")}
          />
          <FilterCheckbox
            label="30代"
            checked={filters.ageBands.thirties}
            onChange={() => onToggleGroup("ageBands", "thirties")}
          />
          <FilterCheckbox
            label="40代"
            checked={filters.ageBands.forties}
            onChange={() => onToggleGroup("ageBands", "forties")}
          />
          <FilterCheckbox
            label="50代以上"
            checked={filters.ageBands.over50}
            onChange={() => onToggleGroup("ageBands", "over50")}
          />
        </div>
      </div>

      <div className="manager-filter-section">
        <div className="manager-filter-section-title">在籍期間</div>
        <div className="manager-filter-options">
          <FilterCheckbox
            label="半年未満（短期離職リスク）"
            checked={filters.tenureBands.under6}
            onChange={() => onToggleGroup("tenureBands", "under6")}
          />
          <FilterCheckbox
            label="半年〜3年（中期定着）"
            checked={filters.tenureBands.between6And36}
            onChange={() => onToggleGroup("tenureBands", "between6And36")}
          />
          <FilterCheckbox
            label="3年以上（長期在籍）"
            checked={filters.tenureBands.over36}
            onChange={() => onToggleGroup("tenureBands", "over36")}
          />
        </div>
      </div>

      <div className="manager-filter-section">
        <div className="manager-filter-section-title">性別</div>
        <div className="manager-filter-options">
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
        </div>
      </div>

      <div className="manager-filter-section">
        <div className="manager-filter-section-title">ステータス</div>
        <div className="manager-filter-options">
          <FilterCheckbox
            label="待機"
            checked={filters.statuses.waiting}
            onChange={() => onToggleGroup("statuses", "waiting")}
          />
          <FilterCheckbox
            label="開発"
            checked={filters.statuses.dev}
            onChange={() => onToggleGroup("statuses", "dev")}
          />
          <FilterCheckbox
            label="派遣"
            checked={filters.statuses.dispatch}
            onChange={() => onToggleGroup("statuses", "dispatch")}
          />
        </div>
        <div className="manager-filter-actions">
          <Button type="button" variant="outline" size="sm" className="manager-filter-reset" onClick={onReset}>
            絞り込み解除
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManagerMainFilters;
