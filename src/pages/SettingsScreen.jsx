import { useMemo, useState } from "react";
import settingsData from "../data/mock/settings.json";
import ProfileEditScreen from "./ProfileEditScreen";

// 設定画面（縦並びメニュー）
// 目的:
// - 「変更するもの」だけを集め、ユーザーが迷わない導線にする
// - マイページ（自分の情報/活動）と分離し、権限/運用設計もしやすくする
const SettingsScreen = () => {
  // 画面内遷移（ルータ未導入のため、まずはローカル状態で簡易実装）
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
      <ProfileEditScreen
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
    [settings.profile?.team, settings.profile?.department].filter(Boolean).join(" / ") || settings.account?.subtitle;

  return (
    <section className="screen settings-screen">
      <div className="content-header">
        <div>
          <h1 className="title">設定</h1>
        </div>
      </div>

      {/* 先頭に「プロフィール編集」を置く（迷子になりやすいので固定導線にする） */}
      <section className="card-panel settings-hero">
        <div className="settings-hero-row">
          <div>
            <p className="settings-hero-name">{heroName}</p>
            <p className="muted">{heroSubtitle}</p>
          </div>
          <button type="button" className="primary-button" onClick={() => setView("profile")}>
            プロフィールを確認・編集
          </button>
        </div>
      </section>

      <div className="settings-section-head">
        <h2 className="title">オファーに関する設定</h2>
        <a className="settings-link" href="#" onClick={(e) => e.preventDefault()}>
          詳細はこちら
        </a>
      </div>

      <section className="card-panel settings-card">
        <div className="settings-row">
          <div className="settings-row-text">
            <p className="settings-row-title">オファーの受信</p>
          </div>
          <label className="switch" aria-label="オファーの受信">
            <input type="checkbox" checked={settings.offer.receiveOffers} onChange={toggle("offer.receiveOffers")} />
            <span className="switch-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <p className="settings-row-title">ダイレクトオファーの受信</p>
          </div>
          <label className="switch" aria-label="ダイレクトオファーの受信">
            <input
              type="checkbox"
              checked={settings.offer.receiveDirectOffers}
              onChange={toggle("offer.receiveDirectOffers")}
            />
            <span className="switch-slider" />
          </label>
        </div>

        <button type="button" className="settings-row settings-row-button" onClick={() => {}}>
          <div className="settings-row-text">
            <p className="settings-row-title">企業ブロック設定</p>
          </div>
          <span className="settings-row-meta">設定済</span>
          <span className="settings-chevron" aria-hidden="true">›</span>
        </button>
      </section>

      <div className="settings-section-head">
        <h2 className="title">配信設定</h2>
        <a className="settings-link" href="#" onClick={(e) => e.preventDefault()}>
          配信メールの詳細はこちら
        </a>
      </div>

      <section className="card-panel settings-card">
        <div className="settings-row">
          <div className="settings-row-text">
            <p className="settings-row-title">新着記事の配信</p>
          </div>
          <label className="switch" aria-label="新着記事の配信">
            <input type="checkbox" checked={settings.delivery.newPosts} onChange={toggle("delivery.newPosts")} />
            <span className="switch-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <p className="settings-row-title">おすすめ記事の配信</p>
          </div>
          <label className="switch" aria-label="おすすめ記事の配信">
            <input
              type="checkbox"
              checked={settings.delivery.recommendedPosts}
              onChange={toggle("delivery.recommendedPosts")}
            />
            <span className="switch-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-text">
            <p className="settings-row-title">週次ダイジェスト</p>
            <p className="muted small">まとめて読む派におすすめ</p>
          </div>
          <label className="switch" aria-label="週次ダイジェスト">
            <input
              type="checkbox"
              checked={settings.delivery.weeklyDigest}
              onChange={toggle("delivery.weeklyDigest")}
            />
            <span className="switch-slider" />
          </label>
        </div>
      </section>
    </section>
  );
};

export default SettingsScreen;
