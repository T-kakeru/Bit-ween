import styles from "./Button.module.css";

const variantClassMap = {
  primary: styles.primary,
  danger: styles.danger,
  outline: styles.outline,
  ghost: styles.ghost,
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
  children,
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
  >
    {children}
  </button>
);

export default Button;
