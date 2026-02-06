import { useMemo, useState } from "react";
import settingsData from "@/shared/data/mock/settings.json";
import ProfileEditPage from "./ProfileEditPage";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import TextCaption from "@/shared/ui/TextCaption";
import { SettingsMasterDataPanel } from "@/features/settings/components/organisms/SettingsMasterDataPanel";

// pages: 画面単位の状態（画面遷移/表示分岐）を統合する
const SettingsPage = () => {
  const [view, setView] = useState("root");

  const initial = useMemo(() => settingsData, []);
  const [settings, setSettings] = useState(initial);

  const toggle = (path) => (event) => {
    const checked = event.target.checked;
    setSettings((prev) => {
      const next = structuredClone(prev);
      const [group, key] = path.split(".");
      next[group][key] = checked;
      return next;
    });
  };

  if (view === "profile") {
    return (
      <ProfileEditPage
        profile={settings.profile}
        onCancel={() => setView("root")}
        onSave={(nextProfile) => {
          setSettings((prev) => {
            const merged = { ...prev, profile: { ...(prev.profile ?? {}), ...nextProfile } };
            const name = merged.profile?.name ?? prev.account?.name;
            const team = merged.profile?.team ?? "";
            const department = merged.profile?.department ?? "";
            const subtitle = [team, department].filter(Boolean).join(" / ") || prev.account?.subtitle;
            return {
              ...merged,
              account: {
                ...(prev.account ?? {}),
                name: name ?? prev.account?.name,
                subtitle,
              },
            };
          });
          setView("root");
        }}
      />
    );
  }

  const heroName = settings.profile?.name ?? settings.account?.name;
  const heroSubtitle =
    [settings.profile?.team, settings.profile?.department].filter(Boolean).join(" / ") ||
    settings.account?.subtitle;

  return (
    <section className="screen settings-screen">
      <Card className="settings-hero">
        <div className="settings-hero-row">
          <div>
            <p className="settings-hero-name">{heroName}</p>
            <TextCaption>{heroSubtitle}</TextCaption>
          </div>
          <Button type="button" variant="primary" onClick={() => setView("profile")}>
            プロフィールを確認・編集
          </Button>
        </div>
      </Card>

      {/* オファー設定は削除されました（項目ごと削除の要望により）。 */}

      <SettingsMasterDataPanel />

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
    </section>
  );
};

export default SettingsPage;
