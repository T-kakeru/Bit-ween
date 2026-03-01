import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";
import type { CatalogItem } from "@/shared/logic/catalogStorage";

type Props = {
  item: CatalogItem;
  itemLabel: "部署" | "稼働先" | "稼働状態";
  isEditing: boolean;
  editDraftName: string;
  editError: string | null;
  readOnly?: boolean;
  isSaving?: boolean;
  onEditDraftNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onStartEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
};

export const CatalogListItem = ({
  item,
  itemLabel,
  isEditing,
  editDraftName,
  editError,
  readOnly = false,
  isSaving = false,
  onEditDraftNameChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
}: Props) => {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
    >
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <Input
                type="text"
                value={editDraftName}
                onChange={onEditDraftNameChange}
                placeholder={`${itemLabel}名`}
                disabled={isSaving}
              />
            </div>
            {editError ? <p className="text-xs text-rose-600">{editError}</p> : null}
          </div>
        ) : (
          <div className="text-sm font-semibold text-slate-900 truncate">{item.name}</div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {readOnly ? null : isEditing ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => onSaveEdit(item.id)}>
              保存
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="settings-cancel-button"
              onClick={onCancelEdit}
            >
              キャンセル
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="settings-master-icon-button"
              onClick={() => onStartEdit(item)}
              aria-label={`${itemLabel}を編集`}
              title="編集"
              disabled={isSaving}
            >
              <Icon src="/img/icon_edit.png" alt="編集" />
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="settings-master-icon-button"
              onClick={() => onDelete(item.id)}
              aria-label={`${itemLabel}を削除`}
              title="削除"
              disabled={isSaving}
            >
              <Icon name="×" alt="削除" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
