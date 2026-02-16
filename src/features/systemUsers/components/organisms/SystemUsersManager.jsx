import { useState } from "react";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import TextCaption from "@/shared/ui/TextCaption";
import { useSystemUsersCrud } from "@/features/systemUsers/hooks/useSystemUsersCrud";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none";

const emptyEmailForm = {
  email: "",
};

const SystemUsersManager = ({
  companyId = "company-default",
  currentRole = "admin",
  canStartRegister = true,
  onDone,
  onRequestEmployeeRegister,
}) => {
  const canEdit = currentRole === "admin";
  const { users, updateUser, removeUser } = useSystemUsersCrud({ companyId });

  const [view, setView] = useState("list");
  const [step, setStep] = useState("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [emailForm, setEmailForm] = useState(emptyEmailForm);

  const [editingId, setEditingId] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [editingRole, setEditingRole] = useState("general");

  const resetRegister = () => {
    setStep("email");
    setError("");
    setSuccess("");
    setEmailForm(emptyEmailForm);
  };

  const openRegister = () => {
    resetRegister();
    setView("register");
  };

  const closeRegister = () => {
    setView("list");
    resetRegister();
  };

  const handleNext = () => {
    const email = String(emailForm.email || "").trim();
    if (!email) {
      setError("メールアドレスは必須です");
      return;
    }
    setError("");
    if (typeof onRequestEmployeeRegister === "function") {
      onRequestEmployeeRegister(email);
      return;
    }
    setError("次の登録画面へ遷移できません。社員情報一覧からお試しください。");
  };

  const startEdit = (user) => {
    setEditingId(String(user?.id || ""));
    setEditingEmail(String(user?.email || ""));
    setEditingRole(String(user?.role || "general"));
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingEmail("");
    setEditingRole("general");
  };

  const saveEdit = () => {
    const result = updateUser(editingId, { email: editingEmail, role: editingRole });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess("利用者を更新しました");
    cancelEdit();
  };

  return (
    <Card className="settings-panel">
      <div className="settings-row">
        <div>
          <p className="settings-title">システム利用者管理</p>
          <TextCaption>admin は登録・編集・削除、general は閲覧のみです。</TextCaption>
          <TextCaption className="mt-1">登録数: {users.length}</TextCaption>
        </div>

        <div className="flex items-center gap-2">
          {view === "list" && canEdit && canStartRegister ? (
            <Button type="button" variant="outline" size="sm" onClick={openRegister}>
              ユーザー登録
            </Button>
          ) : null}
          {view === "register" ? (
            <Button type="button" variant="outline" size="sm" onClick={closeRegister}>
              一覧へ戻る
            </Button>
          ) : null}
          {typeof onDone === "function" ? (
            <Button type="button" variant="outline" size="sm" onClick={onDone}>
              閉じる
            </Button>
          ) : null}
        </div>
      </div>

      <div className="px-6 pb-5">
        {success ? <p className="mt-2 text-xs text-emerald-700">{success}</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}

        {view === "register" && step === "email" ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">ステップ1: ユーザー情報（メール）</p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <input
                type="text"
                value={emailForm.email}
                onChange={(e) => {
                  setEmailForm({ email: e.target.value });
                  if (error) setError("");
                }}
                placeholder="email（必須）"
                className={inputClassName}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="button" size="sm" onClick={handleNext}>
                次へ
              </Button>
            </div>
          </div>
        ) : null}

        {view === "list" ? (
          <div className="mt-4 space-y-2">
            {users.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <TextCaption>登録されている利用者はいません。</TextCaption>
              </div>
            ) : null}

            {users.map((user) => {
              const isEditing = editingId === String(user.id);
              return (
                <div key={user.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <input type="text" value={editingEmail} onChange={(e) => setEditingEmail(e.target.value)} className={inputClassName} />
                      <input type="text" value={editingRole} onChange={(e) => setEditingRole(e.target.value)} className={inputClassName} />
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>キャンセル</Button>
                        <Button type="button" size="sm" onClick={saveEdit}>保存</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                        <p className="mt-0.5 text-xs text-slate-500">role: {user.role}</p>
                        <p className="mt-0.5 text-xs text-slate-500">従業員: {user.employee_name || "-"} / {user.employee_id || "-"}</p>
                        <p className="mt-0.5 text-xs text-slate-400">created: {user.created_at} / updated: {user.updated_at}</p>
                      </div>

                      {canEdit ? (
                        <div className="flex shrink-0 items-center gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(user)}>
                            編集
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const ok = window.confirm("この利用者を削除しますか？");
                              if (!ok) return;
                              removeUser(user.id);
                              setSuccess("利用者を削除しました");
                            }}
                          >
                            削除
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default SystemUsersManager;
