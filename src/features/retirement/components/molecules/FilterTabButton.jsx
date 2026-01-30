import Button from "@/shared/ui/Button";

const FilterTabButton = ({ id, activeId, onSelect, children }) => {
  const isActive = id === activeId;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      role="tab"
      aria-selected={isActive}
      className={isActive ? "manager-filter-tab is-active" : "manager-filter-tab"}
      onClick={() => onSelect(id)}
    >
      {children}
    </Button>
  );
};

export default FilterTabButton;
