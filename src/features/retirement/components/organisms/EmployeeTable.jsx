import Button from "@/shared/ui/Button";
import { TableContainer, Table, Th, Td } from "@/shared/ui/Table";

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
    <TableContainer className="manager-table-wrap" role="region" aria-label="社員一覧">
      <Table className="manager-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <Th key={c.key} scope="col" aria-sort={getAriaSort(c.key)} className={getHeaderClass(c.key)}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={sort?.key === c.key && sort?.direction ? "manager-sort-button is-sorted" : "manager-sort-button"}
                  onClick={() => onSort(c.key)}
                >
                  <span className="manager-sort-label">{c.label}</span>
                  {getSortIcon(c.key) ? (
                    <span className="manager-sort-icon" aria-hidden="true">
                      {getSortIcon(c.key)}
                    </span>
                  ) : null}
                </Button>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row.id)}>
              {columns.map((c) => (
                <Td key={`${row.id}-${c.key}`}>
                  {c.key === "備考" ? (
                    (() => {
                      const v = normalizeCell(row?.[c.key]);
                      const title = v && v !== "-" ? v : undefined;
                      return (
                        <span className="manager-edit-text manager-edit-text--ellipsis" title={title}>
                          {v}
                        </span>
                      );
                    })()
                  ) : (
                    normalizeCell(row?.[c.key])
                  )}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default EmployeeTable;
