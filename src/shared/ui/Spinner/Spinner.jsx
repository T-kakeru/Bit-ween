import styles from "./Spinner.module.css";

const Spinner = ({ className = "", label = "読み込み中" }) => (
  <span className={[styles.root, className].filter(Boolean).join(" ")} role="status" aria-label={label} />
);

export default Spinner;
