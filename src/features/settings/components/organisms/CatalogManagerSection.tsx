import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";
import type { CatalogKey } from "@/shared/logic/catalogStorage";
import type { CatalogItemLabel } from "@/shared/logic/catalogValidation";
import { useCatalogManager } from "@/features/settings/hooks/useCatalogManager";
import { CatalogListItem } from "@/features/settings/components/molecules/CatalogListItem";

type Props = {
  title: string;
  description: string;
  keyName: CatalogKey;
  itemLabel: CatalogItemLabel;
  embedded?: boolean;
  readOnly?: boolean;
};

export const CatalogManagerSection = ({
  title,
  description,
  keyName,
  itemLabel,
  embedded = false,
  readOnly = false,
}: Props) => {
  const {
    isOpen,
    isSaving,
    saveError,
    newName,
    addError,
    editingId,
    editDraftName,
    editError,
    displayItems,
    shouldShowList,
    itemCount,
    handleOpenManage,
    handleCancelManage,
    handleSaveManage,
    handleAdd,
    startEdit,
    cancelEdit,
    deleteItem,
    handleSaveEdit,
    handleNewNameChange,
    handleEditDraftNameChange,
  } = useCatalogManager({ keyName, itemLabel, readOnly });

  const containerClassName = embedded
    ? `settings-master-item ${isOpen ? "is-open" : ""}`
    : `settings-panel settings-menu-card ${isOpen ? "is-open settings-menu-card-span" : ""}`;

  const content = (
    <>
      <div className="settings-menu-card-head">
        <div>
          <p className="settings-title">{title}</p>
          <TextCaption>{description}</TextCaption>
          <TextCaption className="mt-1">登録数: {itemCount}</TextCaption>
        </div>

        <div className="flex items-center gap-2">
          {readOnly ? null : isOpen ? (
            <>
              <Button
                type="button"
                variant="danger"
                size="md"
                className="settings-action-button settings-cancel-button"
                onClick={handleCancelManage}
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="settings-action-button"
                onClick={handleSaveManage}
                disabled={isSaving}
              >
                保存
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="md"
              className="settings-action-button"
              onClick={handleOpenManage}
              aria-expanded={isOpen}
            >
              管理する
            </Button>
          )}
        </div>
      </div>

      {shouldShowList ? (
        <div className="px-6 pb-5">
          {saveError ? <p className="mt-3 text-xs text-rose-600">{saveError}</p> : null}
          {!readOnly ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">新規{itemLabel}追加</div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  type="text"
                  value={newName}
                  onChange={handleNewNameChange}
                  placeholder={`${itemLabel}名`}
                  disabled={isSaving}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="settings-action-button"
                    onClick={handleAdd}
                    disabled={isSaving}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon src="/img/icon_file_add.png" alt="追加" />
                      追加
                    </span>
                  </Button>
                </div>
              </div>
              {addError ? <p className="mt-2 text-xs text-rose-600">{addError}</p> : null}
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {displayItems.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <TextCaption>まだ登録がありません。</TextCaption>
              </div>
            ) : null}

            {displayItems.map((item) => (
              <CatalogListItem
                key={item.id}
                item={item}
                itemLabel={itemLabel}
                isEditing={editingId === item.id}
                editDraftName={editDraftName}
                editError={editError}
                readOnly={readOnly}
                isSaving={isSaving}
                onEditDraftNameChange={handleEditDraftNameChange}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={cancelEdit}
                onStartEdit={startEdit}
                onDelete={deleteItem}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className={containerClassName}>{content}</div>;
  }

  return <Card className={containerClassName}>{content}</Card>;
};
