import Heading from "@/shared/ui/Heading";
import Button from "@/shared/ui/Button";
import TextCaption from "@/shared/ui/TextCaption";

type Props = {
  isOpen: boolean;
  label: string;
  value: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmAddOptionModal = ({ isOpen, label, value, onCancel, onConfirm }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="manager-modal-overlay" role="presentation">
      <div className="manager-modal" role="dialog" aria-modal="true" aria-label="追加の確認">
        <div className="manager-modal-header">
          <Heading level={3}>追加の確認</Heading>
          <TextCaption>「{label}」に以下を追加します。よろしいですか？</TextCaption>
          <TextCaption>追加された項目は設定にて削除することができます。</TextCaption>
        </div>

        <div className="manager-modal-body">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
            {value}
          </div>
        </div>

        <div className="manager-modal-actions">
          <Button type="button" variant="danger" className="manager-cancel-button" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="button" variant="primary" className="manager-save-button" onClick={onConfirm}>
            追加する
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAddOptionModal;
