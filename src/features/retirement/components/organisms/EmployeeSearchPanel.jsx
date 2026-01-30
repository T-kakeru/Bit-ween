import SearchField from "@/pages/components/SearchField";

// 社員検索パネル（オーガニズム）
// - 名前 or IDで検索
// - 管理画面のツールバー左側に配置
const EmployeeSearchPanel = ({ query, onChange }) => {
  return (
    <SearchField
      id="manager-employee-search"
      label="社員検索"
      placeholder="名前 or ID で検索"
      value={query}
      onChange={onChange}
    />
  );
};

export default EmployeeSearchPanel;
