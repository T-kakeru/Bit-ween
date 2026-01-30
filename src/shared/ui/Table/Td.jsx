import styles from "./Table.module.css";

const Td = ({ className = "", children, ...props }) => (
  <td className={[styles.td, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </td>
);

export default Td;
