import styles from "./Label.module.css";

const Label = ({ className = "", ...props }) => (
  <label className={[styles.root, className].filter(Boolean).join(" ")} {...props} />
);

export default Label;
