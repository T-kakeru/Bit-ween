import { useMemo, useState } from "react";
import settingsData from "@/shared/data/mock/settings.json";
import Heading from "@/shared/ui/Heading";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import Button from "@/shared/ui/Button";
import { SettingsMasterDataPanel } from "@/features/settings/components/organisms/SettingsMasterDataPanel";

// pages: 画面単位の状態（画面遷移/表示分岐）を統合する
const SettingsPage = () => {
  const initial = useMemo(() => settingsData, []);
  const [settings, setSettings] = useState(initial);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

  const startProfileEdit = () => {
    setProfileDraft({
      name: profileName,
      department: profileDepartment,
      email: profileEmail,
      password: profilePassword,
    });
    setProfileMessage("");
    setIsPasswordVisible(false);
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
    setIsPasswordVisible(false);
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
    setIsPasswordVisible(false);
    setIsProfileEditing(false);
  };

  const handleProfileDraftChange = (field, value) => {
    setProfileDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (profileMessage) setProfileMessage("");
  };

  const handleResetPassword = () => {
    setProfileDraft((prev) => ({
      ...prev,
      password: "Password@123",
    }));
    setProfileMessage("パスワードをリセットしました");
    setIsPasswordVisible(false);
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
                    variant="outline"
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
                <Button type="button" variant="outline" size="md" className="settings-action-button" onClick={startProfileEdit}>
                  編集
                </Button>
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

                <label className="settings-field">
                  <span className="settings-field-label">メールアドレス</span>
                  <input
                    type="email"
                    value={profileDraft.email}
                    onChange={(e) => handleProfileDraftChange("email", e.target.value)}
                    className="settings-text-input"
                    placeholder="メールアドレス"
                  />
                </label>

                <label className="settings-field">
                  <span className="settings-field-label">部署</span>
                  <input
                    type="text"
                    value={profileDraft.department}
                    onChange={(e) => handleProfileDraftChange("department", e.target.value)}
                    className="settings-text-input"
                    placeholder="部署"
                  />
                </label>

                <div className="settings-field">
                  <span className="settings-field-label">パスワード</span>
                  <div className="settings-password-row">
                    <div className="settings-password-input-wrap">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        value={profileDraft.password}
                        onChange={(e) => handleProfileDraftChange("password", e.target.value)}
                        className="settings-text-input"
                        placeholder="パスワード"
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="settings-password-toggle"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                        aria-label={isPasswordVisible ? "パスワードを隠す" : "パスワードを表示"}
                        title={isPasswordVisible ? "隠す" : "表示"}
                      >
                        {isPasswordVisible ? "🙈" : "👁"}
                      </Button>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleResetPassword}>
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
                  <span className="settings-field-label">メールアドレス</span>
                  <TextCaption>{profileEmail || "-"}</TextCaption>
                </div>

                <div className="settings-profile-preview">
                  <span className="settings-field-label">部署</span>
                  <TextCaption>{profileDepartment || "-"}</TextCaption>
                </div>

                <div className="settings-profile-preview">
                  <span className="settings-field-label">パスワード</span>
                  <TextCaption>********</TextCaption>
                </div>
              </div>
            )}

            <div className="settings-profile-preview">
              <TextCaption>{isProfileEditing ? profileDraft.name || "-" : profileName || "-"}</TextCaption>
              <TextCaption>
                {isProfileEditing
                  ? [profileDraft.email, profileDraft.department].filter(Boolean).join(" / ") || "メールアドレス・部署未設定"
                  : [profileEmail, profileDepartment].filter(Boolean).join(" / ") || "メールアドレス・部署未設定"}
              </TextCaption>
            </div>

            {profileMessage ? <p className="text-xs text-emerald-700">{profileMessage}</p> : null}
          </div>
        </Card>

        <SettingsMasterDataPanel />
      </div>

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
