import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";

// 編集モード切り替えボタン群（molecule）
const EditModeControls = ({ isEditing, onEditStart, onSaveRequest, onCancel, isSaveDisabled = false }) => {
  // 「編集」→編集開始 / 「編集中」→キャンセル（中断）
  const handleToggleEditing = () => {
    if (isEditing) onCancel();
    else onEditStart();
  };

  return (
    <div className="manager-edit-actions" aria-label="編集アクション">
      <Button
        type="button"
        variant="outline"
        className={(isEditing ? "manager-edit-button is-editing" : "manager-edit-button") + " manager-action-button"}
        onClick={handleToggleEditing}
      >
        <Icon className="manager-edit-icon" src="/img/icon_edit.png" alt="" />
        {isEditing ? "編集中" : "編集"}
      </Button>

      {isEditing ? (
        <>
          <Button
            type="button"
            variant="primary"
            className="manager-save-button manager-action-button"
            onClick={onSaveRequest}
            disabled={isSaveDisabled}
            aria-disabled={isSaveDisabled}
          >
            保存
          </Button>
          <Button
            type="button"
            variant="danger"
            className="manager-cancel-button settings-cancel-button manager-action-button"
            onClick={onCancel}
          >
            キャンセル
          </Button>
        </>
      ) : null}
    </div>
  );
};

export default EditModeControls;
