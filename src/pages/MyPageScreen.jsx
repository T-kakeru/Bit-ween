import { useMemo, useState } from "react";
import mypageData from "../data/mock/mypage.json";

// マイページは「タブ」ではなく「カードから詳細へ」導線にする
// - 初見でも迷いにくい（次に何をすればよいかが明確）
// - 将来カードを増やしても、UIが破綻しにくい
const viewIds = {
  HOME: "home",
  ENGAGEMENT: "engagement",
  THANKS: "thanks",
  ACTIVITY: "activity",
  NOTIFICATIONS: "notifications",
};

const computeProfileCoverage = (profile) => {
  // 本番ではバックエンドで統一した定義にするのが理想（UIと数値のズレを防ぐ）
  const fields = [
    profile?.name,
    profile?.department,
    profile?.role,
    profile?.team,
    profile?.bio,
    profile?.avatar,
  ];

  const filledCount = fields.filter((value) => String(value ?? "").trim().length > 0).length;
  return Math.round((filledCount / fields.length) * 100);
};

const MyPageScreen = ({ onOpenSettings }) => {
  const [view, setView] = useState(viewIds.HOME);
  const [profile] = useState(mypageData.profile);
  const coverage = useMemo(() => computeProfileCoverage(profile), [profile]);
  const { stats, engagement, recentActivities, thanksHistory } = mypageData;

  return (
    <section className="screen mypage-screen">
      <div className="content-header mypage-header">
        <div>
          <h1 className="title">マイページ</h1>
        </div>
      </div>

      {view === viewIds.HOME ? (
        <div className="mypage-grid">
          {/* プロフィールカード内に編集/通知を組み込み（ヘッダーからは撤去） */}
          <section className="card-panel mypage-card">
            <div className="mypage-card-head">
              <div className="profile-row">
                <span className="avatar" aria-hidden="true">{profile.avatar}</span>
                <div>
                  <p className="profile-name">{profile.name}</p>
                  <p className="muted">{profile.role} / {profile.team}</p>
                  <span className={profile.status === "オフライン" ? "status-chip offline" : "status-chip"}>
                    {profile.status}
                  </span>
                </div>
              </div>
              <div className="mypage-card-actions">
                <button type="button" className="pill-button" onClick={onOpenSettings}>
                  編集
                </button>
                <button type="button" className="pill-button" onClick={() => setView(viewIds.NOTIFICATIONS)}>
                  通知
                </button>
              </div>
            </div>

            <p className="muted">{profile.bio}</p>

            <div className="profile-coverage" aria-label="プロフィール網羅率">
              <div className="profile-coverage-meta">
                <span className="muted">プロフィール網羅率</span>
                <span className="profile-coverage-val">{coverage}%</span>
              </div>
              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={coverage}>
                <div className="progress-fill" style={{ width: `${coverage}%` }} />
              </div>
              {coverage < 80 ? (
                <p className="muted small">部署・役割・ひとことを埋めると、マッチングやおすすめ精度が上がります。</p>
              ) : (
                <p className="muted small">いい感じです。タグを増やすとさらに精度が上がります。</p>
              )}
            </div>

            <div className="tag-list">
              {profile.tags.map((tag) => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="card-panel mypage-card mypage-card-button"
            onClick={() => setView(viewIds.ENGAGEMENT)}
          >
            <div className="mypage-card-head">
              <h3 className="card-title">熱狂度レポート</h3>
              <span className="mypage-card-cta">詳しく見る</span>
            </div>
            <div className="profile-stats">
              <div>
                <p className="stat-number">{engagement.score}%</p>
                <p className="stat-label">熱狂度</p>
              </div>
              <div>
                <p className="stat-number">{engagement.weeklyReactions}</p>
                <p className="stat-label">今週の反応</p>
              </div>
              <div>
                <p className="stat-number">{engagement.streakDays}日</p>
                <p className="stat-label">連続</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            className="card-panel mypage-card mypage-card-button"
            onClick={() => setView(viewIds.THANKS)}
          >
            <div className="mypage-card-head">
              <h3 className="card-title">ありがとう</h3>
              <span className="mypage-card-cta">履歴を見る</span>
            </div>
            <p className="muted">今月の「ありがとう」: {stats.thanks}件</p>
            <p className="mypage-thanks-message">最新: {thanksHistory[0]?.to} さんへ「{thanksHistory[0]?.message}」</p>
          </button>

          <button
            type="button"
            className="card-panel mypage-card mypage-card-button"
            onClick={() => setView(viewIds.ACTIVITY)}
          >
            <div className="mypage-card-head">
              <h3 className="card-title">最近の動き</h3>
              <span className="mypage-card-cta">一覧を見る</span>
            </div>
            <ul className="mypage-list" aria-label="最近の動き">
              {recentActivities.slice(0, 3).map((activity) => (
                <li key={activity.id}>
                  <p className="mypage-list-title">{activity.title}</p>
                  <span className="muted small">{activity.meta}</span>
                </li>
              ))}
            </ul>
          </button>
        </div>
      ) : null}

      {view === viewIds.ENGAGEMENT ? (
        <section className="card-panel">
          <div className="mypage-detail-head">
            <h2 className="mypage-detail-title">熱狂度（エンゲージメント）</h2>
            <button type="button" className="pill-button" onClick={() => setView(viewIds.HOME)}>
              戻る
            </button>
          </div>
          <p className="muted">閲覧・網羅・反応から算出した指標（デモ）</p>
          <div className="profile-coverage">
            <div className="profile-coverage-meta">
              <span className="muted">現在の熱狂度</span>
              <span className="profile-coverage-val">{engagement.score}%</span>
            </div>
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={engagement.score}>
              <div className="progress-fill is-heat" style={{ width: `${engagement.score}%` }} />
            </div>
          </div>
          <div className="profile-stats" style={{ marginTop: 12 }}>
            <div>
              <p className="stat-number">{engagement.weeklyReactions}</p>
              <p className="stat-label">今週の反応</p>
            </div>
            <div>
              <p className="stat-number">{stats.saved}</p>
              <p className="stat-label">保存</p>
            </div>
            <div>
              <p className="stat-number">{stats.read}</p>
              <p className="stat-label">閲覧</p>
            </div>
          </div>
          <div className="tag-list" style={{ marginTop: 12 }}>
            {engagement.focusTags.map((tag) => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
          </div>
        </section>
      ) : null}

      {view === viewIds.THANKS ? (
        <section className="card-panel">
          <div className="mypage-detail-head">
            <h2 className="mypage-detail-title">ありがとう履歴</h2>
            <button type="button" className="pill-button" onClick={() => setView(viewIds.HOME)}>
              戻る
            </button>
          </div>
          <div className="mypage-grid" style={{ marginTop: 12 }}>
            {thanksHistory.map((item) => (
              <section key={item.id} className="card-panel">
                <div className="profile-row">
                  <span className="avatar" aria-hidden="true">💙</span>
                  <div>
                    <p className="profile-name">{item.to} さんへ</p>
                    <p className="muted">{item.date}</p>
                  </div>
                </div>
                <p className="mypage-thanks-message">{item.message}</p>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      {view === viewIds.ACTIVITY ? (
        <section className="card-panel">
          <div className="mypage-detail-head">
            <h2 className="mypage-detail-title">最近の動き</h2>
            <button type="button" className="pill-button" onClick={() => setView(viewIds.HOME)}>
              戻る
            </button>
          </div>
          <ul className="mypage-list" style={{ marginTop: 12 }}>
            {recentActivities.map((activity) => (
              <li key={activity.id}>
                <p className="mypage-list-title">{activity.title}</p>
                <span className="muted small">{activity.meta}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {view === viewIds.NOTIFICATIONS ? (
        <section className="card-panel">
          <div className="mypage-detail-head">
            <h2 className="mypage-detail-title">通知設定</h2>
            <button type="button" className="pill-button" onClick={() => setView(viewIds.HOME)}>
              戻る
            </button>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            ここは次のステップで実装します（デモ）。
          </p>
        </section>
      ) : null}
    </section>
  );
};

export default MyPageScreen;
