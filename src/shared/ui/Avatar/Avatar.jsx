import { useMemo, useState } from "react";
import styles from "./Avatar.module.css";

const buildInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const sizeClassMap = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

const Avatar = ({ name = "", src = "", size = "md", className = "", ...props }) => {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => buildInitials(name), [name]);
  const showImage = Boolean(src) && !hasError;

  return (
    <span
      className={[styles.root, sizeClassMap[size], className].filter(Boolean).join(" ")}
      aria-label={name || undefined}
      {...props}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
      )}
    </span>
  );
};

export default Avatar;
