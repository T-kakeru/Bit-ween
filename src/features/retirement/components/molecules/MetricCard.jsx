const MetricCard = ({ label, value }) => {
  return (
    <div className="manager-card">
      <div className="manager-card-label">{label}</div>
      <div className="manager-card-value">{value}</div>
    </div>
  );
};

export default MetricCard;
