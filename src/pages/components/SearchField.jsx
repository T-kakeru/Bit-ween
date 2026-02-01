import Input from "@/shared/ui/Input";
import Icon from "@/shared/ui/Icon";

// ページ/管理画面用検索スタイル（manager-search-panel）
const SearchField = ({ id, label, placeholder, value, onChange }) => {
  return (
    <div className="manager-search-panel" role="search" aria-label={label || placeholder}>
      <Icon className="manager-search-icon" src="/img/icon_search.png" alt="" />
      <Input
        id={id}
        type="search"
        className="manager-search-input"
        aria-label={label || placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

export default SearchField;

