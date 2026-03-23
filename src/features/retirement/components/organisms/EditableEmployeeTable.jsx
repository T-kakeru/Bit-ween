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
  onDeleteRows,
  leadingContent,
  filterSummaryChips,
  trailingContent,
  onVisibleRowsChange,
  readOnly = false,
}) => {
  const {
    isEditing,
    draftRows,
    originalRowMap,
    isConfirmOpen,
    confirmMode,
    pendingChanges,
    pendingDeleteRows,
    hasErrors,
    selectedRowIds,
    selectedCount,
    saveError,
    startEditing,
    cancelEditing,
    changeCell,
    requestSave,
    requestDelete,
    toggleRowSelection,
    closeConfirm,
    confirmSave,
    confirmDelete,
    getCellError,
    clientOptions,
    departmentOptions,
    statusOptions,
    reasonOptions,
    addClientOption,
  } = useEditableEmployeeTableSession({ rows, columns, normalizeCell, onSaveRows, onDeleteRows });

  const visibleRows = isEditing ? draftRows : rows;

  const canEdit = !readOnly;

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
      canEdit={canEdit}
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
      onEditStart={canEdit ? startEditing : undefined}
      onSaveRequest={canEdit ? requestSave : undefined}
      onDeleteRequest={canEdit ? requestDelete : undefined}
      isSaveDisabled={hasErrors}
      isDeleteDisabled={selectedCount === 0}
      onCancel={canEdit ? cancelEditing : undefined}
      selectedRowIds={selectedRowIds}
      onToggleRowSelection={canEdit ? toggleRowSelection : undefined}
      isConfirmOpen={isConfirmOpen}
      confirmMode={confirmMode}
      pendingChanges={pendingChanges}
      pendingDeleteRows={pendingDeleteRows}
      onCloseConfirm={closeConfirm}
      onConfirm={canEdit ? (() => void (confirmMode === "delete" ? confirmDelete() : confirmSave())) : undefined}
      saveError={saveError}
    />
  );
};

export default EditableEmployeeTable;
