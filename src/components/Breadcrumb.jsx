const Breadcrumb = ({ items = [] }) => {
  const lastIndex = items.length - 1;

  return (
    <nav className="breadcrumb" aria-label="パンくず">
      {items.map((item, index) => {
        const isLast = index === lastIndex;

        if (isLast) {
          return (
            <span key={item.label} className="breadcrumb-current">
              {item.label}
            </span>
          );
        }

        return (
          <span key={item.label} className="breadcrumb-item">
            {item.onClick || item.href ? (
              <button
                type="button"
                className="breadcrumb-link"
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ) : (
              <span className="breadcrumb-link">{item.label}</span>
            )}
            <span className="breadcrumb-sep" aria-hidden="true">›</span>
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
