const SummaryDonutCenter = ({
  label = "表示人数",
  count = 0,
  unit = "人",
  className = "",
}) => {
  const centerClassName = className
    ? `analytics-donut-center ${className}`
    : "analytics-donut-center";

  return (
    <div className={centerClassName} aria-hidden="true">
      <p className="analytics-donut-label">{label}</p>
      <div className="analytics-donut-value-row">
        <span className="analytics-donut-value">{count}</span>
        <span className="analytics-donut-unit">{unit}</span>
      </div>
    </div>
  );
};

export default SummaryDonutCenter;
