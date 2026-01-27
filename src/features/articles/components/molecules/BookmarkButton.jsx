const BookmarkButton = ({ saved, onToggle, isAnimating }) => {
  const className = saved
    ? isAnimating
      ? "bookmark-button is-saved is-animating"
      : "bookmark-button is-saved"
    : "bookmark-button";

  return (
    <button
      type="button"
      className={className}
      aria-label={saved ? "保存済みを解除" : "記事を保存"}
      title={saved ? "保存済み" : "保存"}
      onClick={onToggle}
    >
      <svg className="bookmark-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="M7 3.5h10c.83 0 1.5.67 1.5 1.5v17.5l-6.5-3.7-6.5 3.7V5c0-.83.67-1.5 1.5-1.5z"
          className="bookmark-shape"
        />
      </svg>
    </button>
  );
};

export default BookmarkButton;
