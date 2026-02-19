const ManagerSubCard = ({ className = "", children }) => {
  return <div className={["manager-subcard", className].filter(Boolean).join(" ")}>{children}</div>;
};

export default ManagerSubCard;
