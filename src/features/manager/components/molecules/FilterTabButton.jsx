const FilterTabButton = ({ id, activeId, onSelect, children }) => {
  const isActive = id === activeId;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={isActive ? "manager-filter-tab is-active" : "manager-filter-tab"}
      onClick={() => onSelect(id)}
    >
      {children}
    </button>
  );
};

export default FilterTabButton;
