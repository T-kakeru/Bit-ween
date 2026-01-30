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
}) => {
  const {
    isEditing,
    draftRows,
    originalRowMap,
    isConfirmOpen,
    pendingChanges,
    startEditing,
    cancelEditing,
    changeCell,
    requestSave,
    closeConfirm,
    confirmSave,
  } = useEditableEmployeeTableSession({ rows, columns, normalizeCell, onSaveRows });

  const visibleRows = isEditing ? draftRows : rows;

  return (
    <EditableEmployeeTableView
      columns={columns}
      sort={sort}
      onSort={onSort}
      isFilterOpen={isFilterOpen}
      onToggleFilter={onToggleFilter}
      leadingContent={leadingContent}
      isEditing={isEditing}
      visibleRows={visibleRows}
      originalRowMap={originalRowMap}
      normalizeCell={normalizeCell}
      onCellChange={changeCell}
      onEditStart={startEditing}
      onSaveRequest={requestSave}
      onCancel={cancelEditing}
      isConfirmOpen={isConfirmOpen}
      pendingChanges={pendingChanges}
      onCloseConfirm={closeConfirm}
      onConfirmSave={confirmSave}
    />
  );
};

export default EditableEmployeeTable;
