import { useEffect } from "react";
import useEditableEmployeeTableSession from "@/features/retirement/hooks/useEditableEmployeeTableSession";
import EditableEmployeeTableView from "@/features/retirement/components/views/EditableEmployeeTableView";

// 編集可能な社員テーブルの Organism
// - state は hook 側で管理
// - 表示は view 側へ委譲
const EditableEmployeeTable = ({
  columns,
  rows,
  normalizeCell,
  sort,
  onSort,
  isFilterOpen,
  onToggleFilter,
  onSaveRows,
  leadingContent,
  filterSummaryChips,
  trailingContent,
  onVisibleRowsChange,
}) => {
  const {
    isEditing,
    draftRows,
    originalRowMap,
    isConfirmOpen,
    pendingChanges,
    hasErrors,
    selectedRowIds,
    saveError,
    startEditing,
    cancelEditing,
    changeCell,
    requestSave,
    toggleRowSelection,
    closeConfirm,
    confirmSave,
    getCellError,
    clientOptions,
    departmentOptions,
    statusOptions,
    reasonOptions,
    addClientOption,
  } = useEditableEmployeeTableSession({ rows, columns, normalizeCell, onSaveRows });

  const visibleRows = isEditing ? draftRows : rows;

  // notify parent about currently visible rows (filters/sort/editing applied)
  useEffect(() => {
    if (typeof onVisibleRowsChange === "function") onVisibleRowsChange(visibleRows);
  }, [onVisibleRowsChange, visibleRows]);

  return (
    <EditableEmployeeTableView
      columns={columns}
      sort={sort}
      onSort={onSort}
      isFilterOpen={isFilterOpen}
      onToggleFilter={onToggleFilter}
      leadingContent={leadingContent}
      filterSummaryChips={filterSummaryChips}
      trailingContent={trailingContent}
      isEditing={isEditing}
      visibleRows={visibleRows}
      originalRowMap={originalRowMap}
      normalizeCell={normalizeCell}
      onCellChange={changeCell}
      getCellError={getCellError}
      clientOptions={clientOptions}
      departmentOptions={departmentOptions}
      statusOptions={statusOptions}
      reasonOptions={reasonOptions}
      onAddClientOption={addClientOption}
      onEditStart={startEditing}
      onSaveRequest={requestSave}
      isSaveDisabled={hasErrors}
      onCancel={cancelEditing}
      selectedRowIds={selectedRowIds}
      onToggleRowSelection={toggleRowSelection}
      isConfirmOpen={isConfirmOpen}
      pendingChanges={pendingChanges}
      onCloseConfirm={closeConfirm}
      onConfirmSave={() => void confirmSave()}
      saveError={saveError}
    />
  );
};

export default EditableEmployeeTable;
