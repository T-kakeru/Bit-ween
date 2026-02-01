import styles from "./Icon.module.css";

const BASE_URL = import.meta.env.BASE_URL ?? "/";

const withBaseUrl = (path) => {
  if (typeof path !== "string") return path;
  const trimmed = path.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (!trimmed.startsWith("/")) return trimmed;
  if (BASE_URL === "/") return trimmed;
  return `${BASE_URL}${trimmed.slice(1)}`;
};

const DEFAULT_ICON_SRC = withBaseUrl("/img/default.png");

const isImageLike = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(trimmed);
  }

  return false;
};

/**
 * @param {{ name?: string, src?: string, alt?: string, className?: string, [key: string]: any }} props
 */
const Icon = ({ name = "", src, alt = "", className = "", ...props }) => {
  const resolvedSrc = withBaseUrl(src ?? (isImageLike(name) ? name : null));

  if (resolvedSrc || !name) {
    return (
      <img
        className={[styles.root, styles.image, className].filter(Boolean).join(" ")}
        src={resolvedSrc ?? DEFAULT_ICON_SRC}
        alt={alt}
        loading="lazy"
        onError={(event) => {
          const img = event.currentTarget;
          if (img.src.endsWith(DEFAULT_ICON_SRC)) return;
          img.src = DEFAULT_ICON_SRC;
        }}
        {...props}
      />
    );
  }

  return (
    <span className={[styles.root, className].filter(Boolean).join(" ")} aria-hidden={alt ? undefined : true} {...props}>
      {name}
    </span>
  );
};

export default Icon;
