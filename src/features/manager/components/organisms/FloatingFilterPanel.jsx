import { useRef, useState } from "react";
import Draggable from "react-draggable";
import FilterTabButton from "@/features/manager/components/molecules/FilterTabButton";
import ManagerMainFilters from "@/features/manager/components/molecules/ManagerMainFilters";
import ManagerDetailFilters from "@/features/manager/components/molecules/ManagerDetailFilters";
import Button from "@/shared/ui/Button";

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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="manager-float-toggle"
              onClick={() => setIsMinimized((prev) => !prev)}
              aria-expanded={!isMinimized}
              aria-label={isMinimized ? "フィルターを展開" : "フィルターを最小化"}
            >
              －
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="manager-float-close"
              onClick={onClose}
              aria-label="閉じる"
              title="閉じる"
            >
              ×
            </Button>
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
              <ManagerMainFilters filters={filters} onToggleGroup={onToggleGroup} onReset={onReset} />
            ) : (
              <ManagerDetailFilters filters={filters} onUpdateDetail={onUpdateDetail} onReset={onReset} />
            )}
          </div>
        ) : null}
      </div>
    </Draggable>
  );
};

export default FloatingFilterPanel;
