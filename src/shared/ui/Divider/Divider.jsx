import styles from "./Divider.module.css";

const Divider = ({ className = "", ...props }) => (
  <hr className={[styles.root, className].filter(Boolean).join(" ")} {...props} />
);

export default Divider;
