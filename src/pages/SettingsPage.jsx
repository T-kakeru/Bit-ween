import { useMemo, useState } from "react";
import settingsData from "@/shared/data/mock/settings.json";
import departmentsData from "@/shared/data/mock/departments.json";
import Heading from "@/shared/ui/Heading";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";
import { SettingsMasterDataPanel } from "@/features/settings/components/organisms/SettingsMasterDataPanel";
import { useAuth } from "@/features/auth/context/AuthContext";

// pages: 画面単位の状態（画面遷移/表示分岐）を統合する
const SettingsPage = () => {
  const { logout } = useAuth();
  const initial = useMemo(() => settingsData, []);
  const [settings, setSettings] = useState(initial);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [profileDraft, setProfileDraft] = useState(() => ({
    name: settings.profile?.name ?? settings.account?.name ?? "",
    department: settings.profile?.department ?? "",
    email: settings.profile?.email ?? "",
    password: settings.profile?.password ?? "Password@123",
  }));

  const profileName = settings.profile?.name ?? settings.account?.name ?? "";
  const profileDepartment = settings.profile?.department ?? "";
  const profileEmail = settings.profile?.email ?? "";
  const profilePassword = settings.profile?.password ?? "Password@123";
  const profileRole = settings.profile?.role ?? settings.account?.role ?? "一般";
  const toMaskedPassword = (value) => {
    const raw = String(value ?? "");
    if (!raw) return "-";
    return "＊".repeat(raw.length);
  };
  const departmentOptions = useMemo(() => {
    const base = Array.isArray(departmentsData) ? departmentsData.map((item) => String(item?.name ?? "").trim()).filter(Boolean) : [];
    const current = String(isProfileEditing ? profileDraft.department : profileDepartment).trim();
    const merged = current && !base.includes(current) ? [current, ...base] : base;
    return Array.from(new Set(merged));
  }, [isProfileEditing, profileDepartment, profileDraft.department]);

  const startProfileEdit = () => {
    setProfileDraft({
      name: profileName,
      department: profileDepartment,
      email: profileEmail,
      password: profilePassword,
    });
    setProfileMessage("");
    setIsProfileEditing(true);
  };

  const cancelProfileEdit = () => {
    setProfileDraft({
      name: profileName,
      department: profileDepartment,
      email: profileEmail,
      password: profilePassword,
    });
    setProfileMessage("");
    setIsProfileEditing(false);
  };

  const saveProfileEdit = () => {
    const nextName = String(profileDraft.name ?? "").trim();
    const nextDepartment = String(profileDraft.department ?? "").trim();
    const nextEmail = String(profileDraft.email ?? "").trim();
    const nextPassword = String(profileDraft.password ?? "").trim();

    setSettings((prev) => {
      const nextProfile = {
        ...(prev.profile ?? {}),
        name: nextName,
        department: nextDepartment,
        email: nextEmail,
        password: nextPassword,
      };
      const subtitlePrefix = String(prev.account?.subtitle ?? "").split("/")[0]?.trim() || "Bit-ween";
      const subtitle = nextDepartment ? `${subtitlePrefix} / ${nextDepartment}` : subtitlePrefix;

      return {
        ...prev,
        profile: nextProfile,
        account: {
          ...(prev.account ?? {}),
          name: nextName || prev.account?.name,
          subtitle,
        },
      };
    });

    setProfileMessage("プロフィールを保存しました");
    setIsProfileEditing(false);
  };

  const handleProfileDraftChange = (field, value) => {
    setProfileDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (profileMessage) setProfileMessage("");
  };

  const handleRequestEmailChange = () => {
    const currentEmail = isProfileEditing ? profileDraft.email : profileEmail;
    const nextEmail = window.prompt("新しいメールアドレスを入力してください", currentEmail ?? "");
    if (nextEmail == null) return;

    const normalized = String(nextEmail).trim();
    if (!normalized) {
      setProfileMessage("メールアドレスが未入力です");
      return;
    }

    if (isProfileEditing) {
      setProfileDraft((prev) => ({ ...prev, email: normalized }));
      setProfileMessage("メールアドレスを更新しました。保存で確定してください");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      profile: {
        ...(prev.profile ?? {}),
        email: normalized,
      },
    }));
    setProfileDraft((prev) => ({ ...prev, email: normalized }));
    setProfileMessage("メールアドレスを更新しました");
  };

  const handleResetPassword = () => {
    const resetValue = "Password@123";
    if (isProfileEditing) {
      setProfileDraft((prev) => ({
        ...prev,
        password: resetValue,
      }));
      setProfileMessage("パスワードをリセットしました。保存で確定してください");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      profile: {
        ...(prev.profile ?? {}),
        password: resetValue,
      },
    }));
    setProfileDraft((prev) => ({ ...prev, password: resetValue }));
    setProfileMessage("パスワードをリセットしました");
  };

  const handleOpenComingSoon = () => {
    if (typeof window === "undefined") return;
    window.history.pushState({}, "", "/coming-soon");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <section className="screen settings-screen">
      <div className="settings-management-grid">
        <Card className="settings-panel settings-menu-card settings-profile-card">
          <div className="settings-menu-card-head">
            <div className="settings-card-title-wrap">
              <Heading level={2}>プロフィール管理</Heading>
              <TextCaption>編集を押すとプロフィール情報を更新できます。</TextCaption>
            </div>

            <div className="flex items-center gap-2">
              {isProfileEditing ? (
                <>
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    className="settings-action-button settings-cancel-button"
                    onClick={cancelProfileEdit}
                  >
                    キャンセル
                  </Button>
                  <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={saveProfileEdit}>
                    保存
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={startProfileEdit}>
                    編集
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="settings-inline-form">
            {isProfileEditing ? (
              <>
                <label className="settings-field">
                  <span className="settings-field-label">氏名</span>
                  <input
                    type="text"
                    value={profileDraft.name}
                    onChange={(e) => handleProfileDraftChange("name", e.target.value)}
                    className="settings-text-input"
                    placeholder="氏名"
                  />
                </label>

                <div className="settings-field">
                  <span className="settings-field-label">権限</span>
                  <input type="text" value={profileRole} className="settings-text-input settings-text-input--readonly" readOnly />
                </div>

                <label className="settings-field">
                  <span className="settings-field-label">部署</span>
                  <select
                    value={profileDraft.department}
                    onChange={(e) => handleProfileDraftChange("department", e.target.value)}
                    className="settings-text-input"
                  >
                    {departmentOptions.map((departmentName) => (
                      <option key={departmentName} value={departmentName}>
                        {departmentName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="settings-field">
                  <span className="settings-field-label">メールアドレス</span>
                  <div className="settings-inline-action-row">
                    <TextCaption className="settings-inline-plain-value">{profileDraft.email || "-"}</TextCaption>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      className="settings-action-button"
                      onClick={handleRequestEmailChange}
                    >
                      メールアドレスを変更
                    </Button>
                  </div>
                </label>

                <div className="settings-field">
                  <span className="settings-field-label">パスワード</span>
                  <div className="settings-password-row">
                    <TextCaption className="settings-inline-plain-value settings-inline-plain-value--muted">
                      {toMaskedPassword(profileDraft.password)}
                    </TextCaption>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      className="settings-action-button"
                      onClick={handleResetPassword}
                    >
                      パスワードをリセット
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="settings-profile-display">
                <div className="settings-profile-preview">
                  <span className="settings-field-label">氏名</span>
                  <TextCaption>{profileName || "-"}</TextCaption>
                </div>

                <div className="settings-profile-preview">
                  <span className="settings-field-label">権限</span>
                  <TextCaption>{profileRole || "-"}</TextCaption>
                </div>

                <div className="settings-profile-preview">
                  <span className="settings-field-label">部署</span>
                  <TextCaption>{profileDepartment || "-"}</TextCaption>
                </div>

                <div className="settings-profile-preview">
                  <span className="settings-field-label">メールアドレス</span>
                  <div className="settings-inline-action-row">
                    <TextCaption className="settings-inline-plain-value">{profileEmail || "-"}</TextCaption>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      className="settings-action-button"
                      onClick={handleRequestEmailChange}
                    >
                      メールアドレスを変更
                    </Button>
                  </div>
                </div>

                <div className="settings-profile-preview">
                  <span className="settings-field-label">パスワード</span>
                  <div className="settings-password-row">
                    <TextCaption className="settings-inline-plain-value settings-inline-plain-value--muted">
                      {toMaskedPassword(profilePassword)}
                    </TextCaption>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      className="settings-action-button"
                      onClick={handleResetPassword}
                    >
                      パスワードをリセット
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {profileMessage ? <p className="text-xs text-emerald-700">{profileMessage}</p> : null}
          </div>
        </Card>

        <SettingsMasterDataPanel />
      </div>

      <Card className="settings-panel settings-menu-card settings-support-card">
        <div className="settings-section-head">
          <Heading level={2}>サポート・その他</Heading>
        </div>

        <div className="settings-support-grid">
          <div className="settings-support-block">
            <p className="settings-row-title">ドキュメント</p>
            <div className="settings-support-links">
              <a
                className="settings-support-link"
                href="https://www.notion.so/help"
                target="_blank"
                rel="noreferrer"
              >
                利用マニュアル
              </a>
              <a
                className="settings-support-link"
                href="https://policies.google.com/privacy?hl=ja"
                target="_blank"
                rel="noreferrer"
              >
                プライバシーポリシー
              </a>
            </div>
          </div>

          <div className="settings-support-block">
            <p className="settings-row-title">システム</p>
            <div className="settings-support-actions">
              <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={handleOpenComingSoon}>
                お問い合わせ
              </Button>
              <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={handleOpenComingSoon}>
                操作ログ管理
              </Button>
              <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={handleOpenComingSoon}>
                更新履歴
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                className="settings-action-button settings-cancel-button"
                onClick={logout}
              >
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* //フェーズ２
      <div className="settings-section-head">
        <Heading level={2}>通知設定</Heading>
      </div>

      <Card className="settings-panel">
        <div className="settings-row">
          <div>
            <p className="settings-title">新着記事</p>
            <TextCaption>新しい記事が公開されたら通知します。</TextCaption>
          </div>
          <label className="switch">
            <Input type="checkbox" checked={settings.delivery.newPosts} onChange={toggle("delivery.newPosts")} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-title">おすすめ記事</p>
            <TextCaption>あなた向けの記事をおすすめします。</TextCaption>
          </div>
          <label className="switch">
            <Input
              type="checkbox"
              checked={settings.delivery.recommendedPosts}
              onChange={toggle("delivery.recommendedPosts")}
            />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-title">週間ダイジェスト</p>
            <TextCaption>週の人気記事をまとめてお知らせします。</TextCaption>
          </div>
          <label className="switch">
            <Input type="checkbox" checked={settings.delivery.weeklyDigest} onChange={toggle("delivery.weeklyDigest")} />
            <span className="switch-slider" />
          </label>
        </div>
      </Card>
      */}
    </section>
  );
};

export default SettingsPage;
