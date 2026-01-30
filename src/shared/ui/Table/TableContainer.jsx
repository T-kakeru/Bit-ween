import styles from "./Table.module.css";

const TableContainer = ({ className = "", children, ...props }) => (
  <div className={[styles.root, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </div>
);

export default TableContainer;
