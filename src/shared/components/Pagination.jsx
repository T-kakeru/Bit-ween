const Pagination = ({ page = 1, totalPages = 1, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-button"
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
      >
        前へ
      </button>
      <span className="pagination-status">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="pagination-button"
        disabled={page >= totalPages}
        onClick={() => onChange?.(page + 1)}
      >
        次へ
      </button>
    </div>
  );
};

export default Pagination;
