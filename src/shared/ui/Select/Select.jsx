import styles from "./Select.module.css";

const Select = ({ className = "", error = false, ...props }) => (
  <select
    className={[styles.root, error ? styles.error : "", className]
      .filter(Boolean)
      .join(" ")}
    aria-invalid={error || props["aria-invalid"] ? true : undefined}
    {...props}
  />
);

export default Select;
