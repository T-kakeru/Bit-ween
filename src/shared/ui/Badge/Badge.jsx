import styles from "./Badge.module.css";

const variantClassMap = {
  primary: styles.primary,
  success: styles.success,
  danger: styles.danger,
  neutral: styles.neutral,
};

const Badge = ({ variant = "neutral", className = "", ...props }) => (
  <span
    className={[styles.root, variantClassMap[variant], className]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
);

export default Badge;
