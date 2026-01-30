import styles from "./Button.module.css";

const variantClassMap = {
  primary: styles.primary,
  danger: styles.danger,
  outline: styles.outline,
};

const sizeClassMap = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

const Button = ({
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => (
  <button
    type={type}
    className={[
      styles.button,
      variantClassMap[variant],
      sizeClassMap[size],
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
);

export default Button;
