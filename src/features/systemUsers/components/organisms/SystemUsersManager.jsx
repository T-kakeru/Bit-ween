import { useMemo, useState } from "react";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import { UserPen, UserPlus } from "lucide-react";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import { TableContainer, Table, Th, Td } from "@/shared/ui/Table";
import { useSystemUsersCrud } from "@/features/systemUsers/hooks/useSystemUsersCrud";

const toText = (value) => String(value ?? "").trim();

const toSortableUserName = (systemUser) =>
  toText(systemUser?.display_name || systemUser?.employee_name || systemUser?.email);

const toSortableValue = (systemUser, key) => {
  if (key === "display_name") return toSortableUserName(systemUser).toLowerCase();
  if (key === "email") return toText(systemUser?.email).toLowerCase();
  if (key === "role") return toText(systemUser?.role).toLowerCase();
  if (key === "employee_id") return toText(systemUser?.employee_id);
  if (key === "last_login_at") return Date.parse(toText(systemUser?.last_login_at) || "") || 0;
  if (key === "is_enabled") return Boolean(systemUser?.is_enabled) ? 1 : 0;
  if (key === "updated_at") return Date.parse(toText(systemUser?.updated_at) || "") || 0;
  return toText(systemUser?.[key]);
};

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
  onStartRegister,
}) => {
  const canEdit = currentRole === "admin";
  const { users, updateUser, removeUser, setSystemUserEnabled, resetSystemUserPassword } = useSystemUsersCrud({ companyId });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isTableEditing, setIsTableEditing] = useState(false);
  const [editRows, setEditRows] = useState({});
  const [sort, setSort] = useState({ key: "updated_at", direction: "desc" });

  const sortedSystemUsers = useMemo(() => {
    const directionFactor = sort?.direction === "desc" ? -1 : 1;
    const key = sort?.key || "updated_at";

    return [...users].sort((a, b) => {
      const aValue = toSortableValue(a, key);
      const bValue = toSortableValue(b, key);
      if (aValue === bValue) return 0;
      return aValue > bValue ? directionFactor : -directionFactor;
    });
  }, [users, sort]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (!sort || sort.key !== key) return null;
    if (sort.direction === "asc") return "▲";
    if (sort.direction === "desc") return "▼";
    return null;
  };

  const getAriaSort = (key) => {
    if (!sort || sort.key !== key || !sort.direction) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  };

  const getHeaderClass = (key) => {
    if (!sort || sort.key !== key || !sort.direction) return "manager-th";
    return sort.direction === "asc" ? "manager-th is-sorted-asc" : "manager-th is-sorted-desc";
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
          <Heading level={2} className="manager-card-title">システム利用者管理</Heading>
          <TextCaption>分析対象の社員（Employee）と、ログインする利用者（SystemUser）を分離して管理します。</TextCaption>
          <TextCaption className="mt-1">登録数: {sortedSystemUsers.length}</TextCaption>
        </div>

        <div className="flex items-center gap-2">
          {canEdit ? (
            isTableEditing ? (
              <>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  className="settings-action-button settings-cancel-button system-users-top-action-button"
                  onClick={cancelTableEdit}
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="settings-action-button system-users-top-action-button"
                  onClick={saveTableEdit}
                >
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
                <UserPen className="manager-edit-icon" size={16} aria-hidden="true" />
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
              onClick={onStartRegister}
              disabled={isTableEditing}
            >
              <UserPlus className="manager-edit-icon" size={16} aria-hidden="true" />
              利用者を登録
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

        <div className="mt-4 space-y-2">
          {sortedSystemUsers.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <TextCaption>登録されている利用者はいません。</TextCaption>
            </div>
          ) : (
            <TableContainer className="manager-table-wrap" role="region" aria-label="システム利用者一覧">
              <Table className="manager-table system-users-table">
                <thead>
                  <tr>
                    <Th scope="col" className={getHeaderClass("display_name")} aria-sort={getAriaSort("display_name")}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={sort?.key === "display_name" && sort?.direction ? "manager-sort-button is-sorted" : "manager-sort-button"}
                        onClick={() => toggleSort("display_name")}
                        disabled={isTableEditing}
                        aria-disabled={isTableEditing}
                      >
                        <span className="manager-sort-label">利用者名</span>
                        {getSortIcon("display_name") ? <span className="manager-sort-icon" aria-hidden="true">{getSortIcon("display_name")}</span> : null}
                      </Button>
                    </Th>
                    <Th scope="col" className={getHeaderClass("email")} aria-sort={getAriaSort("email")}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={sort?.key === "email" && sort?.direction ? "manager-sort-button is-sorted" : "manager-sort-button"}
                        onClick={() => toggleSort("email")}
                        disabled={isTableEditing}
                        aria-disabled={isTableEditing}
                      >
                        <span className="manager-sort-label">メールアドレス</span>
                        {getSortIcon("email") ? <span className="manager-sort-icon" aria-hidden="true">{getSortIcon("email")}</span> : null}
                      </Button>
                    </Th>
                    <Th scope="col" className={getHeaderClass("role")} aria-sort={getAriaSort("role")}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={sort?.key === "role" && sort?.direction ? "manager-sort-button is-sorted" : "manager-sort-button"}
                        onClick={() => toggleSort("role")}
                        disabled={isTableEditing}
                        aria-disabled={isTableEditing}
                      >
                        <span className="manager-sort-label">権限</span>
                        {getSortIcon("role") ? <span className="manager-sort-icon" aria-hidden="true">{getSortIcon("role")}</span> : null}
                      </Button>
                    </Th>
                    <Th scope="col" className={getHeaderClass("employee_id")} aria-sort={getAriaSort("employee_id")}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={sort?.key === "employee_id" && sort?.direction ? "manager-sort-button is-sorted" : "manager-sort-button"}
                        onClick={() => toggleSort("employee_id")}
                        disabled={isTableEditing}
                        aria-disabled={isTableEditing}
                      >
                        <span className="manager-sort-label">社員ID</span>
                        {getSortIcon("employee_id") ? <span className="manager-sort-icon" aria-hidden="true">{getSortIcon("employee_id")}</span> : null}
                      </Button>
                    </Th>
                    <Th scope="col" className={getHeaderClass("last_login_at")} aria-sort={getAriaSort("last_login_at")}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={sort?.key === "last_login_at" && sort?.direction ? "manager-sort-button is-sorted" : "manager-sort-button"}
                        onClick={() => toggleSort("last_login_at")}
                        disabled={isTableEditing}
                        aria-disabled={isTableEditing}
                      >
                        <span className="manager-sort-label">最終ログイン</span>
                        {getSortIcon("last_login_at") ? <span className="manager-sort-icon" aria-hidden="true">{getSortIcon("last_login_at")}</span> : null}
                      </Button>
                    </Th>
                    <Th scope="col" className={getHeaderClass("is_enabled")} aria-sort={getAriaSort("is_enabled")}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={sort?.key === "is_enabled" && sort?.direction ? "manager-sort-button is-sorted" : "manager-sort-button"}
                        onClick={() => toggleSort("is_enabled")}
                        disabled={isTableEditing}
                        aria-disabled={isTableEditing}
                      >
                        <span className="manager-sort-label">ステータス</span>
                        {getSortIcon("is_enabled") ? <span className="manager-sort-icon" aria-hidden="true">{getSortIcon("is_enabled")}</span> : null}
                      </Button>
                    </Th>
                    <Th scope="col" className="manager-th system-users-th-actions">
                      {canEdit ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="system-users-th-action-button"
                          onClick={beginTableEdit}
                          disabled={isTableEditing}
                          aria-disabled={isTableEditing}
                        >
                          操作
                        </Button>
                      ) : (
                        <span className="system-users-th-action-label">操作</span>
                      )}
                    </Th>
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
                      <tr key={systemUser.id}>
                        <Td>
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
                        </Td>

                        <Td>
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
                        </Td>

                        <Td>
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
                        </Td>

                        <Td className="text-slate-700">
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
                        </Td>
                        <Td className="text-slate-700">{formatLastLogin(systemUser.last_login_at)}</Td>

                        <Td className="system-users-status-cell">
                          {isTableEditing ? (
                            <div className="inline-flex items-center gap-2">
                              <label className="switch system-users-switch">
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
                                  statusEnabled ? "system-users-status-text--enabled" : "system-users-status-text--disabled"
                                }`}
                              >
                                {statusEnabled ? "有効" : "停止"}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={`text-xs font-semibold system-users-status-text ${
                                statusEnabled ? "system-users-status-text--enabled" : "system-users-status-text--disabled"
                              }`}
                            >
                              {statusEnabled ? "有効" : "停止"}
                            </span>
                          )}
                        </Td>

                        <Td className="system-users-actions-cell">
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
                          ) : <span className="system-users-action-placeholder">-</span>}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
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
