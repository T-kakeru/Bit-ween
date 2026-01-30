import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

// 変更内容の確認モーダル（molecule）
const ConfirmChangesModal = ({ isOpen, changes, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="manager-modal-overlay" role="presentation">
      <div className="manager-modal" role="dialog" aria-modal="true" aria-label="保存の確認">
        <div className="manager-modal-header">
          <Heading level={3}>変更内容の確認</Heading>
          <TextCaption>以下の変更で保存します。よろしいですか？</TextCaption>
        </div>

        <div className="manager-modal-body">
          <ul className="manager-change-list">
            {(changes ?? []).map((change, idx) => (
              <li key={`${change.id}-${change.key}-${idx}`}>
                <span className="manager-change-name">{change.name}</span>
                <span className="manager-change-label">{change.label}</span>
                <span className="manager-change-from">{change.from}</span>
                <span className="manager-change-arrow">→</span>
                <span className="manager-change-to">{change.to}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="manager-modal-actions">
          <Button type="button" variant="danger" className="manager-cancel-button" onClick={onCancel}>
            もう一度確認する
          </Button>
          <Button type="button" variant="primary" className="manager-save-button" onClick={onConfirm}>
            はい、保存します
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmChangesModal;
