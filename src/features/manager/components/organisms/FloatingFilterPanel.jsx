import { useRef, useState } from "react";
import Draggable from "react-draggable";
import FilterCheckbox from "@/features/manager/components/molecules/FilterCheckbox";
import FilterTabButton from "@/features/manager/components/molecules/FilterTabButton";

// ドラッグ可能なフィルターパネル
// - react-draggable
// - fixed配置（スクロール追従）
// - handleでドラッグ範囲をヘッダーに限定
// - boundsで画面外に消えないよう制限
const FloatingFilterPanel = ({ isOpen, filters, onToggleGroup, onUpdateDetail, onReset, onClose }) => {
  const nodeRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("main");

  if (!isOpen) return null;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      cancel=".manager-float-toggle,.manager-float-close"
      bounds="body"
      defaultPosition={{ x: 0, y: 0 }}
    >
      <div ref={nodeRef} className="manager-float-panel" role="dialog" aria-label="絞り込みフィルター">
        <div className="manager-float-header drag-handle">
          <div className="manager-float-title">絞り込み</div>
          <div className="manager-float-actions">
            <button
              type="button"
              className="manager-float-toggle"
              onClick={() => setIsMinimized((prev) => !prev)}
              aria-expanded={!isMinimized}
              aria-label={isMinimized ? "フィルターを展開" : "フィルターを最小化"}
            >
              －
            </button>
            <button
              type="button"
              className="manager-float-close"
              onClick={onClose}
              aria-label="閉じる"
              title="閉じる"
            >
              ×
            </button>
          </div>
        </div>

        {!isMinimized ? (
          <div className="manager-float-body">
            <div className="manager-filter-tabs" role="tablist" aria-label="絞り込みモード">
              <FilterTabButton id="main" activeId={activeTab} onSelect={setActiveTab}>
                メイン
              </FilterTabButton>
              <FilterTabButton id="detail" activeId={activeTab} onSelect={setActiveTab}>
                詳細
              </FilterTabButton>
            </div>

            {activeTab === "main" ? (
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
                    label="半年未満（初期離職リスク）"
                    checked={filters.tenureBands.under6}
                    onChange={() => onToggleGroup("tenureBands", "under6")}
                  />
                  <FilterCheckbox
                    label="半年〜3年（中堅・定着）"
                    checked={filters.tenureBands.between6And36}
                    onChange={() => onToggleGroup("tenureBands", "between6And36")}
                  />
                  <FilterCheckbox
                    label="3年以上（ベテラン）"
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
                  <button type="button" className="manager-filter-reset" onClick={onReset}>
                    絞り込み解除
                  </button>
                </div>
              </div>
              </div>
            ) : (
              <div className="manager-filter-grid">
                <label className="manager-filter-field">
                  <span>年齢</span>
                  <div className="manager-filter-inline">
                    <input
                      type="number"
                      placeholder="最小"
                      value={filters.detail.ageMin}
                      onChange={(event) => onUpdateDetail("ageMin", event.target.value)}
                    />
                    <span>〜</span>
                    <input
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
                    <input
                      type="number"
                      placeholder="最小"
                      value={filters.detail.tenureMin}
                      onChange={(event) => onUpdateDetail("tenureMin", event.target.value)}
                    />
                    <span>〜</span>
                    <input
                      type="number"
                      placeholder="最大"
                      value={filters.detail.tenureMax}
                      onChange={(event) => onUpdateDetail("tenureMax", event.target.value)}
                    />
                  </div>
                </label>

                <label className="manager-filter-field">
                  <span>ステータス</span>
                  <select
                    value={filters.detail.status}
                    onChange={(event) => onUpdateDetail("status", event.target.value)}
                  >
                    <option value="">すべて</option>
                    <option value="開発">開発</option>
                    <option value="派遣">派遣</option>
                    <option value="待機">待機</option>
                  </select>
                </label>

                <label className="manager-filter-field">
                  <span>性別</span>
                  <select
                    value={filters.detail.gender}
                    onChange={(event) => onUpdateDetail("gender", event.target.value)}
                  >
                    <option value="">すべて</option>
                    <option value="男性">男性</option>
                    <option value="女性">女性</option>
                  </select>
                </label>

                <label className="manager-filter-field">
                  <span>入社日</span>
                  <div className="manager-filter-inline">
                    <input
                      type="date"
                      value={filters.detail.joinFrom}
                      onChange={(event) => onUpdateDetail("joinFrom", event.target.value)}
                    />
                    <span>〜</span>
                    <input
                      type="date"
                      value={filters.detail.joinTo}
                      onChange={(event) => onUpdateDetail("joinTo", event.target.value)}
                    />
                  </div>
                </label>

                <label className="manager-filter-field">
                  <span>退職日</span>
                  <div className="manager-filter-inline">
                    <input
                      type="date"
                      value={filters.detail.retireFrom}
                      onChange={(event) => onUpdateDetail("retireFrom", event.target.value)}
                    />
                    <span>〜</span>
                    <input
                      type="date"
                      value={filters.detail.retireTo}
                      onChange={(event) => onUpdateDetail("retireTo", event.target.value)}
                    />
                  </div>
                </label>

                <div className="manager-filter-actions">
                  <button type="button" className="manager-filter-reset" onClick={onReset}>
                    絞り込み解除
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Draggable>
  );
};

export default FloatingFilterPanel;
