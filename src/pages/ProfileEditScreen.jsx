import { useMemo, useState } from "react";

// プロフィール編集（マイページから遷移する想定）
// - いまは「基本的な個人情報」と「アイコン」を編集できる最小機能に絞る
// - 本番では API 連携（保存・バリデーション・権限）を追加する
const ProfileEditScreen = ({ profile, onSave, onCancel, onBack }) => {
  const initial = useMemo(
    () => ({
      name: profile?.name ?? "",
      department: profile?.department ?? "",
      role: profile?.role ?? "",
      team: profile?.team ?? "",
      status: profile?.status ?? "オンライン",
      avatar: profile?.avatar ?? "",
      bio: profile?.bio ?? "",
    }),
    [profile]
  );

  const [form, setForm] = useState(initial);

  const isDirty = useMemo(() => {
    return (
      form.name !== initial.name ||
      form.department !== initial.department ||
      form.role !== initial.role ||
      form.team !== initial.team ||
      form.status !== initial.status ||
      form.avatar !== initial.avatar ||
      form.bio !== initial.bio
    );
  }, [form, initial]);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.(form);
  };

  const handleCancel = () => {
    if (isDirty) {
      // 破棄確認（ルータ未導入のため、最小UXとして confirm を採用）
      const ok = window.confirm("変更を破棄して戻りますか？");
      if (!ok) return;
    }
    setForm(initial);
    (onCancel ?? onBack)?.();
  };

  const handleAvatarFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("画像ファイル（PNG/JPG など）を選択してください");
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      window.alert("画像サイズが大きすぎます（2MB以下）");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setForm((prev) => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="screen profile-edit-screen">
      <header className="content-header profile-edit-header">
        <div>
          <h1 className="title">プロフィール編集</h1>
        </div>
      </header>

      <form className="card-panel profile-edit-card" onSubmit={handleSubmit}>
        <div className="profile-edit-layout">
          <aside className="profile-edit-aside" aria-label="アイコンと補助設定">
            <div className="profile-edit-avatarPreview" aria-label="現在のアイコン">
              {form.avatar ? (
                <img className="profile-edit-avatarImg" src={form.avatar} alt="現在のアイコン" />
              ) : (
                <div className="profile-edit-avatarPlaceholder" aria-hidden="true">
                  {String(form.name ?? "").trim().slice(0, 1) || "?"}
                </div>
              )}
              <div className="profile-edit-avatarMeta">
                <p className="profile-edit-avatarLabel">アイコン</p>
                <p className="muted small">画像をアップロードして設定します</p>
              </div>
            </div>

            <div className="profile-edit-upload" aria-label="アイコン画像のアップロード">
              <input
                id="avatarFileInput"
                className="profile-edit-fileInput"
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
              />
              <div className="profile-edit-uploadRow">
                <label htmlFor="avatarFileInput" className="profile-edit-uploadButton">
                  画像を選択
                </label>
                <button
                  type="button"
                  className="profile-edit-uploadButton is-ghost"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, avatar: "" }));
                  }}
                  disabled={!form.avatar}
                >
                  削除
                </button>
              </div>
              <p className="muted small">推奨: 正方形 / 2MB以下（PNG/JPG）</p>
            </div>

            <div className="profile-edit-tip">
              <p className="profile-edit-tipTitle">ヒント</p>
              <p className="muted small">部署・役割・ひとことを埋めると、プロフィールの見つけやすさが上がります。</p>
            </div>
          </aside>

          <div className="profile-edit-main">
            <fieldset className="profile-edit-section">
              <legend className="profile-edit-sectionTitle">基本情報</legend>

              <label className="profile-edit-field">
                <span className="profile-edit-fieldLabel">
                  名前 <span className="profile-edit-required">必須</span>
                </span>
                <input
                  className="profile-edit-input"
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="例: 山田 一郎"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="profile-edit-field">
                <span className="profile-edit-fieldLabel">ひとこと</span>
                <textarea
                  className="profile-edit-textarea"
                  rows={4}
                  value={form.bio}
                  onChange={handleChange("bio")}
                  placeholder="例: 社内の知見を集めて循環させたいです"
                />
                <span className="profile-edit-counter" aria-label="文字数">
                  {String(form.bio ?? "").length}/120
                </span>
              </label>
            </fieldset>

            <fieldset className="profile-edit-section">
              <legend className="profile-edit-sectionTitle">所属・役割</legend>
              <div className="profile-edit-grid">
                <label className="profile-edit-field">
                  <span className="profile-edit-fieldLabel">部署</span>
                  <input
                    className="profile-edit-input"
                    type="text"
                    value={form.department}
                    onChange={handleChange("department")}
                    placeholder="例: プロダクト推進部"
                  />
                </label>

                <label className="profile-edit-field">
                  <span className="profile-edit-fieldLabel">役割</span>
                  <input
                    className="profile-edit-input"
                    type="text"
                    value={form.role}
                    onChange={handleChange("role")}
                    placeholder="例: コミュニティマネージャー"
                  />
                </label>

                <label className="profile-edit-field">
                  <span className="profile-edit-fieldLabel">チーム</span>
                  <input
                    className="profile-edit-input"
                    type="text"
                    value={form.team}
                    onChange={handleChange("team")}
                    placeholder="例: OPEN PARK"
                  />
                </label>

                <label className="profile-edit-field">
                  <span className="profile-edit-fieldLabel">ステータス</span>
                  <select className="profile-edit-input" value={form.status} onChange={handleChange("status")}>
                    <option value="オンライン">オンライン</option>
                    <option value="離席中">離席中</option>
                    <option value="オフライン">オフライン</option>
                  </select>
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="profile-edit-actions profile-edit-actions--sticky" role="group" aria-label="操作">
          <div className="profile-edit-actionsLeft">
            {isDirty ? <span className="profile-edit-dirty">未保存の変更があります</span> : <span className="muted small">変更なし</span>}
          </div>
          <div className="profile-edit-actionsRight">
            <button type="button" className="pill-button" onClick={handleCancel}>
              取り消し
            </button>
            <button type="submit" className="pill-button is-primary" disabled={!isDirty}>
              保存
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default ProfileEditScreen;
