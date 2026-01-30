import styles from "./Table.module.css";

const Table = ({ className = "", children, ...props }) => (
  <table className={[styles.table, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </table>
);

export default Table;
