import Input from "@/shared/ui/Input";

const FilterCheckbox = ({ label, checked, onChange, description }) => {
  return (
    <label className="manager-filter-option">
      <Input type="checkbox" checked={checked} onChange={onChange} />
      <span className="manager-filter-option-text">
        <span className="manager-filter-option-label">{label}</span>
        {description ? <span className="manager-filter-option-desc">{description}</span> : null}
      </span>
    </label>
  );
};

export default FilterCheckbox;
