// 記事画面専用: 追加条件（タグ/カテゴリ/部署など）をチップ表示し、解除・クリアできる
const AdditionalConditionsBar = ({
  chips,
  onRemove,
  onClear,
  label = "追加条件",
}) => {
  const items = Array.isArray(chips) ? chips : [];
  if (items.length === 0) return null;

  return (
    <div className="article-refine-bar" aria-label={`${label}条件`}>
      <span className="article-refine-label">
        {label} ({items.length})
      </span>
      <div className="article-refine-chips">
        {items.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={`refine-chip refine-chip--${chip.kind}`}
            onClick={() => onRemove?.(chip)}
            aria-label={`${chip.label} を解除`}
          >
            <span className="refine-chip-text">{chip.label}</span>
            <span className="refine-chip-x" aria-hidden="true">
              ×
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="refine-clear" onClick={() => onClear?.()}>
        クリア
      </button>
    </div>
  );
};

export default AdditionalConditionsBar;
