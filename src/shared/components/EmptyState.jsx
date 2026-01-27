const EmptyState = ({ title = "データがありません", description = "" }) => (
  <div className="empty-state">
    <p className="empty-title">{title}</p>
    {description ? <p className="empty-description">{description}</p> : null}
  </div>
);

export default EmptyState;
