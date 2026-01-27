import { useEffect, useRef, useState } from "react";

// タブ切り替え用のドロップダウン
const Tabs = ({ tabs, activeTab, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hideTimer = useRef(null);

  const openMenu = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setIsOpen(true);
  };

  const scheduleClose = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setIsOpen(false);
      hideTimer.current = null;
    }, 1000);
  };

  const closeNow = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setIsOpen(false);
  };

  useEffect(() => () => hideTimer.current && clearTimeout(hideTimer.current), []);

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
              onChange?.(tab);
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
