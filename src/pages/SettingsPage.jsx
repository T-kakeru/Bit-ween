import { useMemo, useState } from "react";
import settingsData from "@/shared/data/mock/settings.json";
import ProfileEditPage from "./ProfileEditPage";

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
      <div className="content-header">
        <div>
          <h1 className="title">設定</h1>
        </div>
      </div>

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
          詳細
        </a>
      </div>

      <section className="card-panel settings-panel">
        <div className="settings-row">
          <div>
            <p className="settings-title">スカウトを受け取る</p>
            <p className="muted">他社からのスカウトを受け取ります。</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={settings.offer.receiveOffers} onChange={toggle("offer.receiveOffers")} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-title">ダイレクトオファーを受け取る</p>
            <p className="muted">より精度の高いオファーを受け取ります。</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={settings.offer.receiveDirectOffers} onChange={toggle("offer.receiveDirectOffers")} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-title">ブロック企業</p>
            <p className="muted">ブロック中の企業はオファーが届きません。</p>
          </div>
          <div className="tag-list">
            {settings.offer.blockedCompanies.map((company) => (
              <span key={company} className="tag-chip">{company}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="settings-section-head">
        <h2 className="title">通知設定</h2>
      </div>

      <section className="card-panel settings-panel">
        <div className="settings-row">
          <div>
            <p className="settings-title">新着記事</p>
            <p className="muted">新しい記事が公開されたら通知します。</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={settings.delivery.newPosts} onChange={toggle("delivery.newPosts")} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-title">おすすめ記事</p>
            <p className="muted">あなた向けの記事をおすすめします。</p>
          </div>
          <label className="switch">
            <input
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
            <p className="muted">週の人気記事をまとめてお知らせします。</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={settings.delivery.weeklyDigest} onChange={toggle("delivery.weeklyDigest")} />
            <span className="switch-slider" />
          </label>
        </div>
      </section>
    </section>
  );
};

export default SettingsPage;
