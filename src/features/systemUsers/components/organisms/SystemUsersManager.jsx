import { useMemo, useState } from "react";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import TextCaption from "@/shared/ui/TextCaption";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import { useSystemUsersCrud } from "@/features/systemUsers/hooks/useSystemUsersCrud";

const emptyCreateForm = {
  email: "",
  role: "general",
};

const toText = (value) => String(value ?? "").trim();

const formatLastLogin = (value) => {
  const raw = toText(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}分前`;
  if (diffMinutes < 60 * 24) return `${Math.floor(diffMinutes / 60)}時間前`;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
};

const SystemUsersManager = ({
  companyId = "company-default",
  currentRole = "admin",
  canStartRegister = true,
  onDone,
  onRequestEmployeeRegister,
}) => {
  const canEdit = currentRole === "admin";
  const { users, createUser, updateUser, removeUser, setSystemUserEnabled, resetSystemUserPassword } = useSystemUsersCrud({ companyId });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [isTableEditing, setIsTableEditing] = useState(false);
  const [editRows, setEditRows] = useState({});

  const sortedSystemUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aTime = Date.parse(a?.updated_at || "") || 0;
      const bTime = Date.parse(b?.updated_at || "") || 0;
      return bTime - aTime;
    });
  }, [users]);

  const resetCreate = () => {
    setError("");
    setSuccess("");
    setCreateForm(emptyCreateForm);
  };

  const openCreate = () => {
    resetCreate();
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    resetCreate();
  };

  const handleCreate = () => {
    const email = String(createForm.email || "").trim();
    const role = String(createForm.role || "").trim().toLowerCase();
    if (!email) {
      setError("メールアドレスは必須です");
      return;
    }
    if (role !== "admin" && role !== "general") {
      setError("権限は admin または general を選択してください");
      return;
    }

    setError("");

    if (typeof onRequestEmployeeRegister === "function") {
      onRequestEmployeeRegister({ email, role });
      return;
    }

    const result = createUser({
      email,
      role,
      employeeCode: "",
      employeeName: "",
      displayName: email.split("@")[0],
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess("利用者を作成しました");
    closeCreate();
  };

  const beginTableEdit = () => {
    const draft = {};
    sortedSystemUsers.forEach((systemUser) => {
      const id = String(systemUser?.id || "");
      if (!id) return;
      draft[id] = {
        display_name: String(systemUser?.display_name || systemUser?.employee_name || ""),
        email: String(systemUser?.email || ""),
        role: String(systemUser?.role || "general"),
        employee_id: String(systemUser?.employee_id || ""),
        is_enabled: Boolean(systemUser?.is_enabled),
      };
    });
    setEditRows(draft);
    setIsTableEditing(true);
    setError("");
    setSuccess("");
  };

  const cancelTableEdit = () => {
    setIsTableEditing(false);
    setEditRows({});
  };

  const handleDraftChange = (id, key, value) => {
    setEditRows((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [key]: value,
      },
    }));
  };

  const saveTableEdit = () => {
    for (const systemUser of sortedSystemUsers) {
      const id = String(systemUser?.id || "");
      if (!id) continue;
      const draft = editRows[id] || {};

      const updateResult = updateUser(id, {
        email: draft.email,
        role: draft.role,
        display_name: draft.display_name,
        employee_id: draft.employee_id,
      });

      if (!updateResult.ok) {
        setError(updateResult.message);
        return;
      }

      const enabledResult = setSystemUserEnabled(id, Boolean(draft.is_enabled));
      if (!enabledResult.ok) {
        setError(enabledResult.message || "ステータス更新に失敗しました");
        return;
      }
    }

    setSuccess("利用者を更新しました");
    cancelTableEdit();
  };

  return (
    <Card className="settings-panel">
      <div className="settings-row">
        <div>
          <TextCaption>分析対象の社員（Employee）と、ログインする利用者（SystemUser）を分離して管理します。</TextCaption>
          <TextCaption className="mt-1">登録数: {sortedSystemUsers.length}</TextCaption>
        </div>

        <div className="flex items-center gap-2">
          {canEdit ? (
            isTableEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="settings-action-button settings-cancel-button"
                  onClick={cancelTableEdit}
                >
                  キャンセル
                </Button>
                <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={saveTableEdit}>
                  保存
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="md"
                className="settings-action-button system-users-top-action-button"
                onClick={beginTableEdit}
              >
                <Icon className="manager-edit-icon" src="/img/icon_edit.png" alt="" />
                編集
              </Button>
            )
          ) : null}

          {canEdit && canStartRegister ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              className="settings-action-button system-users-top-action-button"
              onClick={openCreate}
              disabled={isTableEditing}
            >
              <Icon className="manager-edit-icon" src="/img/default.png" alt="" />
              利用者を追加
            </Button>
          ) : null}
          {typeof onDone === "function" ? (
            <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={onDone}>
              閉じる
            </Button>
          ) : null}
        </div>
      </div>

      <div className="px-6 pb-5">
        {success ? <p className="mt-2 text-xs text-emerald-700">{success}</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}

        {isCreateOpen ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">利用者追加</p>
            <TextCaption className="mt-1">メール入力後、必要に応じて社員登録フローへ進めます。</TextCaption>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <Input
                type="text"
                value={createForm.email}
                onChange={(e) => {
                  setCreateForm((prev) => ({ ...prev, email: e.target.value }));
                  if (error) setError("");
                }}
                placeholder="email（必須）"
              />
              <Select
                value={createForm.role}
                onChange={(e) => {
                  setCreateForm((prev) => ({ ...prev, role: e.target.value }));
                  if (error) setError("");
                }}
              >
                <option value="general">general（一般）</option>
                <option value="admin">admin（管理者）</option>
              </Select>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" className="settings-cancel-button" onClick={closeCreate}>
                キャンセル
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="settings-action-button"
                onClick={handleCreate}
              >
                追加
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          {sortedSystemUsers.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <TextCaption>登録されている利用者はいません。</TextCaption>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">利用者名</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">メールアドレス</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">権限</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">紐付け社員ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">最終ログイン</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">ステータス</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSystemUsers.map((systemUser) => {
                    const rowId = String(systemUser.id);
                    const draft = editRows[rowId] || {};
                    const roleValue = isTableEditing ? String(draft.role || "general") : String(systemUser.role || "general");
                    const roleLabel = roleValue === "admin" ? "管理者" : "一般";
                    const statusEnabled = isTableEditing ? Boolean(draft.is_enabled) : Boolean(systemUser.is_enabled);

                    return (
                      <tr key={systemUser.id} className="border-t border-slate-200 align-top">
                        <td className="px-3 py-2">
                          {isTableEditing ? (
                            <Input
                              type="text"
                              value={String(draft.display_name || "")}
                              onChange={(e) => handleDraftChange(rowId, "display_name", e.target.value)}
                              placeholder="利用者名"
                            />
                          ) : (
                            <span className="font-medium text-slate-900">
                              {toText(systemUser.display_name || systemUser.employee_name || systemUser.email)}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          {isTableEditing ? (
                            <Input
                              type="text"
                              value={String(draft.email || "")}
                              onChange={(e) => handleDraftChange(rowId, "email", e.target.value)}
                              placeholder="メールアドレス"
                            />
                          ) : (
                            <span className="text-slate-800">{systemUser.email}</span>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          {isTableEditing ? (
                            <Select
                              value={roleValue}
                              onChange={(e) => handleDraftChange(rowId, "role", e.target.value)}
                            >
                              <option value="general">一般</option>
                              <option value="admin">管理者</option>
                            </Select>
                          ) : (
                            <span className="text-sm font-medium text-slate-700">{roleLabel}</span>
                          )}
                        </td>

                        <td className="px-3 py-2 text-slate-700">
                          {isTableEditing ? (
                            <Input
                              type="text"
                              value={String(draft.employee_id || "")}
                              onChange={(e) => handleDraftChange(rowId, "employee_id", e.target.value)}
                              placeholder="社員ID"
                            />
                          ) : (
                            toText(systemUser.employee_id) || "-"
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{formatLastLogin(systemUser.last_login_at)}</td>

                        <td className="px-3 py-2 system-users-status-cell">
                          {isTableEditing ? (
                            <div className="inline-flex items-center gap-2">
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={statusEnabled}
                                  onChange={(e) => {
                                    if (!canEdit || !isTableEditing) return;
                                    handleDraftChange(rowId, "is_enabled", e.target.checked);
                                  }}
                                  disabled={!canEdit || !isTableEditing}
                                />
                                <span className="switch-slider" />
                              </label>
                              <span
                                className={`text-xs font-semibold system-users-status-text ${
                                  statusEnabled ? "text-emerald-700" : "text-slate-500"
                                }`}
                              >
                                {statusEnabled ? "有効" : "停止"}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={`text-xs font-semibold system-users-status-text ${
                                statusEnabled ? "text-emerald-700" : "text-slate-500"
                              }`}
                            >
                              {statusEnabled ? "有効" : "停止"}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2 text-right system-users-actions-cell">
                          {isTableEditing && canEdit ? (
                            <div className="inline-flex items-center gap-2 system-users-row-actions">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="system-users-row-action-button"
                                onClick={() => {
                                  const result = resetSystemUserPassword(systemUser.id);
                                  if (!result.ok) {
                                    setError(result.message);
                                    return;
                                  }
                                  setSuccess(result.message);
                                }}
                              >
                                パスワードリセット
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                className="system-users-row-action-button"
                                onClick={() => {
                                  const ok = window.confirm("この利用者を削除しますか？");
                                  if (!ok) return;
                                  removeUser(systemUser.id);
                                  setSuccess("利用者を削除しました");
                                }}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Icon name="🗑" alt="" />
                                  削除
                                </span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!canEdit ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <TextCaption>一般利用者は閲覧のみ可能です。追加・編集・削除は管理者のみ実行できます。</TextCaption>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

export default SystemUsersManager;
