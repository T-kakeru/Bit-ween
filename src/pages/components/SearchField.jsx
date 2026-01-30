// pages 配下に配置する検索フィールド（UI部品）
// ※要望により pages 配下へ移動（本来は feature/components 配下が一般的）
import Input from "@/shared/ui/Input";
const SearchField = ({ id, label, placeholder, value, onChange }) => {
  return (
    <div className="manager-search-panel" role="search" aria-label={label || placeholder}>
      <span className="manager-search-icon" aria-hidden="true">
        🔎
      </span>
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
