const EmployeeTable = ({ columns, rows, normalizeCell, sort, onSort }) => {
  const getSortIcon = (key) => {
    if (!sort || sort.key !== key) return null;
    if (sort.direction === "asc") return "▲";
    if (sort.direction === "desc") return "▼";
    return null;
  };

  const getAriaSort = (key) => {
    if (!sort || sort.key !== key || !sort.direction) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  };

  const getHeaderClass = (key) => {
    if (!sort || sort.key !== key || !sort.direction) return "manager-th";
    return sort.direction === "asc" ? "manager-th is-sorted-asc" : "manager-th is-sorted-desc";
  };

  return (
    <div className="manager-table-wrap" role="region" aria-label="社員一覧">
      <table className="manager-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" aria-sort={getAriaSort(c.key)} className={getHeaderClass(c.key)}>
                <button
                  type="button"
                  className={sort?.key === c.key && sort?.direction ? "manager-sort-button is-sorted" : "manager-sort-button"}
                  onClick={() => onSort(c.key)}
                >
                  <span className="manager-sort-label">{c.label}</span>
                  {getSortIcon(c.key) ? (
                    <span className="manager-sort-icon" aria-hidden="true">
                      {getSortIcon(c.key)}
                    </span>
                  ) : null}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.id)}>
              {columns.map((c) => (
                <td key={`${row.id}-${c.key}`}>{normalizeCell(row[c.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
