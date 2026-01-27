const Spinner = ({ className = "", label = "読み込み中" }) => (
  <span className={className} role="status" aria-label={label} />
);

export default Spinner;
