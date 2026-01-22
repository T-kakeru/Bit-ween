import { useEffect, useRef, useState } from "react";

// タブ切り替え用のドロップダウン。タブ一覧と現在タブを受け取り、2秒後に自動で閉じる挙動を持たせる。
const Tabs = ({ tabs, activeTab, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hideTimer = useRef(null);

  // メニューを即座に開く（遅延クローズをキャンセル）
  const openMenu = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setIsOpen(true);
  };

  // ホバーが外れたら1秒後に閉じる
  const scheduleClose = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setIsOpen(false);
      hideTimer.current = null;
    }, 1000);
  };

  // フォーカス喪失など即時クローズしたい場合
  const closeNow = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setIsOpen(false);
  };

  // アンマウント時にタイマーを掃除
  useEffect(() => () => hideTimer.current && clearTimeout(hideTimer.current), []);

  // 現在選択中のラベル（未指定時は先頭を表示）
  const activeLabel = activeTab ?? tabs?.[0] ?? "";

  return (
    <div
      className="tabs dropdown-tabs"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
      onBlur={closeNow}
    >
      <button
        type="button"
        className="tab-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="tab-trigger-label">{activeLabel}</span>
        <span className="tab-trigger-caret">▾</span>
      </button>

      <div className={isOpen ? "tab-menu is-open" : "tab-menu"} role="menu">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="menuitemradio"
            aria-checked={tab === activeLabel}
            className={tab === activeLabel ? "tab-option is-active" : "tab-option"}
            onClick={() => {
              // 選択を親に通知して閉じる
              onChange(tab);
              setIsOpen(false);
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
