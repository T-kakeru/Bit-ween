const FilterCheckbox = ({ label, checked, onChange, description }) => {
  return (
    <label className="manager-filter-option">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="manager-filter-option-text">
        <span className="manager-filter-option-label">{label}</span>
        {description ? <span className="manager-filter-option-desc">{description}</span> : null}
      </span>
    </label>
  );
};

export default FilterCheckbox;
