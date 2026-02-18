const SummaryDonutMiniCenter = ({ label, count, unit = "人" }) => {
  return (
    <div className="analytics-donut-mini-center" aria-hidden="true">
      <p className="analytics-donut-mini-label">{label}</p>
      <div className="analytics-donut-mini-value-row">
        <span className="analytics-donut-mini-value">{count}</span>
        <span className="analytics-donut-mini-unit">{unit}</span>
      </div>
    </div>
  );
};

export default SummaryDonutMiniCenter;
