import styles from "./Table.module.css";

const Th = ({ className = "", children, ...props }) => (
  <th className={[styles.th, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </th>
);

export default Th;
