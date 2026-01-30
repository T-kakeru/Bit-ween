import styles from "./Input.module.css";

const Input = ({ className = "", error = false, ...props }) => (
  <input
    className={[styles.root, error ? styles.error : "", className]
      .filter(Boolean)
      .join(" ")}
    aria-invalid={error || props["aria-invalid"] ? true : undefined}
    {...props}
  />
);

export default Input;
