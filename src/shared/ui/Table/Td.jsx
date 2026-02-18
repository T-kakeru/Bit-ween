import styles from "./Table.module.css";

const NO_DATA_HYPHENS = new Set(["-", "－", "—", "–"]);

const isNoDataHyphen = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  return NO_DATA_HYPHENS.has(value.trim());
};

const Td = ({ className = "", children, ...props }) => {
  const noDataClass = isNoDataHyphen(children) ? styles.tdNoData : "";

  return (
    <td className={[styles.td, noDataClass, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </td>
  );
};

export default Td;
