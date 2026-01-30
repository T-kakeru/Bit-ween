import styles from "./TextCaption.module.css";

const TextCaption = ({ as: Component = "p", className = "", ...props }) => (
  <Component className={[styles.root, className].filter(Boolean).join(" ")} {...props} />
);

export default TextCaption;
