import { createPortal } from "react-dom";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";

// 変更内容の確認モーダル（molecule）
const ConfirmChangesModal = ({ isOpen, changes, deleteTargets, mode = "save", onCancel, onConfirm }) => {
  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const isDeleteMode = mode === "delete";
  const deleteCount = Array.isArray(deleteTargets) ? deleteTargets.length : 0;

  return createPortal(
    <div className="manager-modal-overlay" role="presentation">
      <div className="manager-modal" role="dialog" aria-modal="true" aria-label={isDeleteMode ? "削除の確認" : "保存の確認"}>
        <div className="manager-modal-header">
          <Heading level={3}>{isDeleteMode ? "削除内容の確認" : "変更内容の確認"}</Heading>
          <TextCaption>
            {isDeleteMode
              ? `${deleteCount}件の分析データを削除します。よろしいですか？`
              : "以下の変更で保存します。よろしいですか？"}
          </TextCaption>
        </div>

        <div className="manager-modal-body">
          {isDeleteMode ? (
            <div className="manager-delete-table-wrap">
              <table className="manager-delete-table">
                <thead>
                  <tr>
                    <th scope="col">名前</th>
                    <th scope="col">社員ID</th>
                  </tr>
                </thead>
                <tbody>
                  {(deleteTargets ?? []).map((target, idx) => (
                    <tr key={`${target.id}-${idx}`}>
                      <td>{target.name}</td>
                      <td>{target.employeeId || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
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
          )}
        </div>

        <div className="manager-modal-actions">
          <Button type="button" variant="danger" className="manager-cancel-button" onClick={onCancel}>
            もう一度確認する
          </Button>
          <Button type="button" variant="primary" className="manager-save-button" onClick={onConfirm}>
            {isDeleteMode ? "はい、削除します" : "はい、保存します"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmChangesModal;
