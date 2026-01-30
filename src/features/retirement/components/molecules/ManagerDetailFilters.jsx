import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import Button from "@/shared/ui/Button";

// 絞り込み（詳細タブ）
// - UIだけを担当（状態は親から受け取る）
const ManagerDetailFilters = ({ filters, onUpdateDetail, onReset }) => {
  return (
    <div className="manager-filter-grid">
      <label className="manager-filter-field">
        <span>年齢</span>
        <div className="manager-filter-inline">
          <Input
            type="number"
            placeholder="最小"
            value={filters.detail.ageMin}
            onChange={(event) => onUpdateDetail("ageMin", event.target.value)}
          />
          <span>〜</span>
          <Input
            type="number"
            placeholder="最大"
            value={filters.detail.ageMax}
            onChange={(event) => onUpdateDetail("ageMax", event.target.value)}
          />
        </div>
      </label>

      <label className="manager-filter-field">
        <span>在籍月数</span>
        <div className="manager-filter-inline">
          <Input
            type="number"
            placeholder="最小"
            value={filters.detail.tenureMin}
            onChange={(event) => onUpdateDetail("tenureMin", event.target.value)}
          />
          <span>〜</span>
          <Input
            type="number"
            placeholder="最大"
            value={filters.detail.tenureMax}
            onChange={(event) => onUpdateDetail("tenureMax", event.target.value)}
          />
        </div>
      </label>

      <label className="manager-filter-field">
        <span>ステータス</span>
        <Select value={filters.detail.status} onChange={(event) => onUpdateDetail("status", event.target.value)}>
          <option value="">すべて</option>
          <option value="開発">開発</option>
          <option value="派遣">派遣</option>
          <option value="待機">待機</option>
        </Select>
      </label>

      <label className="manager-filter-field">
        <span>性別</span>
        <Select value={filters.detail.gender} onChange={(event) => onUpdateDetail("gender", event.target.value)}>
          <option value="">すべて</option>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
        </Select>
      </label>

      <label className="manager-filter-field">
        <span>入社日</span>
        <div className="manager-filter-inline">
          <Input type="date" value={filters.detail.joinFrom} onChange={(event) => onUpdateDetail("joinFrom", event.target.value)} />
          <span>〜</span>
          <Input type="date" value={filters.detail.joinTo} onChange={(event) => onUpdateDetail("joinTo", event.target.value)} />
        </div>
      </label>

      <label className="manager-filter-field">
        <span>退職日</span>
        <div className="manager-filter-inline">
          <Input type="date" value={filters.detail.retireFrom} onChange={(event) => onUpdateDetail("retireFrom", event.target.value)} />
          <span>〜</span>
          <Input type="date" value={filters.detail.retireTo} onChange={(event) => onUpdateDetail("retireTo", event.target.value)} />
        </div>
      </label>

      <div className="manager-filter-actions">
        <Button type="button" variant="outline" size="sm" className="manager-filter-reset" onClick={onReset}>
          絞り込み解除
        </Button>
      </div>
    </div>
  );
};

export default ManagerDetailFilters;
