import Input from "@/shared/ui/Input";
import Icon from "@/shared/ui/Icon";

const SearchField = ({ id = 'article-search', label, placeholder = '検索', value, onChange, onSubmit }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit && onSubmit();
    }
  };

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
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SearchField;
