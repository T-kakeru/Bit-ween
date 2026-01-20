// タブ切り替え：アクティブタブを変更
const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="tabs">
      {/* タブボタンを描画 */}
      {tabs.map((tab) => (
        <button
          key={tab}
          className={tab === activeTab ? "tab active" : "tab"}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
