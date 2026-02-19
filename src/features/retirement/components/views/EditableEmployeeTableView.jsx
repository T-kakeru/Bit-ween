import EditableCellField from "@/features/retirement/components/molecules/EditableCellField";
import EditModeControls from "@/features/retirement/components/molecules/EditModeControls";
import ConfirmChangesModal from "@/features/retirement/components/molecules/ConfirmChangesModal";
import { isCellChanged } from "@/features/retirement/logic/employeeEdit.logic";
import Button from "@/shared/ui/Button";
import { TableContainer, Table, Th, Td } from "@/shared/ui/Table";

// - toolbar + table + confirm modal
const EditableEmployeeTableView = ({
  // shared
  columns,
  sort,
  onSort,

  // toolbar
  isFilterOpen,
  onToggleFilter,
  leadingContent,
  filterSummaryChips,
  trailingContent,

  // edit
  isEditing,
  visibleRows,
  originalRowMap,
  normalizeCell,
  onCellChange,
  getCellError,
  clientOptions,
  onAddClientOption,
  onEditStart,
  onSaveRequest,
  isSaveDisabled,
  onCancel,

  // confirm
  isConfirmOpen,
  pendingChanges,
  onCloseConfirm,
  onConfirmSave,
}) => {
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
    <div className="manager-table-area">
      <div className="manager-filter-subcard">
        <div className="manager-filter-toolbar">
          {leadingContent}
          <Button
            type="button"
            variant="outline"
            className={isFilterOpen ? "manager-filter-button is-open" : "manager-filter-button"}
            onClick={onToggleFilter}
          >
            絞り込み
          </Button>
        </div>

        {Array.isArray(filterSummaryChips) && filterSummaryChips.length > 0 ? (
          <div className="manager-filter-selected-summary" aria-label="適用中の絞り込み条件">
            {filterSummaryChips.map((chip, index) => (
              <span key={`${chip}-${index}`} className="manager-filter-selected-chip">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="manager-table-action-row">
        {trailingContent}
        <EditModeControls
          isEditing={isEditing}
          onEditStart={onEditStart}
          onSaveRequest={onSaveRequest}
          isSaveDisabled={Boolean(isSaveDisabled)}
          onCancel={onCancel}
        />
      </div>

      <TableContainer className="manager-table-wrap" role="region" aria-label="社員一覧">
        <Table className={isEditing ? "manager-table is-editing" : "manager-table"}>
          <thead>
            <tr>
              {columns.map((c) => (
                <Th
                  key={c.key}
                  scope="col"
                  aria-sort={getAriaSort(c.key)}
                  className={getHeaderClass(c.key)}
                  data-col-key={c.key}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={
                      sort?.key === c.key && sort?.direction
                        ? "manager-sort-button is-sorted"
                        : "manager-sort-button"
                    }
                    onClick={() => onSort(c.key)}
                    disabled={isEditing}
                    aria-disabled={isEditing}
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
            {visibleRows.map((row) => (
              <tr key={String(row.id)}>
                {columns.map((c) => {
                  const originalRow = originalRowMap?.get(String(row.id));
                  const changed = isCellChanged({ draftRow: row, originalRow, column: c, normalizeCell });
                  return (
                    <Td
                      key={`${row.id}-${c.key}`}
                      className={changed ? "is-changed" : ""}
                      data-col-key={c.key}
                    >
                      <EditableCellField
                        isEditing={isEditing}
                        row={row}
                        column={c}
                        normalizeCell={normalizeCell}
                        onChange={onCellChange}
                        clientOptions={clientOptions}
                        onAddClientOption={onAddClientOption}
                        errorMessage={getCellError ? getCellError(row.id, c.key) : undefined}
                      />
                    </Td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      <ConfirmChangesModal
        isOpen={isConfirmOpen}
        changes={pendingChanges}
        onCancel={onCloseConfirm}
        onConfirm={onConfirmSave}
      />
    </div>
  );
};

export default EditableEmployeeTableView;
