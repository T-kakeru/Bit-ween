import Button from "@/shared/ui/Button";
import { ClipboardPenLine } from "lucide-react";

// 編集モード切り替えボタン群（molecule）
const EditModeControls = ({
  isEditing,
  onEditStart,
  onSaveRequest,
  onDeleteRequest,
  onCancel,
  isSaveDisabled = false,
  isDeleteDisabled = false,
}) => {
  const handleToggleEditing = () => {
    onEditStart?.();
  };

  return (
    <div className="manager-edit-actions" aria-label="編集アクション">
      {!isEditing ? (
        <Button
          type="button"
          variant="outline"
          className="manager-edit-button manager-action-button"
          onClick={handleToggleEditing}
        >
          <ClipboardPenLine className="manager-edit-icon" size={16} aria-hidden="true" />
          編集
        </Button>
      ) : (
        <>
          <Button
            type="button"
            variant="danger"
            className="manager-cancel-button settings-cancel-button manager-action-button"
            onClick={onCancel}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="outline"
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
            className="manager-delete-button manager-action-button"
            onClick={onDeleteRequest}
            disabled={isDeleteDisabled}
            aria-disabled={isDeleteDisabled}
          >
            削除
          </Button>
        </>
      )}
    </div>
  );
};

export default EditModeControls;
