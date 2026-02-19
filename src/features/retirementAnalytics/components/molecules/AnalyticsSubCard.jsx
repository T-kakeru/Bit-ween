const AnalyticsSubCard = ({ className = "", children }) => {
  return <div className={["analytics-subcard", className].filter(Boolean).join(" ")}>{children}</div>;
};

export default AnalyticsSubCard;